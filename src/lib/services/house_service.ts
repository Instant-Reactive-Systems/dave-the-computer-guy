import type { House } from "$lib/models/house"

export type HouseService = {
    changeHouse(house: House): Promise<House>;
    buyHouse(house: House): Promise<House>
    getHouseList(): Promise<House[]>;
    init();
    dispose();
}