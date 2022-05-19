import type { Component } from "$lib/models/component";
import { writable, type Writable } from "svelte/store";

export const componentStore: Writable<Component> = writable(null);

