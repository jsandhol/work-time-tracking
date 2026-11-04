const DEFAULT_HISTORY_LIMIT = 20;
const MAX_HISTORY_LIMIT = 1000;

export const DEFAULT_SNIPPET_LANGUAGES = Object.freeze([
    'bash',
    'basic',
    'dos',
    'html',
    'java',
    'javascript',
    'json',
    'sql',
    'text',
    'typescript',
    'xml',
]);

const DEFAULT_SEARCH = Object.freeze({
    google: 'https://www.google.com/search?q=',
    google_ai: 'https://www.google.com/search?udm=50&q=',
    issues: 'https://jira.your-jira-server.com/secure/QuickSearch.jspa?searchString=',
    reddit: 'https://www.google.com/search?q=site.reddit.com+',
    sof: 'https://www.google.com/search?q=site.stackoverflow.com+',
});

const DEFAULT_LINK = Object.freeze({
    title: 'Chat GPT',
    href: 'https://chat.openai.com/',
});

const DEFAULT_REPORTING_SYSTEMS = Object.freeze([
    { id: 'client-a', label: 'Client A' },
    { id: 'client-b', label: 'Client B' },
]);

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asString(value) {
    if (value === undefined || value === null) return '';
    return typeof value === 'string' ? value : String(value);
}

function isDone(value) {
    return value === true || String(value).toLowerCase() === 'true';
}

function createDefaultConfig() {
    return {
        history: DEFAULT_HISTORY_LIMIT,
        search: { ...DEFAULT_SEARCH },
        links: [{ ...DEFAULT_LINK }],
        reporting: {
            systems: DEFAULT_REPORTING_SYSTEMS.map(system => ({ ...system })),
        },
    };
}

export function createDefaultData() {
    return {
        version: 2,
        times: [],
        todos: [],
        notes: [],
        snippets: [
            {
                lang: 'javascript',
                title: 'Hello World Sample',
                snippet: 'console.log("Hello World!");',
            },
        ],
        history: {
            times: [],
            notes: [],
            snippets: [...DEFAULT_SNIPPET_LANGUAGES],
        },
        config: createDefaultConfig(),
    };
}

export function normalizeHistoryLimit(value) {
    if (value === undefined || value === null || value === '') return DEFAULT_HISTORY_LIMIT;
    const number = Number(value);
    if (!Number.isFinite(number)) return DEFAULT_HISTORY_LIMIT;
    return Math.min(MAX_HISTORY_LIMIT, Math.max(0, Math.floor(number)));
}

function normalizeHistoryValue(value) {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const text = String(value).trim();
    if (!text || text === '@END' || /^(undefined|null)$/i.test(text)) return null;
    return text;
}

export function dedupeHistory(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const result = [];
    for (const item of list) {
        const value = normalizeHistoryValue(item);
        if (!value || seen.has(value)) continue;
        seen.add(value);
        result.push(value);
    }
    return result;
}

export function normalizeHistory(list, limit) {
    const max = normalizeHistoryLimit(limit);
    if (max === 0) return [];
    return dedupeHistory(list).slice(0, max);
}

export function normalizeLanguageVocabulary(list) {
    const seen = new Set();
    const result = [];
    const source = [...DEFAULT_SNIPPET_LANGUAGES, ...(Array.isArray(list) ? list : [])];

    for (const item of source) {
        const value = normalizeHistoryValue(item);
        if (!value) continue;
        const key = value.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(value);
    }

    return result;
}

export function touchHistory(data, kind, rawValue) {
    if (kind !== 'times' && kind !== 'notes') throw new Error(`Unknown history kind: ${kind}`);

    const limit = normalizeHistoryLimit(data.config.history);
    if (limit === 0) {
        data.history[kind] = [];
        return false;
    }

    const value = normalizeHistoryValue(rawValue);
    if (!value) return false;

    const rest = dedupeHistory(data.history[kind]).filter(item => item !== value);
    data.history[kind] = [value, ...rest].slice(0, limit);
    return true;
}

export function touchLanguage(data, rawValue) {
    const value = normalizeHistoryValue(rawValue);
    if (!value) return false;

    const list = normalizeLanguageVocabulary(data.history.snippets);
    const key = value.toLowerCase();
    if (!list.some(item => item.toLowerCase() === key)) list.push(value);
    data.history.snippets = list;
    return true;
}

export function trimHistory(data) {
    const limit = normalizeHistoryLimit(data.config.history);
    data.history.times = normalizeHistory(data.history.times, limit);
    data.history.notes = normalizeHistory(data.history.notes, limit);
    data.history.snippets = normalizeLanguageVocabulary(data.history.snippets);
}

function deriveTimeHistory(times, limit) {
    const max = normalizeHistoryLimit(limit);
    if (max === 0) return [];

    const seen = new Set();
    const result = [];
    for (let index = times.length - 1; index >= 0; index -= 1) {
        const value = normalizeHistoryValue(times[index]?.ref);
        if (!value || seen.has(value)) continue;
        seen.add(value);
        result.push(value);
        if (result.length >= max) break;
    }
    return result;
}

