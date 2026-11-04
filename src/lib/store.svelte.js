import {
    createDefaultData,
    formatDateTime,
    normalizeData,
    normalizeHistoryLimit,
    sortNotesInPlace,
    sortSnippetsInPlace,
    sortTodosInPlace,
    touchHistory,
    touchLanguage,
    trimHistory,
} from '../utils.js';
import { theme } from './theme.svelte.js';

const STORAGE_KEY = 'wtt-data';

export const app = $state({
    data: createDefaultData(),
    messages: [],
    saveStatus: 'saved',
    ready: false,
});

let nextMessageId = 0;

export function notify(text, tone = 'info') {
    const id = (nextMessageId += 1);
    app.messages.push({ id, text, tone });
    if (app.messages.length > 8) app.messages.shift();
}

export function dismissMessage(id) {
    const index = app.messages.findIndex(message => message.id === id);
    if (index !== -1) app.messages.splice(index, 1);
}

export function clearMessages() {
    app.messages.splice(0, app.messages.length);
}

export function initApp() {
    if (app.ready) return;

    const raw = localStorage.getItem(STORAGE_KEY);
    app.data = raw ? normalizeData(JSON.parse(raw)) : createDefaultData();
    app.saveStatus = 'saved';
    theme.init();
    app.ready = true;
}

export function markDirty() {
    if (app.saveStatus !== 'dirty') app.saveStatus = 'dirty';
}

export function saveNow() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(app.data)));
        app.saveStatus = 'saved';
        return true;
    } catch (error) {
        app.saveStatus = 'error';
        console.error('Could not save Work Time Tracking data:', error);
        notify(`Could not save data: ${error instanceof Error ? error.message : String(error)}`, 'error');
        return false;
    }
}

function commit(message) {
    if (saveNow()) notify(message, 'success');
}

export function importData(raw) {
    app.data = normalizeData(raw);
    commit('Full config imported.');
}

export function setHistoryLimit(value) {
    const limit = normalizeHistoryLimit(value);
    app.data.config.history = limit;
    trimHistory(app.data);
    commit(`History limited to ${limit} item${limit === 1 ? '' : 's'}.`);
}

export function addTime({ time, ref, desc }) {
    const entry = { time: String(time).trim(), ref: String(ref ?? '').trim(), desc: String(desc ?? '') };
    app.data.times.push(entry);
    touchHistory(app.data, 'times', entry.ref);
    commit(entry.ref ? `Added ${entry.ref}.` : 'Added time row.');
}

export function removeTime(time) {
    const index = app.data.times.indexOf(time);
    if (index === -1) throw new Error('Time row not found.');
    app.data.times.splice(index, 1);
    commit('Removed time row.');
}

export function beginTime(time) {
    time.time = formatDateTime();
    commit('Time replaced with the current time.');
}

export function addTodo({ title, due }) {
    const cleanTitle = String(title ?? '').trim();
    if (!cleanTitle) throw new Error('Todo title is required.');

    app.data.todos.push({ title: cleanTitle, due: String(due ?? '').trim(), done: false });
    sortTodosInPlace(app.data.todos);
    commit(`Added todo ${cleanTitle}.`);
}

export function removeTodo(todo) {
    const index = app.data.todos.indexOf(todo);
    if (index === -1) throw new Error('Todo not found.');
    app.data.todos.splice(index, 1);
    commit(`Removed todo ${todo.title}.`);
}

export function sortTodos() {
    sortTodosInPlace(app.data.todos);
    commit('Todos sorted.');
}

export function addNote({ category, title, note }) {
    const cleanCategory = String(category ?? '').trim();
    const cleanTitle = String(title ?? '').trim();
    if (!cleanCategory || !cleanTitle) throw new Error('Note category and title are required.');

    app.data.notes.push({ category: cleanCategory, title: cleanTitle, note: String(note ?? '') });
    touchHistory(app.data, 'notes', cleanCategory);
    sortNotesInPlace(app.data.notes);
    commit(`Added note ${cleanTitle}.`);
}

export function removeNote(note) {
    const index = app.data.notes.indexOf(note);
    if (index === -1) throw new Error('Note not found.');
    app.data.notes.splice(index, 1);
    commit(`Removed note ${note.title}.`);
}

export function sortNotes() {
    sortNotesInPlace(app.data.notes);
    commit('Notes sorted.');
}

export function addSnippet({ lang, title, snippet }) {
    const cleanLang = String(lang ?? '').trim();
    const cleanTitle = String(title ?? '').trim();
    if (!cleanLang || !cleanTitle) throw new Error('Snippet language and title are required.');

    app.data.snippets.push({ lang: cleanLang, title: cleanTitle, snippet: String(snippet ?? '') });
    touchLanguage(app.data, cleanLang);
    sortSnippetsInPlace(app.data.snippets);
    commit(`Added snippet ${cleanTitle}.`);
}

export function removeSnippet(snippet) {
    const index = app.data.snippets.indexOf(snippet);
    if (index === -1) throw new Error('Snippet not found.');
    app.data.snippets.splice(index, 1);
    commit(`Removed snippet ${snippet.title}.`);
}

export function sortSnippets() {
    sortSnippetsInPlace(app.data.snippets);
    commit('Snippets sorted.');
}

export function resetTime() {
    app.data.times = [];
    commit('Time data reset.');
}

export function resetAll() {
    app.data.times = [];
    app.data.todos = [];
    commit('Time and todo data reset.');
}
