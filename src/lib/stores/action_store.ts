import { writable, type Writable } from "svelte/store";
import type { Action } from "$lib/models/action";

export const actionStore: Writable<Action> = writable(null);

