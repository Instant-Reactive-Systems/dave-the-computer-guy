import type { Item } from "$lib/models/item";
import type { BehaviorSubject } from "rxjs";

export type ElectronicsShopService = {
    init();
    dispose();
    buyItem(item: Item): Promise<boolean>;
    getItemsBehaviourSubject(): BehaviorSubject<Item[]>;
}