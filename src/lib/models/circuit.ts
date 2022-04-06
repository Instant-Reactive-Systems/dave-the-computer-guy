import type { Connection } from "./connection"
import type { Junction } from "./junction"
import type { Wire } from "./wire"

export type Circuit = {
    id: number,
    name: string,
    components: {
        componentId: number,
        definitionId: number
    },
    connections: Connection[],
    metadata: {
        rendering: {
            components: {
                componentId: number,
                x: number,
                y: number
            }[],
            wiring: {
                connection: Connection,
                wires: Wire[]
            }[],
            junctions: Junction[]
        }
    }
}