import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { ValidationReport } from "$lib/models/component_validation";
import type { CombinationalVerificationData, SequentialVerificationData, SequentialVerificationRestrictions, VerificationData } from "$lib/models/quest";
import type { UserEvent } from "$lib/models/user_event";
import type { BehaviorSubject } from "rxjs";

export type SimulatorService = {
    init(): void;
    dispose(): void;
    getCircuitStateBehaviourSubject(): BehaviorSubject<Map<number, any>>;
    getCircuit(): Circuit;

    // API for digisim
    start(): Promise<void>;
    pause(): Promise<void>;
    stop(): Promise<void>;
    step(): Promise<void>;
    insertUserEvent(userEvent: UserEvent): Promise<void>;
    insertDefinitions(defs: ComponentDefinition[]): Promise<void>;
    setCircuit(circuit: Circuit): Promise<void>;
    verifyComponent(definition: ComponentDefinition, verificationData: VerificationData): Promise<ValidationReport>;
};

