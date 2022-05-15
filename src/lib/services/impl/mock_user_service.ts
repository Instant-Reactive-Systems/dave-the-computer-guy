import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import type { UserService } from "../user_service";

export class MockUserService implements UserService {
   
    private userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    init() {
        this.getUserData("spazzay");

    }
    
    dispose() {}

    async authenticate(username: string, password: string): Promise<string> {
        window.localStorage.setItem("token", `${username}-${password}`)
        return `${username}-${password}`
    }

    async getUserData(username): Promise<User> {
        const user:User = {
            username: username,
            email: `${username}}@gmail.com`,
            balance: 0,
        };
        this.userBehaviorSubject.next(user);
        return user;
    }

    getUserBehaviourSubject(): BehaviorSubject<User> {
        return this.userBehaviorSubject;
    }

    async giveReward(amount: number): Promise<User>{
        const user = this.getUserBehaviourSubject().getValue();
        user.balance += amount;
        this.getUserBehaviourSubject().next(user);
        return user;
    }

    async takeMoney(amount: number): Promise<User> {
        const user = this.getUserBehaviourSubject().getValue();
        if(user.balance - amount >= 0){
            user.balance -= amount;
            this.getUserBehaviourSubject().next(user);
            return user;
        }else{
            throw new Error("Not enough funds");
        }

    }

}