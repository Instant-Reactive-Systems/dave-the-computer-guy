import type { EditorMode } from "$lib/models/editor_mode";
import {defaultEditorMode} from "$lib/models/editor_mode"
import { writable, type Writable } from "svelte/store";

export const editorModeStore: Writable<EditorMode> = writable(defaultEditorMode());

