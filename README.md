# Work Time Tracking

A small browser-only work time tracker. Log time per issue/reference, keep a to-do list, notes, and reusable code snippets, and see per-reference totals at the end of the day. Everything is stored in `localStorage`; there is no server and no external CDN dependency.

Built with Svelte 5 (runes) + Vite, plain JavaScript.

## Features

- Time rows with a JIRA/issue reference, description, and an `@END` marker for ending a session.
- Per-client/system reporting confirmations on `@END` rows, with timestamps. A confirmation means that day's work time has been entered manually into that customer's system — or your own time-keeping system.
- Per-reference and grand totals. The last open row counts up to the current time when the summary is refreshed or time data changes.
- To-do list with due dates, done state, live filters, and done-last sorting.
- Notes with categories, a remembered category history, and expandable text.
- Code snippets with live syntax highlighting while viewing and editing, plus copy.
- Remembered reference/category history: the last N used values, most recently used first.
- Configurable JQL issue search, regex-routed Jira browse routes, links, history size, and reporting clients/systems.
- Light, dark, and system theme with a manual override.
- Explicit saving: discrete data actions save immediately; inline edits wait for the always-available top-bar **Save** button, Ctrl/Cmd+S, or Enter in a work-time row's Reference/Description.
- No background timers, polling, or network activity after load.
- Collapsible Info/To-do/Notes/Snippets section, collapsed by default, with a total badge for open to-dos, notes, and snippets.
- Single-file production build.

## Development

Requires Node 22.12 or newer.

```bash
npm install
npm run dev       # Vite dev server
npm run check     # svelte-check
npm test          # node:test suite for data/history/reporting logic
npm run build     # produces dist/work-time.html (single self-contained file)
npm run preview   # serves dist; open /work-time.html
```

## Data

The app uses two `localStorage` keys:

- `wtt-data` — the application data. Current schema version is `2`:
    - `times`, `todos`, `notes`, `snippets`
    - `history.times`, `history.notes` — most recently used first, unique, limited by `config.history`
    - `history.snippets` — the language vocabulary (default languages plus custom ones); not limited by `config.history`
    - `config.history`, `config.search` (`google`, `google_ai`, `issues`, `issue_routes`, `reddit`, `sof`), `config.links`
    - `config.search.issues` — JQL text-search template used by the navbar Issue field; `{query}` is replaced with the encoded search term (a template without `{query}` gets the term appended)
    - `config.search.issue_routes` — ordered `{ pattern, url }` browse routes for the per-row Open button; `pattern` is a JavaScript regular expression tested against the reference (first match wins, case-sensitive), `{id}` is replaced with the encoded reference, and no match (or `@END`) disables Open
    - `config.reporting.systems` — the configurable customer/system time-keeping targets shown as confirmation toggles on `@END` rows; ticking one records that the work time was entered manually into that customer's system (or your own)
    - `times[].reported` — optional map of `systemId` to confirmation timestamp on `@END` rows
- `wtt-theme` — `system`, `light`, or `dark`.

Old v1 data is migrated additively on load. The old app stored its time history oldest-first in `wtt-data`, while its rendered/exported history was newest-first; the migration detects the orientation from the current time rows and converts it to a single newest-first order. The sample config below also imports correctly. The migrated shape is written on the next save or explicit action.

Inline edits (existing rows, notes, links, search URLs, and issue routes) and Config reporting-system changes (names/add/remove) stay in memory and highlight the always-clickable top-bar **Save** button; use that button, Ctrl/Cmd+S, or Enter in a work-time row's Reference/Description. Discrete data actions such as Add, Delete, Reset, Import, Sort, link/route add/remove, begin-time, history-limit changes, and `@END` reporting toggles write immediately. The Time summary is refreshed on demand and when time data changes; it does not tick in the background.

`config.history = 0` disables reference/category suggestions. Changing the limit trims the remembered lists immediately and saves.

Use **Config → Full Config** to export/import the whole data object as JSON. The theme preference is intentionally separate and is not part of that export. **Remember to backup your local config periodically!**

## Sample config

An anonymized example of a consulting developer's day: two reporting clients, several Jira references, realistic notes, todos, and snippets. The `@END` confirmations show that the day's time was entered manually into both clients' time-keeping systems. Replace `your-company`, `acme`, and `globex` with your Jira hosts before using it. Import it through **Config → Full Config**.

