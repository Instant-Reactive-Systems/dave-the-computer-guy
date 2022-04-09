import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import { Ok, type Result } from "ts-results";
import type { AuthService } from "../auth_service";

export class MockAuthService implements AuthService {
    private userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    private tokenBehaviourSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    async authenticate(username: string, password: string): Promise<Result<string, Error>> {
        this.tokenBehaviourSubject.next("MYTOKEN");

        return Ok("MYTOKEN");
    }

    async getUserData(username): Promise<Result<User, Error>> {
        const user = {
            username: username,
            email: `${username}}@gmail.com`,
            inventory: [],
            balance: 1000,
            preferences: {},
            completedQuestIds: []
        };
        this.userBehaviorSubject.next(user);
        return Ok(user);
    }

    getUserBehaviourSubject(): BehaviorSubject<User> {
        return this.userBehaviorSubject;
    }

    getTokenBehaviourSubject(): BehaviorSubject<string> {
        return this.tokenBehaviourSubject;
    }

}