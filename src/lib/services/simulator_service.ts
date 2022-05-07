import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { ComponentRef } from "$lib/models/component_ref";
import type { UserEvent } from "$lib/models/user_event";
import type { VerificationResult } from "$lib/models/verification_result";
import type { BehaviorSubject } from "rxjs";

export type SimulatorService = {
    init(): void;
    dispose(): void;
    getCircuitStateBehaviourSubject(): BehaviorSubject<Map<number,any>>;
    getCircuit(): Circuit;

    // API for digisim
    start(): void;
    pause(): void;
    stop(): void;
    step(): void;
    insertUserEvent(userEvent: UserEvent): void;
    insertDefinitions(defs: ComponentDefinition[]): void;
    setCircuit(circuit: Circuit): void;
    verifyComponent(component: ComponentRef,verificationData: any): Promise<VerificationResult>;
};

