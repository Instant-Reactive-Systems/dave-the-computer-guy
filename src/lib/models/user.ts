import { AnyT, jsonArrayMember, jsonMapMember, jsonMember, jsonObject, toJson } from "typedjson"
import { Item } from "./item";

@toJson
@jsonObject
export class User{
    @jsonMember(String)
    username: string;
    
    @jsonMember(String)
    email: string;

    @jsonArrayMember(Item)
    inventory: Item[];

    @jsonMember(Number)
    balance: number;

    @jsonMapMember(Number,AnyT)
    preferences: Map<string,any>;

    @jsonMember(Number)
    activeQuests: number[]

    @jsonMember(Number)
    completedQuests: number[]
}


