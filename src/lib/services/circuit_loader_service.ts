import type { Circuit } from "$lib/models/circuit"
import type { User } from "$lib/models/user";
import type { BehaviorSubject } from "rxjs";

export type CircuitLoaderService = {
    loadUserCircuits(user:User, offset:number, limit:number): Promise<Circuit[]>,
    insertCircuit(circuit: Circuit, force: boolean): Promise<void>,
    deleteCircuit(circuitId: number): Promise<Circuit>,
    getCircuitsBehaviourSubject(): BehaviorSubject<Circuit[]>,
    init(),
    dispose()
}