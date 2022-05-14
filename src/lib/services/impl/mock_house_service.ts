import type { House } from "$lib/models/house";
import type { UserService } from "../auth_service";
import type { HouseService } from "../house_service";

export class MockHouseService implements HouseService{
    private userService: UserService;
    changeHouse(house: House): Promise<House> {
        throw new Error("Method not implemented.");
    }
    buyHouse(house: House): Promise<House> {
        throw new Error("Method not implemented.");
    }
    getHouseList(): Promise<House[]> {
        throw new Error("Method not implemented.");
    }
    init() {
    }
    dispose() {
    }

    constructor(userService: UserService){
        this.userService = userService;
    }

}