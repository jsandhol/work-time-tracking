# Work Time Tracking

Use work time tracking to handle daily items: work time per issue (like JIRA ref), current todo lists and notes. Work time is summarized to help entering work time data to your organization's time management system at the end of the day. You can also maintain often used code snippets for easy access. Navigation bar provides access to links and searches most frequently needed. You can alter the configuration from the Config section. You can export/import your data by using the Full Config option in the Config section.

## Local Storage Model

Stored as 'wtt-data':

```
{
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
        links: [
            {
                title: 'Chat GPT',
                href: 'https://chat.openai.com/',
            },
        ],
    },
}
```

Created using rollup.

```
npx degit sveltejs/template work-time-tracking --force
```

You can run the latest version from here: https://jsandhol.github.io/work-time.html