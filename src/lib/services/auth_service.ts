import type { User } from "$lib/models/user"
import type { BehaviorSubject } from "rxjs"
import type { Result } from "ts-results";

export type AuthService = {
    authenticate(username: string, password: string): Promise<Result<string,Error>>
    getUserData(username: string): Promise<Result<User,Error>>
    getUserBehaviourSubject():BehaviorSubject<User>;
}