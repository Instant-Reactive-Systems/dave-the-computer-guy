import type { Connector } from "./connector";

export type ConnectorLink = {
  conn: Connector;
  type: 'input' | 'output';
}

export type DirectLink = {
  type: 'pin' | 'wire';
  value: ConnectorLink | number;
}

export type Wire = {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  links: DirectLink[];
}
