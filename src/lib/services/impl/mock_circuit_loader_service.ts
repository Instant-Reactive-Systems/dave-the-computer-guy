import type { Circuit } from "$lib/models/circuit";
import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import type { CircuitLoaderService } from "../circuit_loader_service";

export class MockCircuitLoaderService implements CircuitLoaderService{
    private circuitsBehaviourSubject: BehaviorSubject<Circuit[]> = new BehaviorSubject<Circuit[]>([]);
    
    init() {}

    dispose() {}

    async loadUserCircuits(user: User, offset: number, limit: number): Promise<Circuit[]> {
        let circuits: Circuit[] = [];
        const circuitJson = localStorage.getItem('circuits');
        if (circuitJson != null) {
            circuits = JSON.parse(circuitJson);
        }
        console.log('loadUserCircuits(): Circuits in localStorage: ', circuits);
        this.circuitsBehaviourSubject.next(circuits);
        return circuits;
    }

    insertCircuit(circuit: Circuit): Promise<void> {
        let circuits: Circuit[] = [];
        const circuitJson = localStorage.getItem('circuits');
        if (circuitJson != null) {
            circuits = JSON.parse(circuitJson);
        }
        console.log('insertCircuit(): Circuits in localStorage: ', circuits);

        let index = circuits.findIndex((x) => x.id == circuit.id);
        if (index != -1) {
            circuit.id = circuits[index].id;
            circuits[index] = circuit;
        } else {
            circuit.id = circuits.length;
            circuits.push(circuit);
        }

        localStorage.setItem('circuits', JSON.stringify(circuits));
        this.circuitsBehaviourSubject.next(circuits);

        return;
    }

    async deleteCircuit(circuitId: number): Promise<Circuit> {
        let circuits: Circuit[] = [];
        const circuitJson = localStorage.getItem('circuits');
        if (circuitJson != null) {
            circuits = JSON.parse(circuitJson);
        }
        console.log('deleteCircuit(): Circuits in localStorage: ', circuits);

        let index = circuits.findIndex((x) => x.id == circuitId);
        let removed: Circuit = null;
        if (index != -1) {
            removed = circuits[index];
            circuits.splice(index);
        }

        localStorage.setItem('circuits', JSON.stringify(circuits));
        this.circuitsBehaviourSubject.next(circuits);

        return removed;
    }

    getCircuitsBehaviourSubject(): BehaviorSubject<Circuit[]> {
        return this.circuitsBehaviourSubject;
    }

}
