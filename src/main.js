import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';
import { initApp } from '$lib/store.svelte.js';

function showFatalError(error) {
    console.error('Work Time Tracking failed to start:', error);

    const target = document.getElementById('app');
    if (!target) return;

    target.replaceChildren();

    const panel = document.createElement('div');
    panel.className = 'fatal-error';

    const title = document.createElement('h1');
    title.textContent = 'Work Time Tracking could not start';

    const message = document.createElement('p');
    message.textContent = error instanceof Error ? error.message : String(error);

    const note = document.createElement('p');
    note.textContent = 'Your stored data was not modified. The browser console contains the full error.';

    const actions = document.createElement('div');
    actions.className = 'fatal-actions';

    const reload = document.createElement('button');
    reload.type = 'button';
    reload.className = 'btn';
    reload.textContent = 'Reload';
    reload.onclick = () => location.reload();

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn btn-danger';
    reset.textContent = 'Clear stored data and reload';
    reset.onclick = () => {
        if (confirm('Delete wtt-data and wtt-theme from this browser, then reload? This cannot be undone.')) {
            localStorage.removeItem('wtt-data');
            localStorage.removeItem('wtt-theme');
            location.reload();
        }
    };

    actions.append(reload, reset);
    panel.append(title, message, note, actions);
    target.append(panel);
}

try {
    initApp();
    const target = document.getElementById('app');
    if (!target) throw new Error('Missing #app mount target');
    mount(App, { target });
    document.documentElement.style.removeProperty('background-color');
} catch (error) {
    showFatalError(error);
}
