import { writable, type Writable } from "svelte/store";

export const simulationStateStore:Writable<'RUNNING' | 'STOPPED' | 'PAUSED'> = writable('STOPPED');
