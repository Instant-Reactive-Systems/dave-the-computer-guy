import type { Item, ItemType } from "./item";

export type HouseLayout = {
    [K in ItemType]: {
        item: Item,
        x: number,
        y: number,
        rotation: {
            x: number,
            y: number,
            z: number
        }
        scale: {
            x: number,
            y: number,
            z: number
        }
    }
}

export type House = {
    name: string;
    id: number;
    houseLayout: HouseLayout;
    cost: number;
    owned: boolean;
}