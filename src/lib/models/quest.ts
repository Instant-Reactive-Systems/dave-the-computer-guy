

export type TruthTable = {
    inputs: boolean[][];
    outputs: boolean[][];
}

export type CombinationalVerificationRestrictions = {
    maxRuntime: number;
    truthTable: TruthTable;
    maxComponents: number;
}

export type CombinationalVerificationData = {
    type: 'Combinational';
    restrictions: CombinationalVerificationRestrictions;
}

export type SequentialStateTrigger = {
    pin: number;
    value: boolean;
}

export type SequentialStateOutput = {
    pin: number;
    value: boolean;
}

export type SequentialState = {
    triggers: SequentialStateTrigger[];
    outputs: SequentialStateOutput[];
}

export type SequentialVerificationRestrictions = {
    stateMachine: SequentialState[];
    maxComponents: number;
}


export type SequentialVerificationData = {
    type: 'Sequential';
    restrictions: SequentialVerificationRestrictions;
}

export type VerificationData = CombinationalVerificationData | SequentialVerificationData

export type Quest = {
    id: number;
    name: string;
    description: string;
    verificationData: VerificationData;
    reward: number;
    tags?: string[];
    prerequisiteQuests?: number[];
}
