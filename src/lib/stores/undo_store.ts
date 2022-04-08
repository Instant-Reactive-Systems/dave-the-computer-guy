import type { Command } from "$lib/models/command";
import { writable, type Writable } from "svelte/store";

export const undoStore:Writable<Command[]> = writable([]);