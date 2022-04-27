import type { EditorMode } from "$lib/models/editor_mode";
import { writable, type Writable } from "svelte/store";

export const editorModeStore:Writable<EditorMode> = writable({
    type: "edit",
    data: null
});