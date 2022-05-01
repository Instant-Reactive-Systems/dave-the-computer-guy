import { AnyT, jsonArrayMember, jsonMapMember, jsonMember, jsonObject, toJson } from "typedjson";



@toJson
@jsonObject
export class QuestRequirement{
    @jsonMember(String)
    id: number
    
    @jsonMember(String)
    name: string

    @jsonMember(String)
    description: string

    @jsonMember(AnyT)
    value: any
}


@toJson
@jsonObject
export class Quest{
    @jsonMember(Number)
    id: number;

    @jsonMember(String)
    name: string;

    @jsonMember(String)
    description: string;

    @jsonArrayMember(QuestRequirement)
    requirements: QuestRequirement[]

    @jsonMember(AnyT)
    verificationData: any;
}