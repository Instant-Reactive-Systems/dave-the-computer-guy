export function $todo(msg: string | undefined = undefined) {
    throw new Error(msg || 'reached code marked as \'todo\'');
}
