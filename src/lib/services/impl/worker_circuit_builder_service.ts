import { ComponentRenderingData, Junction, type Circuit } from "$lib/models/circuit";
import type { CircuitBuilderService } from "../circuit_builder_serivce";
import Worker from "$lib/circuit_builder_worker?worker";
import type { WorkerResponse, WorkerMessage } from "$lib/circuit_builder_worker";
import type { ComponentDefinition } from "$lib/models/component_definition";
import _ from "lodash"
import { ComponentRef } from "$lib/models/component_ref";
import type { Wire } from "$lib/models/wire";
export class WorkerCircuitBuilderService implements CircuitBuilderService {

    private worker: Worker;
    private resolves = {};
    private rejects = {};
    private idCounter: number;

    init() {
        this.worker = new Worker();
        this.initWorker();
        this.resolves = []
        this.rejects = [];
        this.idCounter = 0;
    }

    private initWorker(): void {
        this.worker.onmessage = (e) => {
            const data = e.data;
            this.handleMessageFromWorker(data);
        }
        this.worker.onerror = (e) => {
            console.log(e);
        }

    }


    private handleMessageFromWorker(msg: WorkerResponse) {
        const { id, action, payload, err } = msg
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
                    reject(err)
                } else {
                    reject('Got nothing')
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

    async addNewComponent(circuit: Circuit, definition: ComponentDefinition, x: number, y: number): Promise<Circuit> {
        console.log("Adding new component");
        const circuitCopy: Circuit = _.cloneDeep(circuit)
        const componentRenderingData = new ComponentRenderingData();
        const id = circuitCopy.components.length;
        const component = new ComponentRef(id, definition.id);
        componentRenderingData.x = x;
        componentRenderingData.y = y;
        componentRenderingData.id = circuitCopy.components.length;
        circuitCopy.metadata.rendering.components.push(componentRenderingData);
        circuitCopy.components.push(component);
        return circuitCopy;
    }

    async popComponent(circuit: Circuit): Promise<Circuit> {
        console.log("Popping component");
        const circuitCopy: Circuit = _.cloneDeep(circuit);
        circuitCopy.metadata.rendering.components.pop();
        circuitCopy.components.pop();
        return circuitCopy;
    }

    async moveComponent(circuit: Circuit, id: number, x: number, y: number): Promise<Circuit> {
        console.log("Moving component");
        const circuitCopy = _.cloneDeep(circuit)
        const componentRenderingData = new ComponentRenderingData();
        componentRenderingData.x = x;
        componentRenderingData.y = y;
        componentRenderingData.id = id;
        circuitCopy.metadata.rendering.components[id] = componentRenderingData;
        this.disconnectConnectorsForComponent(circuitCopy, id);
        return circuitCopy;
    }

    private disconnectConnectorsForComponent(circuit: Circuit, id: number): void {
        console.log("Disconnecting connector for component");
        //we only disconnect connections in rendering because the real sim connections will be deducted from rendering
        circuit.metadata.rendering.wires
            .forEach(wire => wire.links = wire.links.filter(link => {
                console.log("link is ", link);
                if (link.type == 'wire') {
                    return true;
                } else {
                    return (link.value as any).conn.componentId != id;
                }
            }))

    }

    async addNewWire(circuit: Circuit, wire: Wire, junctions: Junction[]): Promise<Circuit> {
        console.log("Adding new wire");
        const circuitCopy = _.cloneDeep(circuit);
        circuitCopy.metadata.rendering.wires.push(wire);
        for (const junction of junctions) {
            if (junction != null) {
                circuitCopy.metadata.rendering.junctions.push(junction);
            }
        }
        return circuitCopy;
    }


}