import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { ValidationReport } from "$lib/models/component_validation";
import type { VerificationData } from "$lib/models/quest";
import type { UserEvent } from "$lib/models/user_event";
import type { WorkerMessage, WorkerResponse } from "$lib/simulator_worker";
import Worker from "$lib/simulator_worker?worker";
import { BehaviorSubject, Subscription } from "rxjs";
import type { ComponentDefinitionLoaderService } from "../component_definition_loader_service";
import type { SimulatorService } from "../simulator_service";

export class WorkerSimulatorService implements SimulatorService {
    private worker: Worker = null;
    private resolves = {};
    private rejects = {};
    // Used for numbering promises
    private idCounter: number;
    private circuit: Circuit = null;
    private circuitStateBehaviourSubject = new BehaviorSubject<Map<number, any>>(null);
    private defLoader: ComponentDefinitionLoaderService;
    private defSubscription: Subscription;

    constructor(defLoader: ComponentDefinitionLoaderService) {
        this.defLoader = defLoader;
    }

    init(): void {
        this.worker = new Worker();
        this.initWorker();
        this.resolves = {};
        this.rejects = {};
        this.idCounter = 0;


        this.defSubscription = this.defLoader.getDefinitionsBehaviourSubject().subscribe((defs) => {
            const arrDefs = Array.from(defs.values());
            this.insertDefinitions(arrDefs.filter((x) => x.id >= 0))

        })
    }

    dispose(): void {
        if (this.worker != null) {
            this.worker.terminate();
            this.defSubscription.unsubscribe();
        }
    }

    private initWorker(): void {
        this.worker.onmessage = (e) => {
            const data = e.data;
            this.handleMessageFromWorker(data);
        };
        this.worker.onerror = (e) => {
            console.error(e);
        };
    }


    private handleMessage(msg: WorkerResponse) {
        switch (msg.action) {
            case "circuitStateUpdate":
                this.circuitStateBehaviourSubject.next(msg.payload as Map<number, any>);
                break;
            default:
                console.error(`Invalid action, payload = ${JSON.stringify(msg)}`);
        }
    }

    private handleMessageFromWorker(msg: WorkerResponse) {
        const { id, action, payload, err } = msg;
        if (id == null) {
            //If there is no id then the response has no handler (is not promise based)
            this.handleMessage(msg);
        }
        if (action) {
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

    getCircuitStateBehaviourSubject(): BehaviorSubject<Map<number, any>> {
        return this.circuitStateBehaviourSubject;
    }

    getCircuit(): Circuit {
        return this.circuit;
    }

    // ============== API for digisim
    async start(): Promise<void> {
        const msgId = this.idCounter++;
        let msg: WorkerMessage = {
            action: 'start',
            payload: null,
            id: msgId
        };

        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        });
    }

    async pause(): Promise<void> {
        const msgId = this.idCounter++;
        let msg: WorkerMessage = {
            action: 'pause',
            payload: null,
            id: msgId
        };
        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }

    async stop(): Promise<void> {
        const msgId = this.idCounter++;
        let msg: WorkerMessage = {
            action: 'stop',
            payload: null,
            id: msgId
        };
        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }

    async step(): Promise<void> {
        const msgId = this.idCounter++;
        let msg: WorkerMessage = {
            action: 'step',
            payload: null,
            id: msgId
        };
        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }

    async insertUserEvent(userEvent: UserEvent): Promise<void> {
        const msgId = this.idCounter++;
        let msg: WorkerMessage = {
            action: 'insertUserEvent',
            payload: userEvent,
            id: msgId
        };
        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }

    async insertDefinitions(defs: ComponentDefinition[]): Promise<void> {
        const msgId = this.idCounter++;
        let msg: WorkerMessage = {
            action: 'insertDefinitions',
            payload: defs,
            id: msgId
        };
        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }

    async setCircuit(circuit: Circuit): Promise<void> {
        const msgId = this.idCounter++;
        let msg: WorkerMessage = {
            action: 'setCircuit',
            payload: circuit,
            id: msgId
        };
        this.circuit = circuit;
        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }

    verifyComponent(definition: ComponentDefinition, verificationData: VerificationData): Promise<ValidationReport> {
        const msgId = this.idCounter++;
        let msg: WorkerMessage = {
            id:  msgId,
            action: 'verifyComponent',
            payload: {
                verificationData,
                definition
            }
        }
        return new Promise((resolve, reject) => {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }
}

