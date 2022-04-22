import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { UserEvent } from "$lib/models/user_event";
import type { WorkerMessage, WorkerResponse } from "$lib/worker";
import Worker from "$lib/worker?worker";
import { BehaviorSubject } from "rxjs";
import type { SimulatorService } from "../simulator_service";

export class WorkerSimulatorService implements SimulatorService {

    private worker: Worker = null;
    private circuit: Circuit = null;
    private circuitStateBehaviourSubject = new BehaviorSubject<Map<number, any>>(null);


    init(): void {
        this.worker = new Worker();
        this.initWorker();
    }

    private initWorker(): void {
        this.worker.onmessage = (e) => {
            const data = e.data;
            this.handleMessageFromWorker(data);
        }
        this.worker.onerror = (e) => {
            console.error(e);
        }

    }

    private handleMessageFromWorker(msg: WorkerResponse) {
        console.log("Got message from worker",msg);
        switch (msg.action) {
            case "circuitStateUpdate":
                this.circuitStateBehaviourSubject.next(msg.payload as Map<number, any>)
                break;
            default:
                console.log(`Default message handler msg=${JSON.stringify(msg)}`)
        }
    }




    getCircuitStateBehaviourSubject(): BehaviorSubject<Map<number, any>> {
        return this.circuitStateBehaviourSubject;
    }

    setCircuit(circuit: Circuit): void {
        let message: WorkerMessage = {
            action: "setCircuit",
            payload: circuit
        }
        this.worker.postMessage(message)
        this.circuit = circuit;
    }


    startSimulation(): void {
        let message: WorkerMessage = {
            action: "startSimulation",
            payload: null
        }
        this.worker.postMessage(message);
    }


    stopSimulation(): void {
        let message: WorkerMessage = {
            action: "stopSimulation",
            payload: null
        }
        this.worker.postMessage(message);
    }


    stepSimulation(): void {
        let message: WorkerMessage = {
            action: "stepSimulation",
            payload: null,
        }
        this.worker.postMessage(message);
    }

    insertUserEvent(userEvent: UserEvent): void {
        let message: WorkerMessage = {
            action: "insertUserEvent",
            payload: userEvent
        }
        this.worker.postMessage(message);
    }

    insertDefinition(definition: ComponentDefinition) {
        let message: WorkerMessage = {
            action: "insertDefinition",
            payload: definition
        }
        this.worker.postMessage(message);
    }

    getCircuit(): Circuit {
        return this.circuit;
    }

    dispose(): void {
        if (this.worker != null) {
            this.worker.terminate();
        }
    }

}