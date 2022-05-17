import type { House } from "$lib/models/house";
import type { ItemType, Item } from "$lib/models/item";
import { BehaviorSubject } from "rxjs";
import type { UserService } from "../user_service";
import type { HouseService } from "../house_service";



const desk01: Item = {
    id: 1,
    name: "Desk setup 1",
    type: "desk",
    url: "/models/home/desk/desk_01.gltf",
    cost: 0,
    imageUrl: "/models/home/desk/desk_01.png",
    owned: true,
}

const desk02: Item = {
    id: 2,
    name: "Desk setup 2",
    type: "desk",
    url: "/models/home/desk/desk_02.gltf",
    cost: 200,
    imageUrl: "/models/home/desk/desk_02.png",
    owned: false,
}

const bed01: Item = {
    id: 3,
    name: "Bed 1",
    type: "bed",
    url: "/models/home/bed/bed_01.gltf",
    cost: 0,
    imageUrl: "/models/home/bed/bed_01.png",
    owned: true,
}


const chair01: Item = {
    id: 5,
    name: "Chair 1",
    type: "chair",
    url: "/models/home/chair/chair_01.gltf",
    cost: 0,
    imageUrl: "/models/home/chair/chair_01.png",
    owned: true
};


const chair02: Item = {
    id: 6,
    name: "Chair 2",
    type: "chair",
    url: "/models/home/chair/chair_02.gltf",
    cost: 100,
    imageUrl: "/models/home/chair/chair_02.png",
    owned: false
}

const chair03: Item = {
    id: 7,
    name: "Chair 3",
    type: "chair",
    url: "/models/home/chair/chair_03.gltf",
    cost: 125,
    imageUrl: "/models/home/chair/chair_03.png",
    owned: false
}

const chair04: Item = {
    id: 8,
    name: "Chair 4",
    type: "chair",
    url: "/models/home/chair/chair_04.gltf",
    cost: 130,
    imageUrl: "/models/home/chair/chair_04.png",
    owned: false
};


const chair05: Item = {
    id: 9,
    name: "Chair 5",
    type: "chair",
    url: "/models/home/chair/chair_05.gltf",
    cost: 145,
    imageUrl: "/models/home/chair/chair_05.png",
    owned: false
};

const chair06: Item = {
    id: 10,
    name: "Chair 6",
    type: "chair",
    url: "/models/home/chair/chair_06.gltf",
    cost: 150,
    imageUrl: "/models/home/chair/chair_06.png",
    owned: false
};

const chair07: Item = {
    id: 11,
    name: "Chair 7",
    type: "chair",
    url: "/models/home/chair/chair_07.gltf",
    cost: 160,
    imageUrl: "/models/home/chair/chair_07.png",
    owned: false
};


const tv01: Item = {
    id: 12,
    name: "Tv 1",
    type: "tv",
    url: "/models/home/tv/tv_01.gltf",
    cost: 0,
    imageUrl: "/models/home/tv/tv_01.png",
    owned: true
}

const tv02: Item = {
    id: 13,
    name: "Tv 2",
    type: "tv",
    url: "/models/home/tv/tv_02.gltf",
    cost: 500,
    imageUrl: "/models/home/tv/tv_02.png",
    owned: false
}

const pc01: Item = {
    id: 14,
    name: "Pc 1",
    type: "pc",
    url: "/models/home/pc/pc_01.gltf",
    cost: 0,
    imageUrl: "/models/home/pc/pc_01.png",
    owned: true
}

const pc02: Item = {
    id: 15,
    name: "Pc 2",
    type: "pc",
    url: "/models/home/pc/pc_02.gltf",
    cost: 700,
    imageUrl: "/models/home/pc/pc_02.png",
    owned: false
}


const HOUSE_01: House = {
    name: "simple flat",
    id: 1,
    houseData: {
        desk: {
            all: [desk01, desk02],
            prefferedItemId: 1
        },
        bed: {
            all: [bed01],
            prefferedItemId: 4
        },
        chair: {
            all: [chair01, chair02, chair03, chair04, chair05, chair06, chair07],
            prefferedItemId: 5
        },
        tv: {
            all: [tv01, tv02],
            prefferedItemId: 12
        },
        pc: {
            all: [pc01, pc02],
            prefferedItemId: 14
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

    async buyItem(item: Item): Promise<boolean> {
        const enoughFunds = await this.userService.takeMoney(item.cost);
        if (!enoughFunds) {
            return false;
        }
        const house = this.houseBehaviourSubject.getValue();
        house.houseData[item.type].all.find(i => i.id == item.id).owned = true;
        this.houseBehaviourSubject.next(house);
        return true;
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