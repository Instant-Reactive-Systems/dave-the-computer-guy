import { AnyT, jsonArrayMember, jsonMapMember, jsonMember, jsonObject } from "typedjson"
import { Item } from "./item";


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

    @jsonArrayMember(Number)
    completedQuestIds: number[]; 
}


