import assert from 'node:assert/strict';
import test from 'node:test';
import { highlightCode } from '../src/lib/highlight.js';
import {
    buildSearchUrl,
    calcTotals,
    formatDate,
    formatDateTime,
    formatMillis,
    normalizeData,
    normalizeHistoryLimit,
    parseLocalDateTime,
    resolveIssueUrl,
    touchHistory,
} from '../src/utils.js';

const SAMPLE = {
    times: [
        { time: '2026-11-04 09:00:41', ref: 'Admin' },
        { time: '2026-11-04 09:15:47', ref: 'EN/HK', desc: 'JariL@Mail' },
        { time: '2026-11-04 09:21:59', ref: 'Break' },
        { time: '2026-11-04 09:40:49', ref: 'EN/HK' },
        { time: '2026-11-04 09:51:38', ref: '100493/108' },
        { time: '2026-11-04 10:51:20', ref: 'Admin' },
        { time: '2026-11-04 11:56:36', ref: 'ESD-154' },
        { time: '2026-11-04 12:04:16', ref: 'Break' },
        { time: '2026-11-04 13:00:30', ref: 'Learn' },
        { time: '2026-11-04 13:45:08', ref: 'Admin' },
        { time: '2026-11-04 14:24:16', ref: 'ESD-154' },
        { time: '2026-11-04 15:11:14', ref: '@END' },
    ],
    todos: [],
    notes: [],
    snippets: [{ lang: 'javascript', title: 'Hello World Sample', snippet: 'console.log("Hello World!");' }],
    history: {
        times: [
            'ESD-154',
            'Admin',
            'Learn',
            'Break',
            '100493/108',
            'EN/HK',
            'ESD-148',
            'VHSD',
            'EN/MWF-2',
            'ESD-138',
            'EN/MWF-1',
            '100396/101',
            'SOL-244',
            'EN/MWF2',
            'ELTEL-1069',
            'PLANNER-3094',
            'ERC-42',
            'OWGS-185',
            'ERC-6',
            '100493/106',
        ],
        notes: [],
        snippets: ['bash', 'basic', 'dos', 'html', 'java', 'javascript', 'json', 'sql', 'text', 'typescript', 'xml'],
    },
    config: {
        history: 20,
        search: {
            google: 'https://www.google.com/search?q=',
            issues: 'https://jira.your-jira-server.com/secure/QuickSearch.jspa?searchString=',
            reddit: 'https://www.google.com/search?q=site.reddit.com+',
            sof: 'https://www.google.com/search?q=site.stackoverflow.com+',
        },
        links: [{ title: 'Chat GPT', href: 'https://chat.openai.com/' }],
    },
};

test('normalizes the supplied sample and keeps newest-first history', () => {
    const data = normalizeData(structuredClone(SAMPLE));

    assert.equal(data.version, 2);
    assert.equal(data.times.length, SAMPLE.times.length);
    assert.deepEqual(data.history.times, SAMPLE.history.times);
    assert.equal(data.history.snippets.length, 11);
    assert.equal(data.history.snippets[0], 'bash');
});

test('detects and reverses an oldest-first v1 history', () => {
    const raw = structuredClone(SAMPLE);
    raw.history.times = [...raw.history.times].reverse();

    const data = normalizeData(raw);
    assert.deepEqual(data.history.times, SAMPLE.history.times);
});

test('does not reverse an exported newest-first sample', () => {
    const data = normalizeData(structuredClone(SAMPLE));
    assert.equal(data.history.times[0], 'ESD-154');
    assert.equal(data.history.times.at(-1), '100493/106');
});

test('touchHistory moves an existing ref to the front, dedupes, and trims', () => {
    const data = normalizeData(structuredClone(SAMPLE));

    assert.equal(touchHistory(data, 'times', 'Admin'), true);
    assert.equal(data.history.times[0], 'Admin');
    assert.equal(data.history.times.filter(value => value === 'Admin').length, 1);
    assert.equal(data.history.times.length, 20);

    data.config.history = 5;
    assert.equal(touchHistory(data, 'times', 'NEW-1'), true);
    assert.deepEqual(data.history.times, ['NEW-1', 'Admin', 'ESD-154', 'Learn', 'Break']);

    data.config.history = 0;
    touchHistory(data, 'times', 'NEW-2');
    assert.deepEqual(data.history.times, []);
});

test('rejects @END, empty, and legacy undefined/null history values', () => {
    const data = normalizeData(structuredClone(SAMPLE));
    const before = [...data.history.times];

    assert.equal(touchHistory(data, 'times', '@END'), false);
    assert.equal(touchHistory(data, 'times', '   '), false);
    assert.equal(touchHistory(data, 'times', 'undefined'), false);
    assert.equal(touchHistory(data, 'times', 'null'), false);
    assert.deepEqual(data.history.times, before);
});

test('preserves stored note history order', () => {
    const raw = structuredClone(SAMPLE);
    raw.history.notes = ['CatB', 'CatA'];

    const data = normalizeData(raw);
    assert.deepEqual(data.history.notes, ['CatB', 'CatA']);
});