function orientStoredHistory(derived, stored) {
    if (derived.length < 2 || stored.length < 2) return stored;

    const derivedSet = new Set(derived);
    const storedSet = new Set(stored);
    const overlapDerived = derived.filter(value => storedSet.has(value));
    const overlapStored = stored.filter(value => derivedSet.has(value));

    if (overlapDerived.length < 2 || overlapDerived.length !== overlapStored.length) return stored;
    if (overlapDerived.every((value, index) => value === overlapStored[index])) return stored;
    if (overlapDerived.every((value, index) => value === overlapStored[overlapStored.length - 1 - index])) return [...stored].reverse();

    const positions = new Map(overlapDerived.map((value, index) => [value, index]));
    const sequence = overlapStored.map(value => positions.get(value));
    let sameOrder = 0;
    let reverseOrder = 0;

    for (let i = 0; i < sequence.length; i += 1) {
        for (let j = i + 1; j < sequence.length; j += 1) {
            if (sequence[i] < sequence[j]) sameOrder += 1;
            else reverseOrder += 1;
        }
    }

    return reverseOrder > sameOrder ? [...stored].reverse() : stored;
}

function mergeTimeHistory(derived, stored, limit) {
    const max = normalizeHistoryLimit(limit);
    if (max === 0) return [];

    const seen = new Set();
    const result = [];
    for (const value of [...derived, ...stored]) {
        if (seen.has(value)) continue;
        seen.add(value);
        result.push(value);
        if (result.length >= max) break;
    }
    return result;
}

function normalizeHistoryObject(rawHistory, limit, version, times) {
    const source = isPlainObject(rawHistory) ? rawHistory : {};
    const max = normalizeHistoryLimit(limit);
    const isV2 = Number.isFinite(version) && version >= 2;

    let timesHistory;
    if (isV2) {
        timesHistory = Array.isArray(source.times) ? normalizeHistory(source.times, max) : deriveTimeHistory(times, max);
    } else {
        const derived = deriveTimeHistory(times, max);
        const stored = orientStoredHistory(derived, dedupeHistory(source.times));
        timesHistory = mergeTimeHistory(derived, stored, max);
    }

    return {
        times: timesHistory,
        notes: normalizeHistory(source.notes, max),
        snippets: normalizeLanguageVocabulary(source.snippets),
    };
}

function normalizeReported(value) {
    if (!isPlainObject(value)) return null;

    const reported = {};
    for (const [rawKey, rawValue] of Object.entries(value)) {
        const key = asString(rawKey).trim();
        const at = typeof rawValue === 'string' ? rawValue.trim() : '';
        if (!key || !at) continue;
        reported[key] = at;
    }

    return Object.keys(reported).length > 0 ? reported : null;
}

function normalizeTimes(value) {
    if (!Array.isArray(value)) return [];
    return value
        .filter(isPlainObject)
        .map(item => {
            const { reported: rawReported, ...rest } = item;
            const reported = normalizeReported(rawReported);
            return {
                ...rest,
                time: asString(item.time),
                ref: asString(item.ref),
                desc: asString(item.desc),
                ...(reported ? { reported } : {}),
            };
        });
}

function normalizeTodos(value) {
    if (!Array.isArray(value)) return [];
    return value
        .filter(isPlainObject)
        .map(item => ({
            ...item,
            title: asString(item.title),
            due: asString(item.due),
            done: isDone(item.done),
        }));
}

function normalizeNotes(value) {
    if (!Array.isArray(value)) return [];
    return value
        .filter(isPlainObject)
        .map(item => ({
            ...item,
            category: asString(item.category),
            title: asString(item.title),
            note: asString(item.note),
        }));
}

function normalizeSnippets(value) {
    if (!Array.isArray(value)) return [];
    return value
        .filter(isPlainObject)
        .map(item => ({
            ...item,
            lang: asString(item.lang),
            title: asString(item.title),
            snippet: asString(item.snippet),
        }));
}

function normalizeSystems(value) {
    const fallback = () => DEFAULT_REPORTING_SYSTEMS.map(system => ({ ...system }));
    if (!Array.isArray(value)) return fallback();
    if (value.length === 0) return [];

    const systems = [];
    const seen = new Set();
    for (const item of value) {
        if (!isPlainObject(item)) continue;
        const id = asString(item.id).trim();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        systems.push({ ...item, id, label: asString(item.label).trim() || id });
    }

    return systems.length > 0 ? systems : fallback();
}

function normalizeConfig(rawConfig) {
    const base = createDefaultConfig();
    if (!isPlainObject(rawConfig)) return base;

    const rawSearch = isPlainObject(rawConfig.search) ? rawConfig.search : {};
    const search = {
        google: asString(rawSearch.google ?? base.search.google),
        google_ai: asString(rawSearch.google_ai ?? base.search.google_ai),
        issues: asString(rawSearch.issues ?? base.search.issues),
        reddit: asString(rawSearch.reddit ?? base.search.reddit),
        sof: asString(rawSearch.sof ?? base.search.sof),
    };
    const links = Array.isArray(rawConfig.links)
        ? rawConfig.links.filter(isPlainObject).map(link => ({
              ...link,
              title: asString(link.title),
              href: asString(link.href),
          }))
        : base.links;
    const rawReporting = isPlainObject(rawConfig.reporting) ? rawConfig.reporting : {};
    const reporting = { ...rawReporting, systems: normalizeSystems(rawReporting.systems) };

    return {
        ...base,
        ...rawConfig,
        history: normalizeHistoryLimit(rawConfig.history ?? base.history),
        search,
        links,
        reporting,
    };
}

