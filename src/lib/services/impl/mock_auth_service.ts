import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import { Ok, type Result } from "ts-results";
import type { AuthService } from "../auth_service";

export class MockAuthService implements AuthService {
    init() {
    }
    dispose() {
    }
    private userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    async authenticate(username: string, password: string): Promise<Result<string, Error>> {
        window.localStorage.setItem("token",`${username}-${password}`)
        return Ok("MYTOKEN");
    }

    async getUserData(username): Promise<Result<User, Error>> {
        const user = {
            username: username,
            email: `${username}}@gmail.com`,
            inventory: [],
            balance: 1000,
            preferences: new Map<string,any>(),
            completedQuestIds: []
        };
        this.userBehaviorSubject.next(user);
        return Ok(user);
    }

    getUserBehaviourSubject(): BehaviorSubject<User> {
        return this.userBehaviorSubject;
    }

}