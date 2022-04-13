import type { ComponentDefinition } from "$lib/models/component_definition";
import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import { Err, Ok, type Result } from "ts-results";
import type { ComponentDefinitionLoaderService } from "../component_definition_loader_service";

export class MockComponentDefinitonLoaderService implements ComponentDefinitionLoaderService{
    private userDefinitionsBehaviourSubject: BehaviorSubject<ComponentDefinition[]> = new BehaviorSubject<ComponentDefinition[]>([]); ;
    async loadUserDefinitions(user: User, offset: number, limit: number): Promise<Result<ComponentDefinition[], Error>> {
        return Ok([]); 
    }

    async deleteDefinition(id: number): Promise<Result<ComponentDefinition, Error>> {
        const definitions = this.userDefinitionsBehaviourSubject.getValue();
        const definitionIndex = definitions.findIndex((val) => {
            return val.id == id;
        })
        if(definitionIndex < 0 ){
            return Err<Error>(new Error(`No definition with id=${id} found. Aborted delete operation`));
        }
        this.userDefinitionsBehaviourSubject.next([...definitions].splice(definitionIndex))
        return Ok(definitions[definitionIndex]);
    }

    insertDefinition(definition: ComponentDefinition, force: boolean): Promise<Result<void, Error>> {
        this.userDefinitionsBehaviourSubject.next([...this.userDefinitionsBehaviourSubject.getValue(),definition]);
        return 
    }

    getUserDefinitionsBehaviourSubject(): BehaviorSubject<ComponentDefinition[]> {
        return this.userDefinitionsBehaviourSubject;
    }

    getDefinition(id: number): Result<ComponentDefinition, Error> {
        const def = this.userDefinitionsBehaviourSubject.getValue().find((def) => def.id == id);
        if (def == undefined){
            return Err(Error(`No definition with id=${id}`))
        }
    }

}