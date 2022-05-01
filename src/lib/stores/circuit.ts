import type { Circuit } from '$lib/models/circuit';
import { writable, type Writable } from 'svelte/store';

export const circuitStore:Writable<Circuit> = writable(null);