import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { UserEvent } from "$lib/models/user_event";
import type { BehaviorSubject } from "rxjs";

export type SimulatorService = {
    init(): void,
    getCircuitStateBehaviourSubject(): BehaviorSubject<Map<number,any>>,
    setCircuit(circuit: Circuit): void,
    startSimulation(): void,
    stopSimulation(): void,
    stepSimulation(): void,
    insertUserEvent(userEvent: UserEvent): void,
    insertDefinition(definition: ComponentDefinition),
    getCircuit(): Circuit,
    dispose(): void
}