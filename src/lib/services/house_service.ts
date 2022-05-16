import type { House } from "$lib/models/house"
import type { Item, ItemType } from "$lib/models/item";
import type { BehaviorSubject } from "rxjs";

export type HouseService = {
    changeHouse(house: House): Promise<House>;
    buyHouse(house: House): Promise<House>;
    getHouseBehaviourSubject(): BehaviorSubject<House>;
    setItem(itemType: ItemType, item: Item): Promise<House>;
    buyItem(item: Item): Promise<boolean>;
    getItemList(itemType: ItemType): Promise<Item[]>
    getHouseList(): Promise<House[]>;
    init();
    dispose();
}