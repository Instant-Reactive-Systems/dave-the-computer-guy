import type { Circuit } from "$lib/models/circuit";
import type { Component, ComponentDefinition } from "$lib/models/component_definition";
import type { User } from "$lib/models/user";
import type { BehaviorSubject } from "rxjs";
import type { Result } from "ts-results";



export type ComponentDefinitionLoaderService = {
    loadDefinitions(user:User, offset:number, limit:number): Promise<Result<Map<number,ComponentDefinition>,Error>>,
    deleteDefinition(id: number):Promise<Result<ComponentDefinition,Error>>
    insertDefinition(definition: ComponentDefinition, force: boolean): Promise<Result<void,Error>>,
    getDefinitionsBehaviourSubject(): BehaviorSubject<Map<number,ComponentDefinition>>,
    getDefinition(id:number): Result<ComponentDefinition,Error>,
    init(),
    dispose()
}