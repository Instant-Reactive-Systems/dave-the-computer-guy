import type { ComponentDefinition } from "$lib/models/component_definition";
import { writable, type Writable } from "svelte/store";

const registry: Writable<ComponentDefinition> = writable(null);