import { writable, type Writable } from "svelte/store";
import type {Event} from '$lib/models/event';
export const eventStore:Writable<Event> = writable();