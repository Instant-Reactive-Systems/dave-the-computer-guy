import type { Connection } from "./connection"

export type Junction = {
    x: number,
    y: number,
    sourceConnections: Connection[]
}