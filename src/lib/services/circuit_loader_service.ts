import type { Circuit } from "$lib/models/circuit"
import type { User } from "$lib/models/user";
import type { BehaviorSubject } from "rxjs";
import type { Result } from "ts-results";

export type CircuitLoaderService = {
    loadUserCircuits(user:User, offset:number, limit:number): Promise<Result<Circuit[],Error>>,
    insertCircuit(circuit: Circuit, force: boolean): Promise<Result<void,Error>>,
    deleteCircuit(circuitId: number): Promise<Result<Circuit,Error>>,
    getCircuitsBehaviourSubject(): BehaviorSubject<Circuit[]>,
}