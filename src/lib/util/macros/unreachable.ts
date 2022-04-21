export function $unreachable(msg: string | undefined = undefined) {
    throw new Error(msg || 'unreachable reached');
}
