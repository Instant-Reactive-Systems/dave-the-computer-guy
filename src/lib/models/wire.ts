import type { Connector } from "./connector";


export type DirectLink = {
  type: 'pin' | 'wire';
  value: { conn: Connector, type: 'input' | 'output' } | number;
}

export type Wire = {
  id: number;  
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  links: DirectLink[];
}
  