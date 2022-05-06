import { 
} from 'svelte-notifications';

export type NotifierOptions = {
    position: string,
    removeAfter: number,
};

const DEFAULT_OPTIONS: NotifierOptions = {
    position: 'top-center',
    removeAfter: 2000,
};

export default class Notifier {
    ctx: any;
    options: NotifierOptions;

    constructor(ctx: any, options: NotifierOptions = DEFAULT_OPTIONS) {
        this.ctx = ctx;
        this.options = options;
    }

    success(msg: string) {
        this.ctx.addNotification({
            text: msg,
            position: this.options.position,
            type: 'success',
            removeAfter: this.options.removeAfter,
        });
    }
    
    warning(msg: string) {
        this.ctx.addNotification({
            text: msg,
            position: this.options.position,
            type: 'warning',
            removeAfter: this.options.removeAfter,
        });
    }
    
    danger(msg: string) {
        this.ctx.addNotification({
            text: msg,
            position: this.options.position,
            type: 'danger',
            removeAfter: this.options.removeAfter,
        });
    }

    info(msg: string) {
        this.ctx.addNotification({
            text: msg,
            position: this.options.position,
            removeAfter: this.options.removeAfter,
        });
    }
}

