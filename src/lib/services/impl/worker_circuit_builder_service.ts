import type { ComponentRenderingData, Junction, Circuit } from "$lib/models/circuit";
import type { CircuitBuilderService } from "../circuit_builder_serivce";
import Worker from "$lib/circuit_builder_worker?worker";
import type { WorkerResponse, WorkerMessage } from "$lib/circuit_builder_worker";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { ComponentRef } from "$lib/models/component_ref";
import type { ConnectorLink, Wire } from "$lib/models/wire";
import { copy } from "$lib/util/common";


export class WorkerCircuitBuilderService implements CircuitBuilderService {

    private worker: Worker;
    private resolves = {};
    private rejects = {};
    //Used for numbering promises
    private idCounter: number;

    init() {
        this.worker = new Worker();
        this.initWorker();
        this.resolves = {};
        this.rejects = {};
        this.idCounter = 0;
    }

    private initWorker(): void {
        this.worker.onmessage = (e) => {
            const data: WorkerResponse = e.data;
            this.handleMessageFromWorker(data);
        }
        this.worker.onerror = (e) => {
            console.error(e);
        }
    }

    private handleMessageFromWorker(msg: WorkerResponse) {
        const { id, action, payload, err } = msg;
        if (action && payload) {
            const resolve = this.resolves[id];
            if (resolve) {
                resolve(payload);
            }
        } else {
            // error condition
            const reject = this.rejects[id]
            if (reject) {
                if (err) {
                    reject(err);
                } else {
                    reject('Got nothing');
                }
            }
        }
        delete this.resolves[id];
        delete this.rejects[id];
    }

    dispose() {
        if (this.worker != null) {
            this.worker.terminate();
        }
    }

    deductConnections(circuit: Circuit): Promise<Circuit> {
        const msgId = this.idCounter++;
        const msg: WorkerMessage = {
            action: 'deductConnections',
            payload: circuit,
            id: msgId
        }

        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }

    async addNewComponent(circuit: Circuit, definition: ComponentDefinition, x: number, y: number): Promise<[Circuit, ComponentRef]> {
        const circuitCopy: Circuit = copy(circuit)
        const id = circuitCopy.components.length;
        const component: ComponentRef = {
            id: id,
            definitionId: definition.id
        }
        const componentRenderingData: ComponentRenderingData = {
            x: x,
            y: y,
            id: circuitCopy.components.length
        }
        circuitCopy.metadata.rendering.components.push(componentRenderingData);
        circuitCopy.components.push(component);
        return [circuitCopy, component];
    }

    async popComponent(circuit: Circuit): Promise<Circuit> {
        const circuitCopy: Circuit = copy(circuit);
        circuitCopy.metadata.rendering.components.pop();
        circuitCopy.components.pop();
        return circuitCopy;
    }

    async moveComponent(circuit: Circuit, id: number, x: number, y: number): Promise<Circuit> {
        const circuitCopy = copy(circuit)
        const componentRenderingData: ComponentRenderingData = {
            id,
            x,
            y,
        };

        circuitCopy.metadata.rendering.components[id] = componentRenderingData;
        this.disconnectConnectorsForComponent(circuitCopy, id);
        return circuitCopy;
    }

    private disconnectConnectorsForComponent(circuit: Circuit, id: number): void {
        // We only disconnect connections in rendering because the real sim connections will be deducted from rendering
        circuit.metadata.rendering.wires
            .forEach(wire => {
                wire.links = wire.links.filter(link => {
                    if (link.type == 'wire') {
                        return true;
                    } else {
                        return (link.value as ConnectorLink).conn.componentId != id;
                    }
                });
            });

    }

    async addNewWire(circuit: Circuit, wire: Wire, junctions: Junction[]): Promise<Circuit> {
        const circuitCopy: Circuit = copy(circuit);
        circuitCopy.metadata.rendering.wires.push(wire);
        for (const junction of junctions) {
            if (junction != null) {
                circuitCopy.metadata.rendering.junctions.push(junction);
            }
        }
        return circuitCopy;
    }

    async deleteComponent(circuit: Circuit, componentId: number): Promise<Circuit> {
        const circuitCopy: Circuit = copy(circuit);
        this.disconnectConnectorsForComponent(circuitCopy, componentId);

        circuitCopy.metadata.rendering.components.splice(componentId, 1)
        circuitCopy.metadata.rendering.components.forEach((component, id) => {
            if (id != component.id) {
                circuitCopy.metadata.rendering.wires
                    .flatMap(wire => wire.links)
                    .filter(link => link.type == 'pin')
                    .filter(link => (link.value as ConnectorLink).conn.componentId == component.id)
                    .forEach(link => (link.value as ConnectorLink).conn.componentId = id)
                component.id = id
            }
        });

        circuitCopy.params[componentId] = undefined;
        circuitCopy.components.splice(componentId, 1);
        circuitCopy.components.forEach((component, id) => {
            if (id != component.id) {
                component.id = id;
            }
        });
        circuitCopy.connections = [];
        
        return circuitCopy;
    }

    async deleteWire(circuit: Circuit, wireId: number): Promise<Circuit> {
        const circuitCopy = copy(circuit);
        circuitCopy.metadata.rendering.wires.splice(wireId, 1);
        circuitCopy.metadata.rendering.junctions = circuitCopy.metadata.rendering.junctions.filter(junction => junction.sourceWire != wireId);
        circuitCopy.metadata.rendering.wires.forEach(wire => {
            wire.links = wire.links.filter((link) => !(link.type == 'wire' && link.value == wireId))
        })

        circuitCopy.metadata.rendering.wires.forEach((wire, id) => {
            if (id != wire.id) {
                circuitCopy.metadata.rendering.wires.flatMap(wire => wire.links)
                    .filter(link => link.type == 'wire')
                    .filter(link => link.value == wire.id)
                    .forEach(link => link.value = id);
                circuitCopy.metadata.rendering.junctions
                    .filter(junction => junction.sourceWire == wire.id)
                    .forEach(junction => junction.sourceWire = id)
                wire.id = id;
            }
        });

        circuitCopy.connections = [];
        return circuitCopy;

    }

}
