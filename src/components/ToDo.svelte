<script>
    import { _WTT } from '../utils';
    import Button from './Button.svelte';

    export let data;
    export let messages = [];

    let addTitle;
    let addDue = _WTT.dateToStr();
    let addDone = false;

    const save = withMessage => {
        data = _WTT.storeData(data);
        if (withMessage) {
            messages.push(withMessage);
            messages = [...messages];
        }
    };

    const set = () => {
        if (_WTT.isNotEmptyStr(addTitle)) {
            data.todos.push({
                title: addTitle,
                due: addDue,
                done: addDone,
            });
            save(`Added todo ${addTitle}.`);
            addTitle = undefined;
            addDue = _WTT.dateToStr();
            addDone = false;
        } else {
            save(`Saved data.`);
        }
    };

    const del = index => {
        if (confirm('Really want to remove row?')) {
            data.todos.splice(index, 1);
            save(`Removed row from index ${index}.`);
        }
    };
</script>

<table class="table is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
        <th>Title</th>
        <th class="col-due">Due</th>
        <th class="col-done">Done</th>
        <th class="col-last">&nbsp;</th>
    </thead>
    <tbody>
        {#each data.todos as todo, index}
            <tr>
                <td><input class="input is-small" type="text" bind:value={todo.title} /></td>
                <td><input class="input is-small" type="text" bind:value={todo.due} /></td>
                <td class="has-text-centered" style="vertical-align: middle;"><input type="checkbox" bind:checked={todo.done} /></td>
                <td>
                    <Button clas="is-danger" icon="far fa-trash-alt" on:click={() => del(index)} />
                </td>
            </tr>
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th>New Title</th>
            <th class="col-due">New Due</th>
            <th class="col-done">&nbsp;</th>
            <th class="col-last">&nbsp;</th>
        </tr>
        <tr>
            <td><input class="input is-small" type="text" bind:value={addTitle} /></td>
            <td><input class="input is-small" type="text" bind:value={addDue} /></td>
            <td class="has-text-centered" style="vertical-align: middle;"><input type="checkbox" checked={addDone} disabled /></td>
            <td>
                <Button clas="is-success" icon="fas fa-check" on:click={() => set()} />
            </td>
        </tr>
    </tfoot>
</table>

<style>
    .col-due {
        width: 100px;
    }
    .col-done {
        width: 50px;
    }
    .col-last {
        width: 40px;
    }
</style>
