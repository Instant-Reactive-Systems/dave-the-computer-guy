import type { Item, ItemType } from "$lib/models/item";
import type { UserService } from "../auth_service";
import type { ItemService } from "../item_service";

export class MockItemService implements ItemService{
    private userService: UserService;
    changeItem(item: Item, type: ItemType): Promise<Item> {
        throw new Error("Method not implemented.");
    }
    buyItem(item: Item): Promise<Item> {
        throw new Error("Method not implemented.");
    }
    getItemList(type: ItemType, start: number): Promise<Item[]> {
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