<script>
    import { _WTT } from '../utils';
    import Button from './Button.svelte';

    export let data;
    export let messages = [];

    let addCategory;
    let addTitle;
    let addNote;

    let filterCategory;
    let filterTitle;

    const save = withMessage => {
        data = _WTT.storeData(data);
        if (withMessage) {
            messages.push(withMessage);
            messages = [...messages];
        }
    };

    const set = () => {
        if (_WTT.isNotEmptyStr(addCategory) && _WTT.isNotEmptyStr(addTitle)) {
            data.notes.push({
                category: addCategory,
                title: addTitle,
                note: addNote,
            });
            save(`Added note ${addTitle}.`);
            addCategory = undefined;
            addTitle = undefined;
            addNote = undefined;
            document.getElementById(`newNote`).classList.add('hide');
        } else {
            save(`Saved data.`);
        }
    };

    const del = index => {
        if (confirm('Really want to remove row?')) {
            data.notes.splice(index, 1);
            save(`Removed row from index ${index}.`);
        }
    };

    const show = note => {
        let matchCategory = true;
        let matchTitle = true;

        if (_WTT.isNotEmptyStr(filterCategory)) {
            matchCategory = note.category.toLowerCase().indexOf(filterCategory.toLowerCase()) > -1;
        }
        if (_WTT.isNotEmptyStr(filterTitle)) {
            matchTitle = note.title.toLowerCase().indexOf(filterTitle.toLowerCase()) > -1;
        }

        return matchCategory && matchTitle;
    };

    const reload = e => {
        if (e instanceof PointerEvent || (e instanceof KeyboardEvent && e.key === 'Enter')) {
            data = { ...data };
        }
    };
</script>

<datalist id="history-note">
    {#each data.history.notes as ref}
        <option value={ref} />
    {/each}
</datalist>

<table class="table is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
        <tr>
            <th>Category</th>
            <th>Title</th>
            <th class="col-last">&nbsp;</th>
        </tr>
        <tr>
            <td>
                <input
                    class="input is-small"
                    type="text"
                    placeholder="Filter Category"
                    list="history-note"
                    bind:value={filterCategory}
                    on:keyup={reload}
                    on:dblclick={() => (filterCategory = undefined)} /></td>
            <td><input class="input is-small" type="text" placeholder="Filter Title" bind:value={filterTitle} on:keyup={reload} on:dblclick={() => (filterTitle = undefined)} /></td>
            <td>
                <Button icon="fas fa-filter" on:click={reload} />
            </td>
        </tr>
    </thead>
    <tbody>
        {#each data.notes as note, index}
            {#if show(note)}
                <tr>
                    <td><input class="input is-small" type="text" placeholder="Category" list="history-note" bind:value={note.category} /></td>
                    <td><input class="input is-small" type="text" placeholder="Title" bind:value={note.title} /></td>
                    <td>
                        <div class="field is-grouped">
                            <p class="control">
                                <Button clas="is-danger" icon="far fa-trash-alt" on:click={() => del(index)} />
                                <Button icon="fas fa-expand" on:click={() => document.getElementById(`note_${index}`).classList.toggle('hide')} />
                            </p>
                        </div>
                    </td>
                </tr>
                <tr id={`note_${index}`} class="hide">
                    <td colspan="2"><textarea class="textarea is-small" placeholder="Note" bind:value={note.note} /></td>
                    <td>&nbsp;</td>
                </tr>
            {/if}
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th>New Category</th>
            <th>New Title</th>
            <th class="col-last">&nbsp;</th>
        </tr>
        <tr>
            <td><input class="input is-small" type="text" placeholder="Category" list="history-note" bind:value={addCategory} /></td>
            <td><input class="input is-small" type="text" placeholder="Title" bind:value={addTitle} /></td>
            <td>
                <div class="field is-grouped">
                    <p class="control">
                        <Button clas="is-success" icon="fas fa-check" on:click={() => set()} />
                        <Button icon="fas fa-expand" on:click={() => document.getElementById(`newNote`).classList.toggle('hide')} />
                    </p>
                </div>
            </td>
        </tr>
        <tr id="newNote" class="hide">
            <td colspan="2"><textarea class="textarea is-small" placeholder="Note" bind:value={addNote} /></td>
            <td>&nbsp;</td>
        </tr>
    </tfoot>
</table>

<style>
    .col-last {
        width: 80px;
    }
</style>
