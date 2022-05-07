import type { Item } from "./item";

export type User = {
    username: string;
    
    email: string;

    inventory: Item[];

    balance: number;

    preferences: Map<string,any>;

    completedQuestIds: number[]; 

  
  

}


