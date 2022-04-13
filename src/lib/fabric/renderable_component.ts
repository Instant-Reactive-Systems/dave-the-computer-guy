import type { fabric } from 'fabric'

export interface RenderableComponent{
    type: 'builtin' | 'generic',
    buildFabricObject():fabric.Object,
    onClick(),
    update(state:any),
}