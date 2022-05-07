


export type QuestRequirement =  {
    name: string

    description: string

    value: any
}

export type TruthTable =  {
    input: boolean[][];

    output: boolean[][];
}

export type CombinationalVerificationRestrictions  = {
    maxDelay: number;

    truthTable: TruthTable;

    maxComponents: number
}

export type CombinationalVerificationData = {
    type: 'Combinational';

    restrictions: CombinationalVerificationRestrictions;
}

export type SequentialStateTrigger =  {
    pin: number;

    value: boolean;

}

export type SequentialStateOutput =  {
    pin: number;

    value: boolean;
}

export type SequentialState =  {
    triggers: SequentialStateTrigger[];

    outputs: SequentialStateOutput[];

}

export type SequentialVerificationRestrictions =  {
    stateMachine: SequentialState[]

    maxComponents: number
}


export type SequentialVerificationData =  {
    type: 'Sequential'

    restrictions: SequentialVerificationRestrictions;
}

export type Quest =  {
    id: number;

    name: string;

    description: string;

    requirements: QuestRequirement[];


    verificationData: CombinationalVerificationData | SequentialVerificationData;

    reward: number;

}