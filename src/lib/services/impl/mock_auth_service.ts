import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import type { AuthService } from "../auth_service";

export class MockAuthService implements AuthService {
    private userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    init() {}
    
    dispose() {}

    async authenticate(username: string, password: string): Promise<string> {
        window.localStorage.setItem("token", `${username}-${password}`)
        return `${username}-${password}`
    }

    async getUserData(username): Promise<User> {
        const user = {
            username: username,
            email: `${username}}@gmail.com`,
            inventory: [],
            balance: 1000,
            preferences: new Map<string, any>(),
            completedQuestIds: []
        };
        this.userBehaviorSubject.next(user);
        return user;
    }

    getUserBehaviourSubject(): BehaviorSubject<User> {
        return this.userBehaviorSubject;
    }

}