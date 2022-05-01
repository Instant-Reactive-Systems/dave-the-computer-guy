import { writable, type Writable } from "svelte/store";

export const circuitStateStore:Writable<Map<number,any>> = writable(null);
