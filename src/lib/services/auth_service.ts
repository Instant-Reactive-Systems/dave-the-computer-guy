import type { User } from "$lib/models/user"
import type { BehaviorSubject } from "rxjs"

export type UserService = {
    authenticate(username: string, password: string): Promise<string>;
    getUserData(): Promise<User>;
    getUserBehaviourSubject():BehaviorSubject<User>;
    init();
    dispose();
}