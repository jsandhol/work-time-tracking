<script>
    import { _WTT } from '../utils';
    import Button from './Button.svelte';

    export let data;
    export let messages = [];

    let addTime;
    let addRef;
    let addDesc;

    const save = withMessage => {
        data = _WTT.storeData(data);
        if (withMessage) {
            messages.push(withMessage);
            messages = [...messages];
        }
    };

    const add = () => {
        addTime = _WTT.dateTimeToStr();
        document.getElementById('addRef').focus();
    };

    const set = () => {
        if (_WTT.isNotEmptyStr(addTime)) {
            data.times.push({
                time: addTime,
                ref: addRef,
                desc: addDesc,
            });
            save(`Added with ref ${addRef}.`);
            addTime = undefined;
            addRef = undefined;
            addDesc = undefined;
        } else {
            save(`Saved data.`);
        }
    };

    const del = index => {
        if (confirm('Really want to remove row?')) {
            data.times.splice(index, 1);
            save(`Removed row from index ${index}.`);
        }
    };

    const end = () => {
        addTime = _WTT.dateTimeToStr();
        addRef = '@END';
        addDesc = undefined;
        document.getElementById('addDesc').focus();
    };

    const beg = index => {
        if (confirm('Really want to replace time?')) {
            data.times[index].time = _WTT.dateTimeToStr();
            save(`Time replaced at index ${index}.`);
        }
    };
</script>

<datalist id="history-refs">
    {#each data.history.times.reverse() as ref}
        <option value={ref} />
    {/each}
</datalist>

<table class="table is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
        <tr>
            <th class="col-first">&nbsp;</th>
            <th class="col-time">Time</th>
            <th class="col-ref">Reference</th>
            <th>Description</th>
            <th class="col-last">&nbsp;</th>
        </tr>
    </thead>
    <tbody>
        {#each data.times as time, index}
            <tr>
                <td>
                    <Button clas="is-warning" icon="far fa-clock" on:click={() => beg(index)} />
                </td>
                <td><input class="input is-small" type="text" bind:value={time.time} /></td>
                <td><input class="input is-small" type="text" list="history-refs" bind:value={time.ref} /></td>
                <td><input class="input is-small" type="text" bind:value={time.desc} /></td>
                <td>
                    <div class="field is-grouped">
                        <p class="control">
                            <Button clas="is-danger" icon="far fa-trash-alt" on:click={() => del(index)} />
                            <Button icon="fas fa-search" on:click={() => window.open(`${data.config.search.issues}${time.ref}`, '_blank')} />
                        </p>
                    </div>
                </td>
            </tr>
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th class="col-first">&nbsp;</th>
            <th class="col-time">New Time</th>
            <th class="col-ref">New Reference</th>
            <th>New Description</th>
            <th class="col-last">&nbsp;</th>
        </tr>
        <tr>
            <td>
                <Button clas="is-success" icon="far fa-clock" on:click={() => add()} />
            </td>
            <td><input id="addTime" class="input is-small" type="text" bind:value={addTime} /></td>
            <td><input id="addRef" class="input is-small" type="text" list="history-refs" bind:value={addRef} /></td>
            <td><input id="addDesc" class="input is-small" type="text" bind:value={addDesc} /></td>
            <td>
                <div class="field is-grouped">
                    <p class="control">
                        <Button clas="is-success" icon="fas fa-check" on:click={() => set()} />
                        <Button clas="is-info" icon="fas fa-power-off" on:click={() => end()} />
                    </p>
                </div>
            </td>
        </tr>
    </tfoot>
</table>

<style>
    .col-first {
        width: 40px;
    }
    .col-time {
        width: 150px;
    }
    .col-ref {
        width: 200px;
    }
    .col-last {
        width: 80px;
    }
</style>
