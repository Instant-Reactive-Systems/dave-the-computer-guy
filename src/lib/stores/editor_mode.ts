import { DEFAULT_EDIT_MODE, type EditorMode } from "$lib/models/editor_mode";
import { writable, type Writable } from "svelte/store";

export const editorModeStore: Writable<EditorMode> = writable(DEFAULT_EDIT_MODE);

