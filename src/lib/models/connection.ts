import type { Connector } from "./connector"

export type Connection = {
    from: Connector;
    to: Connector[];
}
