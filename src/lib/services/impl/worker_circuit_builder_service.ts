import type { Circuit } from "$lib/models/circuit";
import type { CircuitBuilderService } from "../circuit_builder_serivce";
import Worker from "$lib/circuit_builder_worker?worker";
import type { WorkerResponse, WorkerMessage } from "$lib/circuit_builder_worker";

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

        return new Promise(function (resolve, reject) {
            this.resolves[msgId] = resolve;
            this.rejects[msgId] = reject;
            this.worker.postMessage(msg);
        })
    }

}