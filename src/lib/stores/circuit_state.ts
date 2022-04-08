import type { CircuitState } from "$lib/models/circuit_state";
import { writable, type Writable } from "svelte/store";

export const circuitStateStore:Writable<CircuitState> = writable(null);
