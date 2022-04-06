import type { Circuit } from '$lib/models/circuit';
import { writable, type Writable } from 'svelte/store';

export const circuit:Writable<Circuit> = writable(null);