import type { ComponentDefinition } from "$lib/models/component_definition";
import type { Item } from "$lib/models/item";
import type { User } from "$lib/models/user";
import { copy } from "$lib/util/common";
import { BehaviorSubject, Subscription } from "rxjs";
import type { UserService } from "../auth_service";
import type { ComponentDefinitionLoaderService } from "../component_definition_loader_service";
import type { ElectronicsShopService } from "../electronics_shop_service";

export class MockElectronicsShopService implements ElectronicsShopService {
    private itemsBehaviourSubject: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);
    private userService: UserService;
    private defLoaderService: ComponentDefinitionLoaderService;
    private subscriptions: Subscription[]  = [];

    constructor(userService: UserService, defLoaderService: ComponentDefinitionLoaderService) {
        this.userService = userService;
        this.defLoaderService = defLoaderService;
    }

    init() {
        this.subscriptions.push(this.defLoaderService
            .getDefinitionsBehaviourSubject()
            .subscribe(components => {
                this.updateShopInventory(Array.from(components.values()));
            })
        )
    }

    private updateShopInventory(components: ComponentDefinition[]){
        const items = components.filter(def => def.id < 0).map(def => {
            const item: Item = {
                componentDefinition: def,
                cost: Math.floor(Math.random()*100)
            }
            return item;
        });
        this.itemsBehaviourSubject.next(items);
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.unsubscribe())
    }

    async buyItem(item: Item): Promise<boolean> {
        const user:User = copy(this.userService.getUserBehaviourSubject().getValue());
        if(user.balance < item.cost){
            return false;
        }
        user.balance -= item.cost;
        user.inventory.push(item);
        this.userService.getUserBehaviourSubject().next(user);
        return true;
    }

    getItemsBehaviourSubject(): BehaviorSubject<Item[]> {
        return this.itemsBehaviourSubject;
    }

}