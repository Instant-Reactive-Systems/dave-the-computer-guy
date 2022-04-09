import type { Input } from "postcss"
import type { Option } from "ts-results"
import type { Circuit } from "./circuit"
import type { Connection } from "./connection"
import type { Connector } from "./connector"


export type Component = {
    id: number,
    definitionId: number,
}

export type PinsMapping = {
    input: Connector[][],
    output: Connector[][]
}




export type Pins = {
    input: string[],
    output: string[]
}



export type ComponentDefinition = {
    id: number,
    name: string,
    description: string,
    pinsMapping: Option<PinsMapping>,
    pins: Pins
    circuit: Option<Circuit>,
    truthTable: Option<boolean[][]>,
    booleanFunction: Option<String>
    metadata: {
        imgURL: string,
    }
}