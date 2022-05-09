import type { Circuit } from "$lib/models/circuit";
import type { User } from "$lib/models/user";
import { copy, getRandomInt } from "$lib/util/common";
import { BehaviorSubject } from "rxjs";
import type { CircuitLoaderService } from "../circuit_loader_service";

export class MockCircuitLoaderService implements CircuitLoaderService {
    private circuitsBehaviourSubject: BehaviorSubject<Circuit[]> = new BehaviorSubject<Circuit[]>([]);

    init() {
        this.loadUserCircuits(null);
    }

    dispose() { }

    async loadUserCircuits(user: User): Promise<Circuit[]> {
        let circuits: Circuit[] = [];
        const circuitJson = localStorage.getItem('circuits');
        if (circuitJson != null) {
            circuits = JSON.parse(circuitJson)
        }
        this.circuitsBehaviourSubject.next(circuits);
        return circuits;
    }

    async insertCircuit(circ: Circuit): Promise<Circuit> {
        const circuit = copy(circ);
        let circuits: Circuit[] = [];
        const circuitJson = localStorage.getItem('circuits');
        if (circuitJson != null) {
            circuits = JSON.parse(circuitJson);
        }

        // Replace only if the ID matches and the name isn't changed
        let index = circuits.findIndex((x) => x.name == circuit.name && x.id == circuit.id);
        if (index != -1) {
            circuits[index] = circuit;
        } else {
            circuit.id = getRandomInt(0, 2000000000);
            circuits.push(circuit);
        }

        localStorage.setItem('circuits', JSON.stringify(circuits));
        this.circuitsBehaviourSubject.next(circuits);

        return circuit;
    }

    async deleteCircuit(circuitId: number): Promise<Circuit> {
        let circuits: Circuit[] = [];
        const circuitJson = localStorage.getItem('circuits');
        if (circuitJson != null) {
            circuits = JSON.parse(circuitJson);
        }

        let index = circuits.findIndex((x) => x.id == circuitId);
        let removed: Circuit = null;
        if (index != -1) {
            removed = circuits[index];
            circuits.splice(index, 1);
        }

        localStorage.setItem('circuits', JSON.stringify(circuits));
        this.circuitsBehaviourSubject.next(circuits);

        return removed;
    }

    getCircuitsBehaviourSubject(): BehaviorSubject<Circuit[]> {
        return this.circuitsBehaviourSubject;
    }

}
