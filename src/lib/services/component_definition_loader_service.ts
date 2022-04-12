import type { Circuit } from "$lib/models/circuit";
import type { Component, ComponentDefinition } from "$lib/models/component_definition";
import type { User } from "$lib/models/user";
import type { BehaviorSubject } from "rxjs";
import type { Result } from "ts-results";



export type ComponentDefinitionLoaderService = {
    loadUserDefinitions(user:User, offset:number, limit:number): Promise<Result<ComponentDefinition[],Error>>,
    deleteDefinition(id: number):Promise<Result<ComponentDefinition,Error>>
    insertDefinition(definition: ComponentDefinition, force: boolean): Promise<Result<void,Error>>,
    getUserDefinitionsBehaviourSubject(): BehaviorSubject<ComponentDefinition[]>,
}