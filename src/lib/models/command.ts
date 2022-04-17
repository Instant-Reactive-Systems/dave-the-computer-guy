export type Command = {
    name: string,
    do: () => any,
    undo: () => any
}
