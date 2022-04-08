import type { Component } from "$lib/models/component";
import { writable, type Writable } from "svelte/store";

export const selectedComponentStore: Writable<Component> = writable();