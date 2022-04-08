import type { ComponentDefinition } from "$lib/models/component_definition";
import { writable, type Writable } from "svelte/store";

const registryStore: Writable<ComponentDefinition> = writable(null);