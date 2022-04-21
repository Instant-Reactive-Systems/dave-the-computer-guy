export function $assert(expr: boolean, msg: string | undefined = undefined) {
    if (!expr) throw new Error(msg || 'assertion failed');
}
