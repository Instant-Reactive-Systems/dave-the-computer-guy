import type { Option } from "ts-results"
import type { Connection } from "./connection"
import type { Connector } from "./connector"


export type Component = {
    id: number,
    definitionId: number,
}

export type Pins {
    input: Connector[],
    output: Connector[]
}

export type Circuit = {
    components: Component[],
    connections: Connection[]
}

export type ComponentDefinition = {
    id: number,
    name: string,
    desc: string,
    pins: Pins,
    circuit: Circuit,
    truthTable: Option<boolean[][]>
    booleanFunction: Option<String>
}