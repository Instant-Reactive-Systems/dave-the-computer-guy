import type { UserEvent } from '$lib/models/user_event';
import type { fabric } from 'fabric'

export interface RenderableComponent{
    type: 'builtin' | 'generic',
    buildFabricObject():fabric.Object,
    onClick(): UserEvent,
    update(state:any),
}