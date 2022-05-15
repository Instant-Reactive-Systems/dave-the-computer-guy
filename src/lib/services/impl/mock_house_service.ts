import type { House } from "$lib/models/house";
import type { ItemType, Item } from "$lib/models/item";
import { BehaviorSubject } from "rxjs";
import type { UserService } from "../user_service";
import type { HouseService } from "../house_service";



const deskSetup01: Item = {
    id: 1,
    name: "Desk setup 1",
    type: "deskSetup",
    url: "/models/home/deskSetup/deskSetup01.gltf",
    cost: 0,
    imageUrl: null,
    owned: true,
}

const deskSetup02: Item = {
    id: 2,
    name: "Desk setup 2",
    type: "deskSetup",
    url: "/models/home/deskSetup/deskSetup02.gltf",
    cost: 200,
    imageUrl: null,
    owned: false,
}

const deskSetup03: Item = {
    id: 3,
    name: "Desk setup 3",
    type: "deskSetup",
    url: "/models/home/deskSetup/deskSetup03.gltf",
    cost: 400,
    imageUrl: null,
    owned: false,
}


const bed01: Item = {
    id: 4,
    name: "Bed 1",
    type: "bed",
    url: "/models/home/bed/bed01.gltf",
    cost: 0,
    imageUrl: null,
    owned: true,
}

const HOUSE_01: House = {
    name: "simple flat",
    id: 1,
    houseData: {
        deskSetup: {
            all: [deskSetup01, deskSetup02, deskSetup03],
            prefferedItemId: 1
        },
        bed: {
            all: [bed01],
            prefferedItemId: 4
        }
    },
    cost: 0,
    owned: true,
    imageUrl: null,
}

export class MockHouseService implements HouseService {
    private userService: UserService;
    private houseBehaviourSubject = new BehaviorSubject<House>(HOUSE_01);
    private houses: House[] = [HOUSE_01]

    constructor(userService: UserService) {
        this.userService = userService;
    }

    getHouseBehaviourSubject(): BehaviorSubject<House> {
        return this.houseBehaviourSubject;
    }

    async changeHouse(house: House): Promise<House> {
        this.houseBehaviourSubject.next(house);
        return house;
    }

    buyHouse(house: House): Promise<House> {
        throw new Error("Method not implemented.");
    }

    async setItem(itemType: ItemType, item: Item): Promise<House> {
        const house = this.houseBehaviourSubject.getValue();
        house.houseData[item.type].prefferedItemId = item.id;
        this.houseBehaviourSubject.next(house);
        return house;
    }

    async buyItem(item: Item): Promise<Item> {
        await this.userService.takeMoney(item.cost);
        const house = this.houseBehaviourSubject.getValue();
        house.houseData[item.type].all.find(i => i.id == item.id).owned = true;
        this.houseBehaviourSubject.next(house);
        return item;
    }

    async getItemList(itemType: ItemType): Promise<Item[]> {
        return this.houseBehaviourSubject.getValue().houseData[itemType].all;
    }

    async getHouseList(): Promise<House[]> {
        return this.houses;
    }

    init() {
    }

    dispose() {
    }

}