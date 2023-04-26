# work-time-tracking

Local Storage model (wtt-data):

```
{
    times: [
        {
            time: '2023-04-20 10:09:00',
            ref: 'JIRA-123',
            desc: 'bug fix'
        }, ...
    ],
    todos: [
        {
            title: 'Improve wtt',
            due: '2023-04-30',
            done: false,
        }, ...
    ],
    summary: {
        categories: [
            {
                ref: 'JIRA-123',
                total: '03:12:22'
            }, ...
        ],
        total: '03:12:22'
    },
    config: {
        history: 15,
        links: [
            {
                title: 'Google',
                href: 'http://www.google.com/'
            }, ...
        ]
    }
}
```

Created using rollup.

```
npx degit sveltejs/template work-time-tracking --force
```

You can run the latest version from here: https://jsandhol.github.io/work-time.html