import type { ComponentDefinition } from "$lib/models/component_definition";
import type { User } from "$lib/models/user";
import type { BehaviorSubject } from "rxjs";



export type ComponentDefinitionLoaderService = {
    loadDefinitions(user: User): Promise<Map<number, ComponentDefinition>>;
    deleteDefinition(id: number): Promise<ComponentDefinition>;
    insertDefinition(definition: ComponentDefinition, force: boolean): Promise<void>;
    getDefinitionsBehaviourSubject(): BehaviorSubject<Map<number, ComponentDefinition>>;
    getDefinition(id: number): ComponentDefinition;
    getDefinitions(ids: number[]): Map<number, ComponentDefinition>;
    init();
    dispose();
}
