export type Command = {
    name: string,
    do: (payload: any) => any,
    undo: (payload: any) => any
}