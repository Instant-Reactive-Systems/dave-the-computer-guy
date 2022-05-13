import type { Item, ItemType } from "$lib/models/item";

export type ItemService = {
    //changes the given item type in the current house layout with the passed in item
    changeItem(item: Item, type: ItemType): Promise<Item>;
    //buys an item
    buyItem(item: Item): Promise<Item>;
    //gets list of items starting from start (used for pagination)
    getItemList(type: ItemType,start: number): Promise<Item[]>;
    init();
    dispose();
}


