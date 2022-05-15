import type { User } from "$lib/models/user"
import type { BehaviorSubject } from "rxjs"

export type UserService = {
    authenticate(username: string, password: string): Promise<string>;
    getUserData(username: string): Promise<User>;
    getUserBehaviourSubject():BehaviorSubject<User>;
    giveReward(amount: number): Promise<User>;
    takeMoney(amount: number): Promise<User>;
    init();
    dispose();
}