test('N=0 empties ref/category history but keeps the language vocabulary', () => {
    const raw = structuredClone(SAMPLE);
    raw.config.history = 0;

    const data = normalizeData(raw);
    assert.deepEqual(data.history.times, []);
    assert.deepEqual(data.history.notes, []);
    assert.equal(data.history.snippets.length, 11);
});

test('limits note history without trimming the language vocabulary', () => {
    const raw = structuredClone(SAMPLE);
    raw.config.history = 5;
    raw.history.notes = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5', 'Cat6', 'Cat7'];

    const data = normalizeData(raw);
    assert.deepEqual(data.history.notes, ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5']);
    assert.equal(data.history.snippets.length, 11);
});

test('adds default reporting systems and preserves @END confirmations', () => {
    const raw = structuredClone(SAMPLE);
    raw.times.at(-1).reported = {
        'client-a': '2026-11-04 15:20:00',
        'client-b': '2026-11-04 15:25:00',
    };
    raw.config.reporting = {
        systems: [
            { id: 'client-a', label: 'Acme' },
            { id: 'client-b', label: 'Globex' },
        ],
    };

    const data = normalizeData(raw);
    assert.deepEqual(data.config.reporting.systems, raw.config.reporting.systems);
    assert.deepEqual(data.times.at(-1).reported, raw.times.at(-1).reported);
});

test('adds default reporting systems for old data and allows an explicit empty list', () => {
    const defaults = normalizeData(structuredClone(SAMPLE));
    assert.deepEqual(defaults.config.reporting.systems, [
        { id: 'client-a', label: 'Client A' },
        { id: 'client-b', label: 'Client B' },
    ]);

    const raw = structuredClone(SAMPLE);
    raw.config.reporting = { systems: [] };
    assert.deepEqual(normalizeData(raw).config.reporting.systems, []);
});

test('adds the Google AI search prefix and keeps the existing SOF prefix', () => {
    const data = normalizeData(structuredClone(SAMPLE));
    assert.equal(data.config.search.google_ai, 'https://www.google.com/search?udm=50&q=');
    assert.equal(data.config.search.sof, SAMPLE.config.search.sof);

    const raw = structuredClone(SAMPLE);
    raw.config.search.google_ai = 'https://example.com/ai?q=';
    assert.equal(normalizeData(raw).config.search.google_ai, 'https://example.com/ai?q=');
});

test('builds search URLs with an encoded query and a fallback append', () => {
    assert.equal(
        buildSearchUrl('https://company.atlassian.net/jira/issues/?jql=text~%22{query}%22', 'invoice export'),
        'https://company.atlassian.net/jira/issues/?jql=text~%22invoice%20export%22'
    );
    assert.equal(buildSearchUrl('https://example.com/search?q=', 'a&b'), 'https://example.com/search?q=a%26b');
    assert.equal(buildSearchUrl('https://example.com/search?q=', '  '), '');
    assert.equal(buildSearchUrl('', 'term'), '');
});

test('resolves issue browse URLs with ordered regex patterns', () => {
    const routes = [
        { pattern: '^ACME-1', url: 'https://special.atlassian.net/browse/{id}' },
        { pattern: '^(ACME|GLOBEX)-', url: 'https://acme.atlassian.net/browse/{id}' },
        { pattern: '^OPS-\\d+$', url: 'https://ops.atlassian.net/browse/' },
    ];

    assert.equal(resolveIssueUrl(routes, 'ACME-123'), 'https://special.atlassian.net/browse/ACME-123');
    assert.equal(resolveIssueUrl(routes, 'ACME-42'), 'https://acme.atlassian.net/browse/ACME-42');
    assert.equal(resolveIssueUrl(routes, ' GLOBEX-7 '), 'https://acme.atlassian.net/browse/GLOBEX-7');
    assert.equal(resolveIssueUrl(routes, 'OPS-220'), 'https://ops.atlassian.net/browse/OPS-220');
    assert.equal(resolveIssueUrl(routes, 'OPS-abc'), '');
    assert.equal(resolveIssueUrl(routes, 'acme-42'), '');
    assert.equal(resolveIssueUrl(routes, 'Admin'), '');
    assert.equal(resolveIssueUrl(routes, '@END'), '');
    assert.equal(resolveIssueUrl(routes, ''), '');
    assert.equal(resolveIssueUrl([], 'ACME-1'), '');
    assert.equal(resolveIssueUrl(undefined, 'ACME-1'), '');
});

test('normalizes issue browse routes and preserves their order', () => {
    const raw = structuredClone(SAMPLE);
    raw.config.search.issues = 'https://company.atlassian.net/jira/issues/?jql=text~%22{query}%22';
    raw.config.search.issue_routes = [
        { pattern: ' ^(ACME|GLOBEX)- ', url: ' https://acme.atlassian.net/browse/{id} ' },
        { pattern: '', url: 'https://ignored.example/' },
        { pattern: '^OPS-', url: '' },
        'not a route',
        { pattern: '^OPS-\\d+$', url: 'https://ops.atlassian.net/browse/{id}' },
    ];

    const data = normalizeData(raw);
    assert.deepEqual(data.config.search.issue_routes, [
        { pattern: '^(ACME|GLOBEX)-', url: 'https://acme.atlassian.net/browse/{id}' },
        { pattern: '^OPS-\\d+$', url: 'https://ops.atlassian.net/browse/{id}' },
    ]);
    assert.equal(data.config.search.issues, raw.config.search.issues);
});

test('defaults issue browse routes to an empty list and the issue search to JQL', () => {
    const sample = normalizeData(structuredClone(SAMPLE));
    assert.deepEqual(sample.config.search.issue_routes, []);

    const defaults = normalizeData({});
    assert.equal(defaults.config.search.issues, 'https://jira.your-jira-server.com/jira/issues/?jql=text~%22{query}%22');
});

test('normalizes history limits', () => {
    assert.equal(normalizeHistoryLimit(undefined), 20);
    assert.equal(normalizeHistoryLimit(''), 20);
    assert.equal(normalizeHistoryLimit('abc'), 20);
    assert.equal(normalizeHistoryLimit(-1), 0);
    assert.equal(normalizeHistoryLimit(5.9), 5);
    assert.equal(normalizeHistoryLimit(5000), 1000);
    assert.equal(normalizeHistoryLimit(0), 0);
});

test('does not reverse v2 history and derives it when missing', () => {
    const explicit = normalizeData({ version: 2, history: { times: ['A', 'B'] }, config: { history: 20 } });
    assert.deepEqual(explicit.history.times, ['A', 'B']);

    const derived = normalizeData({
        version: 2,
        times: [{ time: '2026-11-04 09:00:00', ref: 'A' }],
        history: {},
        config: { history: 20 },
    });
    assert.deepEqual(derived.history.times, ['A']);
});

test('rejects non-object stored data', () => {
    assert.throws(() => normalizeData(null), /not a JSON object/);
    assert.throws(() => normalizeData([]), /not a JSON object/);
    assert.throws(() => normalizeData('nope'), /not a JSON object/);
});

test('calculates sample totals and excludes @END', () => {
    const totals = calcTotals(SAMPLE.times, new Date(2026, 10, 4, 23, 0, 0));
    const byRef = Object.fromEntries(totals.rows.map(row => [row.ref, row.time]));

    assert.equal(totals.hasInvalid, false);
    assert.equal(byRef.Admin, '01:59:30');
    assert.equal(byRef['EN/HK'], '00:17:01');
    assert.equal(byRef.Break, '01:15:04');
    assert.equal(byRef['100493/108'], '00:59:42');
    assert.equal(byRef['ESD-154'], '00:54:38');
    assert.equal(byRef.Learn, '00:44:38');
    assert.equal(totals.total.time, '06:10:33');
    assert.equal(Object.hasOwn(byRef, '@END'), false);
});

test('flags invalid and out-of-order timestamps instead of hiding them', () => {
    const totals = calcTotals(
        [
            { time: 'not a time', ref: 'Bad' },
            { time: '2026-11-04 12:00:00', ref: 'Good' },
            { time: '2026-11-04 11:00:00', ref: 'Backwards' },
        ],
        new Date(2026, 10, 4, 13, 0, 0)
    );

    assert.equal(totals.hasInvalid, true);
    assert.equal(totals.rows.find(row => row.ref === 'Bad').invalid, true);
    assert.equal(totals.rows.find(row => row.ref === 'Good').invalid, true);
    assert.equal(totals.rows.find(row => row.ref === 'Backwards').invalid, false);
});

test('highlighting escapes user code instead of letting HTML through', () => {
    const html = highlightCode('<img src=x onerror="alert(1)">', 'html');

    assert.equal(html.includes('<img'), false);
    assert.equal(html.includes('&lt;'), true);
    assert.equal(html.includes('onerror="alert(1)"'), false);
});

test('formats and parses local date/time values deterministically', () => {
    const date = new Date(2026, 10, 4, 9, 5, 3);

    assert.equal(formatDateTime(date), '2026-11-04 09:05:03');
    assert.equal(formatDate(date), '2026-11-04');
    assert.equal(formatMillis(22233000), '06:10:33');

    const parsed = parseLocalDateTime('2026-11-04 09:05:03');
    assert.equal(parsed.getFullYear(), 2026);
    assert.equal(parsed.getMonth(), 10);
    assert.equal(parsed.getDate(), 4);
    assert.equal(parsed.getHours(), 9);
    assert.equal(parsed.getMinutes(), 5);
    assert.equal(parsed.getSeconds(), 3);

    assert.equal(parseLocalDateTime('2026-02-30 10:00:00'), null);
    assert.equal(parseLocalDateTime('2026-11-04T09:05:03').getTime(), parsed.getTime());
});
