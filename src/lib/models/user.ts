import type { Inventory } from "./inventory"
import type { Preferences } from "./preferences"

export type User = {
    username: string,
    email: string,
    inventory: Inventory,
    balance: number,
    preferences: Preferences,
    completedQuestIds: number[],  
}