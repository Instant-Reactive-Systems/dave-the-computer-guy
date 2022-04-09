import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { Connection } from "$lib/models/connection";
import type { Connector } from "$lib/models/connector";
import type { Ok, Result } from "ts-results";

export class JsonParser{
    
    parseComponentDefinition(): Result<ComponentDefinition,Error>{
        return null;
    }
    
    parseCircuit(): Result<Circuit,Error>{
        return null;
    }

    parseConnection(): Result<Connection,Error>{
        return null;
    }

    parseConnector(): Result<Connector,Error>{
        return null;
    }
    
    parse



}