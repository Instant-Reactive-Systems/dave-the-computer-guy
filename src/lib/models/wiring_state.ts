import type {Connector} from "./connector";

export type WireState = {
    connector: Connector,
    value: boolean,
};

export type WiringState = WireState[];

