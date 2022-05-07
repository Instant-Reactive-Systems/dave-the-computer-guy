import type { Circuit } from "$lib/models/circuit";
import type { User } from "$lib/models/user";
import {copy, getRandomInt} from "$lib/util/common";
import { BehaviorSubject } from "rxjs";
import type { CircuitLoaderService } from "../circuit_loader_service";
import _ from 'lodash';

export class MockCircuitLoaderService implements CircuitLoaderService{
    private circuitsBehaviourSubject: BehaviorSubject<Circuit[]> = new BehaviorSubject<Circuit[]>([]);
    
    init() {
        this.loadUserCircuits(null, null, null);
    }

    dispose() {}

    async loadUserCircuits(user: User, offset: number, limit: number): Promise<Circuit[]> {
        let circuits: Circuit[] = [];
        const circuitJson = localStorage.getItem('circuits');
        if (circuitJson != null) {
            circuits = JSON.parse(circuitJson)
        }
        console.log('loadUserCircuits(): Circuits in localStorage: ', circuits);
        this.circuitsBehaviourSubject.next(circuits);
        return circuits;
    }

    insertCircuit(circ: Circuit): Promise<Circuit> {
        const circuit = copy(circ);
        let circuits: Circuit[] = [];
        const circuitJson = localStorage.getItem('circuits');
        if (circuitJson != null) {
            circuits = JSON.parse(circuitJson);
        }

        let index = circuits.findIndex((x) => x.id == circuit.id);
        if (index != -1) {
            circuit.id = circuits[index].id;
            circuits[index] = circuit;
        } else {
            circuit.id = getRandomInt(0, 2000000000);
            circuits.push(circuit);
        }

        localStorage.setItem('circuits', JSON.stringify(circuits));
        this.circuitsBehaviourSubject.next(circuits);

        return Promise.resolve(circuit);
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
