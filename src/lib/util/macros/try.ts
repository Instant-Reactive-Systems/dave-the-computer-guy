import type { Result } from 'ts-results';
import { $$escape } from 'ts-macros';

export function $try<T, E>(res: Result<T, E>) {
    $$escape!(() => {
        if (res.err) return res.val;
    });

    return res.val;
}
