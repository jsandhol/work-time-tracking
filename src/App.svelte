<script>
    import { onMount } from 'svelte';
    import { U } from './utils';

    let state = {
        saved: [],
        added: {
            t: undefined,
            r: undefined,
            d: undefined,
        },
        summary: [],
        instructions: true,
    };

    const setTime = (index) => {
        if (index !== undefined) {
            if (U.isNotEmptyStr(state.saved[index].t)) {
                if (window.confirm('Replace existing time?')) {
                    state.saved[index].t = U.toLocaleDateTimeStr();
                }
            } else {
                state.saved[index].t = U.toLocaleDateTimeStr();
            }
        } else {
            if (U.isNotEmptyStr(state.added.t)) {
                if (window.confirm('Replace existing time?')) {
                    state.added.t = U.toLocaleDateTimeStr();
                }
            } else {
                state.added.t = U.toLocaleDateTimeStr();
            }
        }
    };

    const end = () => {
        if (U.isEmptyStr(state.added.t)) state.added.t = U.toLocaleDateTimeStr();
        if (U.isEmptyStr(state.added.r)) state.added.r = 'END';
    };

    const calc = () => {
        const updateSummary = (obj, millis) => {
            let found = false;

            for (const s of state.summary) {
                if (s.r === obj.r) {
                    s.m = s.m + millis;
                    found = true;
                    break;
                }
            }

            if (!found) state.summary.push({ r: obj.r, m: millis, t: undefined });
        };

        state.summary = [];

        state.saved.forEach((obj, index) => {
            if (obj.r !== 'END') {
                let d1 = new Date(obj.t);
                let d2 = index < state.saved.length - 1 ? new Date(state.saved[index + 1].t) : new Date();
                updateSummary(obj, d2.getTime() - d1.getTime());
            }
        });

        const total = { r: 'DAY TOTAL', m: 0, t: undefined };

        state.summary.forEach((s) => {
            s.t = U.millisToTime(s.m);
            total.m = total.m + s.m;
        });

        total.t = U.millisToTime(total.m);
        state.summary.push(total);
    };

    const load = () => {
        let data = window.localStorage.getItem('work-time-data');
        return U.isNotEmptyStr(data) ? JSON.parse(data) : [];
    };

    const save = () => {
        if (U.isNotEmptyStr(state.added.t) && U.isNotEmptyStr(state.added.r)) {
            state.saved.push({ t: state.added.t, r: state.added.r, d: state.added.d });
            state.added = {
                t: undefined,
                r: undefined,
                d: undefined,
            };
        }
        localStorage.setItem('work-time-data', JSON.stringify(state.saved));
        calc();
    };

    const reset = () => {
        if (window.confirm('Remove all data and start from scratch?')) {
            state = {
                saved: [],
                added: {
                    t: undefined,
                    r: undefined,
                    d: undefined,
                },
                summary: [],
            };
            localStorage.setItem('work-time-data', undefined);
        }
    };

    const del = (index) => {
        if (window.confirm(`Remove time entry on row ${index + 1}?`)) {
            state.saved.splice(index, 1);
            state.saved = [...state.saved];
        }
    };

    onMount(() => {
        state.saved = load();
        calc();
    });
</script>

<section class="section">
    <h4 class="title is-4">Work Time Tracking</h4>
    <div class="columns">
        <div class="column is-9">
            <table class="table is-bordered is-narrow is-fullwidth">
                <thead>
                    <tr>
                        <th class="col-new has-text-centered">+</th>
                        <th class="col-time">Time</th>
                        <th class="col-ref">Reference</th>
                        <th>Description</th>
                        <th class="col-del has-text-centered">-</th>
                    </tr>
                </thead>
                <tbody>
                    {#each state.saved as entry, index}
                        <tr>
                            <td>
                                <button class="button is-small is-warning" on:click={() => setTime(index)}>
                                    <span class="icon is-small">
                                        <i class="far fa-plus-square" />
                                    </span>
                                </button>
                            </td>
                            <td>
                                <input class="input is-small" type="text" bind:value={entry.t} />
                            </td>
                            <td>
                                <input class="input is-small" type="text" bind:value={entry.r} />
                            </td>
                            <td>
                                <input class="input is-small" type="text" bind:value={entry.d} />
                            </td>
                            <td>
                                <button class="button is-small is-danger" on:click={() => del(index)}>
                                    <span class="icon is-small">
                                        <i class="far fa-minus-square" />
                                    </span>
                                </button>
                            </td>
                        </tr>
                    {/each}
                    <tr>
                        <td>
                            <button class="button is-small is-primary" on:click={() => setTime()}>
                                <span class="icon is-small">
                                    <i class="far fa-plus-square" />
                                </span>
                            </button>
                        </td>
                        <td>
                            <input class="input is-small" type="text" bind:value={state.added.t} />
                        </td>
                        <td>
                            <input class="input is-small" type="text" bind:value={state.added.r} />
                        </td>
                        <td>
                            <input class="input is-small" type="text" bind:value={state.added.d} />
                        </td>
                        <td>
                            <button class="button is-small is-primary" on:click={end}>
                                <span class="icon is-small">
                                    <i class="fas fa-power-off" />
                                </span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="column is-3">
            <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>Total Time</th>
                    </tr>
                </thead>
                <tbody>
                    {#each state.summary as item}
                        {#if item.r !== 'END'}
                            <tr>
                                <td>{item.r}</td>
                                <td>{item.t}</td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
                <tfoot>
                    <tr>
                        <td>
                            <button class="button is-small is-fullwidth is-danger" on:click={() => reset()}>
                                <span class="icon is-small">
                                    <i class="fas fa-recycle" />
                                </span>
                                <span>Reset</span>
                            </button>
                        </td>
                        <td>
                            <button class="button is-small is-fullwidth is-primary" on:click={() => save()}>
                                <span class="icon is-small">
                                    <i class="far fa-save" />
                                </span>
                                <span>Save</span>
                            </button>
                        </td>
                    </tr>
                </tfoot>
            </table>
            {#if state.instructions}
                <div class="notification is-size-7">
                    <button class="delete" on:click={() => (state.instructions = false)} />
                    <div class="block">
                        This tool will collect your daily work time and summarize it by reference. You would typically use JIRA id (or some other incident system id) as the reference. Start by
                        clicking the green plus button at the bottom of the table. Use 'END' as the last entry reference for the day (or click the power off button).
                    </div>
                    <div class="block">Reset will erase all information and start from scratch.</div>
                    <div class="block">
                        Save will store data to the local storage. Work Time Tracking data will be availabe next time you open this tool. It will also calculate time summary by reference.
                    </div>
                </div>
            {/if}
        </div>
    </div>
</section>

<style>
    .col-new {
        width: 0px;
    }
    .col-time {
        width: 150px;
    }
    .col-ref {
        width: 200px;
    }
    .col-del {
        width: 0px;
    }
</style>