```json
{
    "version": 2,
    "times": [
        {
            "time": "2026-11-03 08:55:00",
            "ref": "Admin",
            "desc": "Stand-up and inbox"
        },
        {
            "time": "2026-11-03 09:10:00",
            "ref": "ACME-1421",
            "desc": "Invoice export: API contract and endpoint skeleton"
        },
        {
            "time": "2026-11-03 10:35:00",
            "ref": "Break",
            "desc": "Coffee"
        },
        {
            "time": "2026-11-03 10:50:00",
            "ref": "ACME-1421",
            "desc": "Invoice export: validation tests"
        },
        {
            "time": "2026-11-03 12:05:00",
            "ref": "GLOBEX-87",
            "desc": "Investigate DST bug in scheduler"
        },
        {
            "time": "2026-11-03 12:50:00",
            "ref": "Break",
            "desc": "Lunch"
        },
        {
            "time": "2026-11-03 13:30:00",
            "ref": "GLOBEX-87",
            "desc": "Add regression test around DST boundary"
        },
        {
            "time": "2026-11-03 14:15:00",
            "ref": "PLATFORM-512",
            "desc": "Review auth middleware PR"
        },
        {
            "time": "2026-11-03 15:00:00",
            "ref": "OPS-220",
            "desc": "Deploy staging and verify health check"
        },
        {
            "time": "2026-11-03 15:45:00",
            "ref": "Learn",
            "desc": "Read Svelte 5 runes migration notes"
        },
        {
            "time": "2026-11-03 16:15:00",
            "ref": "ACME-1421",
            "desc": "Sprint sync; follow up on currency rounding"
        },
        {
            "time": "2026-11-03 17:05:00",
            "ref": "@END",
            "desc": "Day complete",
            "reported": {
                "client-a": "2026-11-03 17:20:05",
                "client-b": "2026-11-03 17:24:18"
            }
        }
    ],
    "todos": [
        {
            "title": "Submit Client A timesheet",
            "due": "2026-11-04",
            "done": false
        },
        {
            "title": "Open PR for ACME-1421 invoice export",
            "due": "2026-11-04",
            "done": false
        },
        {
            "title": "Reply to GLOBEX-87 regression-test review",
            "due": "2026-11-05",
            "done": false
        },
        {
            "title": "Send October invoice summary",
            "due": "2026-10-31",
            "done": true
        }
    ],
    "notes": [
        {
            "category": "Client A",
            "title": "ACME-1421 — invoice export",
            "note": "API contract: CSV and JSON. Keep the existing invoice IDs and add a feature flag (invoice_export_v2). Confirm currency-rounding rules with finance before the demo."
        },
        {
            "category": "Client B",
            "title": "GLOBEX-87 — DST scheduler bug",
            "note": "Reproduces in staging when the scheduler crosses a DST boundary. Add a regression test around Europe/London and check the stored UTC timestamps."
        },
        {
            "category": "Release",
            "title": "Staging deploy checklist",
            "note": "Run DB migrations before the app deploy. Verify /health and the scheduler heartbeat. Post the deploy note in the client channel."
        }
    ],
    "snippets": [
        {
            "lang": "javascript",
            "title": "Format minutes as HH:MM",
            "snippet": "const hhmm = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;"
        },
        {
            "lang": "sql",
            "title": "Unbilled minutes by ticket",
            "snippet": "SELECT ticket_id, SUM(minutes) AS minutes\nFROM time_entries\nWHERE billed = false\nGROUP BY ticket_id\nORDER BY minutes DESC;"
        },
        {
            "lang": "bash",
            "title": "Create a branch from a ticket key",
            "snippet": "git switch -c \"$1\"\ngit push -u origin \"$1\""
        }
    ],
    "history": {
        "times": ["ACME-1421", "Learn", "OPS-220", "PLATFORM-512", "GLOBEX-87", "Break", "Admin", "ACME-1398", "GLOBEX-72", "OPS-198", "PLATFORM-488", "ACME-1377", "GLOBEX-61"],
        "notes": ["Release", "Client A", "Client B"],
        "snippets": ["bash", "basic", "dos", "html", "java", "javascript", "json", "sql", "text", "typescript", "xml"]
    },
    "config": {
        "history": 50,
        "search": {
            "google": "https://www.google.com/search?q=",
            "google_ai": "https://www.google.com/search?udm=50&q=",
            "issues": "https://your-company.atlassian.net/jira/issues/?jql=text~%22{query}%22",
            "issue_routes": [
                {
                    "pattern": "^ACME-",
                    "url": "https://acme.atlassian.net/browse/{id}"
                },
                {
                    "pattern": "^GLOBEX-",
                    "url": "https://globex.atlassian.net/browse/{id}"
                },
                {
                    "pattern": "^(PLATFORM|OPS)-",
                    "url": "https://your-company.atlassian.net/browse/{id}"
                }
            ],
            "reddit": "https://www.google.com/search?q=site.reddit.com+",
            "sof": "https://www.google.com/search?q=site.stackoverflow.com+"
        },
        "links": [
            {
                "title": "Jira",
                "href": "https://your-company.atlassian.net/jira/"
            },
            {
                "title": "ChatGPT",
                "href": "https://chatgpt.com/"
            },
            {
                "title": "DeepSeek",
                "href": "https://chat.deepseek.com/"
            },
            {
                "title": "Google AI Studio",
                "href": "https://aistudio.google.com/"
            }
        ],
        "reporting": {
            "systems": [
                {
                    "id": "client-a",
                    "label": "Client A"
                },
                {
                    "id": "client-b",
                    "label": "Client B"
                }
            ]
        }
    }
}
```

## Deployment

`npm run build` writes a single self-contained `dist/work-time.html` with all JavaScript and CSS inlined. Copy that file to the site root (for example `https://jsandhol.github.io/work-time.html`). No asset folder or post-build rename step is needed.

## License

MIT
