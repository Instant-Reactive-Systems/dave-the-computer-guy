import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import type { UserService } from "../auth_service";

export class MockUserService implements UserService {
    private userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    init() {
        this.getUserData();
    }
    
    dispose() {}

    async authenticate(username: string, password: string): Promise<string> {
        window.localStorage.setItem("token", `${username}-${password}`)
        return `${username}-${password}`
    }

    async getUserData(): Promise<User> {
        const username = "spazzay";
        const user:User = {
            username: username,
            email: `${username}}@gmail.com`,
            inventory: [],
            balance: 0,
            preferences: new Map<string, any>(),
        };
        this.userBehaviorSubject.next(user);
        return user;
    }

    getUserBehaviourSubject(): BehaviorSubject<User> {
        return this.userBehaviorSubject;
    }

   

}