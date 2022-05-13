export type CallbackType = (event: KeyboardEvent) => void;

/// Sets a scoped keydown event listener on the specified node.
export function on_keydown(node: HTMLElement, callback: CallbackType) {
    // Makes the element focusable so it's checkable 
    // via document.activeElement
    node.tabIndex = -1;

    // Removes focus outline from element
    node.classList.add('remove-focus-outline');

    // Add event listener to the node
    node.addEventListener('keydown', callback);

    return {
        destroy: () => {
            node.removeEventListener('keydown', callback);
        }
    };
}

