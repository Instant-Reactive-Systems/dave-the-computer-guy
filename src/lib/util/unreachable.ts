export function unreachable(message = undefined) {
    throw new Error(message || "Unreachable hit");
}