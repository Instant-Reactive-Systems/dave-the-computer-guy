import type { CircuitState } from "$lib/models/circuit_state";
import { writable, type Writable } from "svelte/store";

export const circuitState:Writable<CircuitState> = writable(null);
