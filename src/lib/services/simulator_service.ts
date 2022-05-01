import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { ComponentRef } from "$lib/models/component_ref";
import type { UserEvent } from "$lib/models/user_event";
import type { VerificationResult } from "$lib/models/verification_result";
import type { BehaviorSubject } from "rxjs";

export type SimulatorService = {
    init(): void,
    getCircuitStateBehaviourSubject(): BehaviorSubject<Map<number,any>>,
    setCircuit(circuit: Circuit): void,
    startSimulation(): void,
    stopSimulation(): void,
    verifyComponent(component: ComponentRef,verificationData: any): Promise<VerificationResult>,
    stepSimulation(): void,
    insertUserEvent(userEvent: UserEvent): void,
    insertDefinition(definition: ComponentDefinition),
    getCircuit(): Circuit,
    dispose(): void
}