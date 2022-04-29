import type { User } from "$lib/models/user"
import type { BehaviorSubject } from "rxjs"

export type AuthService = {
    authenticate(username: string, password: string): Promise<string>
    getUserData(username: string): Promise<User>
    getUserBehaviourSubject():BehaviorSubject<User>;
    init();
    dispose();
}