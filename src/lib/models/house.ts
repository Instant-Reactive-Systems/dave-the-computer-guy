import type { Item, ItemType } from "./item";

export type HouseData = {
    [K in ItemType]?: {
        all: Item[],
        prefferedItemId: number
    }
}

export type House = {
    name: string;
    id: number;
    houseData: HouseData;
    cost: number;
    owned: boolean;
    imageUrl: string;
}