export function normalizeData(raw) {
    if (!isPlainObject(raw)) throw new Error('Stored data is not a JSON object.');

    const config = normalizeConfig(raw.config);
    const times = normalizeTimes(raw.times);
    const todos = normalizeTodos(raw.todos);
    const notes = normalizeNotes(raw.notes);
    const snippets = normalizeSnippets(raw.snippets);
    const version = Number(raw.version);
    const history = normalizeHistoryObject(raw.history, config.history, Number.isFinite(version) ? version : 1, times);
    const data = { version: 2, times, todos, notes, snippets, history, config };

    sortTodosInPlace(data.todos);
    sortNotesInPlace(data.notes);
    sortSnippetsInPlace(data.snippets);

    return data;
}

export function compareTodos(a, b) {
    const doneA = isDone(a.done) ? 1 : 0;
    const doneB = isDone(b.done) ? 1 : 0;
    if (doneA !== doneB) return doneA - doneB;

    const dueA = asString(a.due) || '9999-12-31';
    const dueB = asString(b.due) || '9999-12-31';
    if (dueA !== dueB) return dueA < dueB ? -1 : 1;

    const titleA = asString(a.title).toLowerCase();
    const titleB = asString(b.title).toLowerCase();
    if (titleA === titleB) return 0;
    return titleA < titleB ? -1 : 1;
}

export function compareNotes(a, b) {
    const categoryA = asString(a.category).toLowerCase();
    const categoryB = asString(b.category).toLowerCase();
    if (categoryA !== categoryB) return categoryA < categoryB ? -1 : 1;

    const titleA = asString(a.title).toLowerCase();
    const titleB = asString(b.title).toLowerCase();
    if (titleA === titleB) return 0;
    return titleA < titleB ? -1 : 1;
}

export function compareSnippets(a, b) {
    const langA = asString(a.lang).toLowerCase();
    const langB = asString(b.lang).toLowerCase();
    if (langA !== langB) return langA < langB ? -1 : 1;

    const titleA = asString(a.title).toLowerCase();
    const titleB = asString(b.title).toLowerCase();
    if (titleA === titleB) return 0;
    return titleA < titleB ? -1 : 1;
}

export function sortTodosInPlace(list) {
    list.sort(compareTodos);
}

export function sortNotesInPlace(list) {
    list.sort(compareNotes);
}

export function sortSnippetsInPlace(list) {
    list.sort(compareSnippets);
}

function pad(value) {
    return String(value).padStart(2, '0');
}

export function formatMillis(milliseconds) {
    const value = Number(milliseconds);
    if (!Number.isFinite(value)) throw new Error(`Invalid duration: ${String(milliseconds)}`);

    const totalSeconds = Math.max(0, Math.floor(value / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDateTime(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${String(value)}`);

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatDate(value = new Date()) {
    return formatDateTime(value).slice(0, 10);
}

export function parseLocalDateTime(value) {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value !== 'string') return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
    if (!match) return null;

    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second ?? 0));

    const valid =
        date.getFullYear() === Number(year) &&
        date.getMonth() === Number(month) - 1 &&
        date.getDate() === Number(day) &&
        date.getHours() === Number(hour) &&
        date.getMinutes() === Number(minute) &&
        date.getSeconds() === Number(second ?? 0);

    return valid ? date : null;
}

export function calcTotals(times, now = Date.now()) {
    const nowMillis = now instanceof Date ? now.getTime() : Number(now);
    if (!Number.isFinite(nowMillis)) throw new Error('Invalid current time for summary.');

    const list = Array.isArray(times) ? times : [];
    const byRef = new Map();
    let hasInvalid = false;

    for (let index = 0; index < list.length; index += 1) {
        const row = list[index];
        if (row.ref === '@END') continue;

        const ref = asString(row.ref) || '(no reference)';
        let entry = byRef.get(ref);
        if (!entry) {
            entry = { ref, millis: 0, invalid: false };
            byRef.set(ref, entry);
        }

        const start = parseLocalDateTime(row.time);
        const next = list[index + 1];
        const end = next ? parseLocalDateTime(next.time) : new Date(nowMillis);

        if (!start || !end) {
            entry.invalid = true;
            hasInvalid = true;
            continue;
        }

        const millis = end.getTime() - start.getTime();
        if (millis < 0) {
            entry.invalid = true;
            hasInvalid = true;
            continue;
        }

        entry.millis += millis;
    }

    const rows = [...byRef.values()].map(entry => ({ ...entry, time: formatMillis(entry.millis) }));
    const totalMillis = rows.reduce((sum, entry) => sum + entry.millis, 0);

    return {
        rows,
        total: { millis: totalMillis, time: formatMillis(totalMillis) },
        hasInvalid,
    };
}
