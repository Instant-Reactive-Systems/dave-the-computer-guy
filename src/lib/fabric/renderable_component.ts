type RenderableComponent = {
    render(canvas:fabric.Canvas),
    setState(state:any): void,
    onClick():void
}