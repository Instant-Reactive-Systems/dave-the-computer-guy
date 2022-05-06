import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { ComponentRef } from "$lib/models/component_ref";
import type { UserEvent } from "$lib/models/user_event";
import type { VerificationResult } from "$lib/models/verification_result";
import type { WorkerMessage, WorkerResponse } from "$lib/simulator_worker";
import Worker from "$lib/simulator_worker?worker";
import { BehaviorSubject } from "rxjs";
import type { SimulatorService } from "../simulator_service";

export class WorkerSimulatorService implements SimulatorService {
    private worker: Worker = null;
    private circuit: Circuit = null;
    private circuitStateBehaviourSubject = new BehaviorSubject<Map<number, any>>(null);


    init(): void {
        this.worker = new Worker();

        // Attach listeners
        this.worker.onmessage = (e) => {
            const data = e.data;
            this.handleMessageFromWorker(data);
        };
        this.worker.onerror = (e) => {
            console.error(e);
        };
    }

    dispose(): void {
        if (this.worker != null) {
            this.worker.terminate();
        }
    }

    private handleMessageFromWorker(msg: WorkerResponse) {
        console.log("Got message from worker: ", msg);
        switch (msg.action) {
            case "circuitStateUpdate":
                console.log("Updating state");
                this.circuitStateBehaviourSubject.next(msg.payload as Map<number, any>);
                break;
            default:
                console.log(`Default message handler msg=${JSON.stringify(msg)}`);
        }
    }

    getCircuitStateBehaviourSubject(): BehaviorSubject<Map<number, any>> {
        return this.circuitStateBehaviourSubject;
    }
        
    getCircuit(): Circuit {
        return this.circuit;
    }

    // ============== API for digisim
    start(): void {
        let message: WorkerMessage = {
            action: 'start',
            payload: null,
        };
        this.worker.postMessage(message);
    }
    
    pause(): void {
        let message: WorkerMessage = {
            action: 'pause',
            payload: null,
        };
        this.worker.postMessage(message);
    }

    stop(): void {
        let message: WorkerMessage = {
            action: 'stop',
            payload: null,
        };
        this.worker.postMessage(message);
    }

    step(): void {
        let message: WorkerMessage = {
            action: 'step',
            payload: null,
        };
        this.worker.postMessage(message);
    }

    insertUserEvent(userEvent: UserEvent): void {
        let message: WorkerMessage = {
            action: 'insertUserEvent',
            payload: userEvent,
        };
        this.worker.postMessage(message);
    }

    insertDefinition(definition: ComponentDefinition) {
        let message: WorkerMessage = {
            action: 'insertDefinition',
            payload: definition,
        };
        this.worker.postMessage(message);
    }

    setCircuit(circuit: Circuit): void {
        let message: WorkerMessage = {
            action: 'setCircuit',
            payload: circuit,
        };
        this.worker.postMessage(message)
        this.circuit = circuit;
    }

    verifyComponent(component: ComponentRef, verificationData: any): Promise<VerificationResult> {
        throw new Error("Method not implemented.");
    }
}

