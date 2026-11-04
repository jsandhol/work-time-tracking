import { MediaQuery } from 'svelte/reactivity';

const THEME_KEY = 'wtt-theme';
const MODES = ['system', 'light', 'dark'];

function isMode(value) {
    return MODES.includes(value);
}

class Theme {
    mode = $state('system');
    #dark = new MediaQuery('(prefers-color-scheme: dark)');

    get resolved() {
        return this.mode === 'system' ? (this.#dark.current ? 'dark' : 'light') : this.mode;
    }

    init() {
        const stored = localStorage.getItem(THEME_KEY);
        this.mode = isMode(stored) ? stored : 'system';
    }

    cycle = () => {
        const next = MODES[(MODES.indexOf(this.mode) + 1) % MODES.length];
        this.mode = next;
        localStorage.setItem(THEME_KEY, next);
    };
}

export const theme = new Theme();
