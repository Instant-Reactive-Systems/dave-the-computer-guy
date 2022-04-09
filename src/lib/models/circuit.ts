import type { Option } from "ts-results"
import type { Connection } from "./connection"
import type { Junction } from "./junction"
import type { Param } from "./param"
import type { Wire } from "./wire"

export type Circuit = {
    id: number,
    name: string,
    components: {
        id: number,
        definitionId: number
    }[],
    connections: Connection[],
    params: Param[],
    metadata: {
        rendering:Option<{
            components: {
                id: number,
                x: number,
                y: number
            }[],
            wiring: {
                connection: Connection,
                wires: Wire[]
            }[],
            junctions: Junction[]
        }>
    }
}