export const _WTT = (function () {
    const api = {};

    api.isNotEmptyStr = str => {
        return str !== undefined && str !== null && String(str) !== '';
    };

    api.dateTimeToStr = date => {
        let d = date ? new Date(date) : new Date();
        return d.toLocaleString('sv', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, hour12: false });
    };

    api.dateToStr = date => {
        return api.dateTimeToStr(date).substring(0, 10);
    };

    api.millisToTime = duration => {
        //let milliseconds = parseInt((duration%1000) / 100);
        let seconds = parseInt((duration / 1000) % 60);
        let minutes = parseInt((duration / (1000 * 60)) % 60);
        let hours = parseInt(duration / (1000 * 60 * 60));

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return hours + ':' + minutes + ':' + seconds; // + "." + milliseconds;
    };

    api.loadData = () => {
        let data = window.localStorage.getItem('wtt-data');

        if (api.isNotEmptyStr(data)) return JSON.parse(data);

        return {
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
        };
    };

    api.storeData = data => {
        const updateHistory = data => {
            data.times.forEach(e => {
                if (e.ref !== '@END') {
                    let index = data.history.times.indexOf(e.ref);
                    if (index > -1) data.history.times.splice(index, 1);
                    data.history.times.push(e.ref);
                }
            });
            data.history.times = data.history.times.slice(data.config.history * -1);

            data.notes.forEach(e => {
                let index = data.history.notes.indexOf(e.category);
                if (index > -1) data.history.notes.splice(index, 1);
                data.history.notes.push(e.category);
            });
            data.history.notes = data.history.notes.slice(data.config.history * -1);

            data.history.snippets = ['bash', 'basic', 'dos', 'html', 'java', 'javascript', 'json', 'sql', 'text', 'typescript', 'xml'];
        };

        const compareTodos = (a, b) => {
            let as = `${a.due.toLowerCase()}.${a.title.toLowerCase()}`;
            let bs = `${b.due.toLowerCase()}.${b.title.toLowerCase()}`;

            if (as > bs) return 1;
            if (as < bs) return -1;
            return 0;
        };

        const compareNotes = (a, b) => {
            if (a.category.toLowerCase() > b.category.toLowerCase()) return 1;
            if (a.category.toLowerCase() < b.category.toLowerCase()) return -1;
            return 0;
        };

        const compareSnippets = (a, b) => {
            let as = `${a.lang.toLowerCase()}.${a.title.toLowerCase()}`;
            let bs = `${b.lang.toLowerCase()}.${b.title.toLowerCase()}`;

            if (as > bs) return 1;
            if (as < bs) return -1;
            return 0;
        };

        data.todos.sort(compareTodos);
        data.notes.sort(compareNotes);
        data.snippets.sort(compareSnippets);
        
        updateHistory(data);
        window.localStorage.setItem('wtt-data', JSON.stringify(data));
        return { ...data };
    };

    return api;
})();
