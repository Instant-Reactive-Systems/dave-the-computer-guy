import { AnyT, jsonArrayMember, jsonMember, jsonObject, toJson } from "typedjson";



@toJson
@jsonObject
export class QuestRequirement {
    @jsonMember(String)
    name: string

    @jsonMember(String)
    description: string

    @jsonMember(AnyT)
    value: any
}

@toJson
@jsonObject
export class TruthTable {
    @jsonArrayMember(Boolean, { dimensions: 2 })
    input: boolean[][];

    @jsonArrayMember(Boolean, { dimensions: 2 })
    output: boolean[][];
}

@toJson
@jsonObject
export class CombinationalVerificationRestrictions {
    @jsonMember(Number)
    maxDelay: number;

    @jsonMember(TruthTable)
    truthTable: TruthTable;

    @jsonMember(Number)
    maxComponents: number
}

@toJson
@jsonObject
export class CombinationalVerificationData {
    @jsonMember(String)
    type: 'Combinational';

    @jsonMember(CombinationalVerificationRestrictions)
    restrictions: CombinationalVerificationRestrictions;
}

@toJson
@jsonObject
export class SequentialStateTrigger {
    @jsonMember(Number)
    pin: number;

    @jsonMember(Boolean)
    value: boolean;

}

@toJson
@jsonObject
export class SequentialStateOutput {
    @jsonMember(Number)
    pin: number;

    @jsonMember(Boolean)
    value: boolean;
}

@toJson
@jsonObject
export class SequentialState {
    @jsonArrayMember(SequentialStateTrigger)
    triggers: SequentialStateTrigger[];

    @jsonArrayMember(SequentialStateOutput)
    outputs: SequentialStateOutput[];

}

@toJson
@jsonObject
export class SequentialVerificationRestrictions {
    @jsonArrayMember(SequentialState)
    stateMachine: SequentialState[]

    @jsonMember(Number)
    maxComponents: number
}


@toJson
@jsonObject
export class SequentialVerificationData {
    @jsonMember(String)
    type: 'Sequential'

    @jsonMember(SequentialVerificationRestrictions)
    restrictions: SequentialVerificationRestrictions;
}

@toJson
@jsonObject
export class Quest {
    @jsonMember(Number)
    id: number;

    @jsonMember(String)
    name: string;

    @jsonMember(String)
    description: string;

    @jsonArrayMember(QuestRequirement)
    requirements: QuestRequirement[];


    //TODO make custom deserializer and serializer
    @jsonMember(AnyT)
    verificationData: CombinationalVerificationData | SequentialVerificationData;

    @jsonMember(Number)
    reward: number;

}