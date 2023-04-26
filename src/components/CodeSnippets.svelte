<script>
    import { _WTT } from '../utils';
    import Button from './Button.svelte';
    import HighlightCode from './HighlightCode.svelte';

    export let data;
    export let messages = [];

    let addLang;
    let addTitle;
    let addSnippet;

    let filterLang;
    let filterTitle;

    let langs = ['bash', 'basic', 'dos', 'html', 'java', 'javascript', 'json', 'sql', 'text', 'typescript', 'xml'];
    let edit = false;

    const save = withMessage => {
        data = _WTT.storeData(data);
        if (withMessage) {
            messages.push(withMessage);
            messages = [...messages];
        }
    };

    const set = () => {
        if (_WTT.isNotEmptyStr(addLang) && _WTT.isNotEmptyStr(addTitle)) {
            data.snippets.push({
                lang: addLang,
                title: addTitle,
                snippet: addSnippet,
            });
            save(`Added snippet ${addTitle}.`);
            addLang = undefined;
            addTitle = undefined;
            addSnippet = undefined;
            document.getElementById(`newSnippet`).classList.add('hide');
        } else {
            save(`Saved data.`);
        }
    };

    const del = index => {
        if (confirm('Really want to remove row?')) {
            data.snippets.splice(index, 1);
            save(`Removed row from index ${index}.`);
        }
    };

    const show = snippet => {
        let matchLang = true;
        let matchTitle = true;

        if (_WTT.isNotEmptyStr(filterLang)) {
            matchLang = snippet.lang.toLowerCase().indexOf(filterLang.toLowerCase()) > -1;
        }
        if (_WTT.isNotEmptyStr(filterTitle)) {
            matchTitle = snippet.title.toLowerCase().indexOf(filterTitle.toLowerCase()) > -1;
        }

        return matchLang && matchTitle;
    };

    const reload = e => {
        if (e instanceof PointerEvent || (e instanceof KeyboardEvent && e.key === 'Enter')) {
            data = { ...data };
        }
    };

    const copy = snippet => {
        navigator.clipboard.writeText(snippet);
        messages.push('Copied to clipboard.');
        messages = [...messages];
    };
</script>

<datalist id="history-lang">
    {#each langs as lang}
        <option value={lang} />
    {/each}
</datalist>

<table class="table is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
        <tr>
            <th>Language</th>
            <th>Title</th>
            <th class="col-last">&nbsp;</th>
        </tr>
        <tr>
            <td>
                <input
                    class="input is-small"
                    type="text"
                    placeholder="Filter Language"
                    list="history-lang"
                    bind:value={filterLang}
                    on:keyup={reload}
                    on:dblclick={() => (filterLang = undefined)} /></td>
            <td>
                <input class="input is-small" type="text" placeholder="Filter Title" bind:value={filterTitle} on:keyup={reload} on:dblclick={() => (filterTitle = undefined)} />
            </td>
            <td>
                <Button icon="fas fa-filter" on:click={reload} />
            </td>
        </tr>
    </thead>
    <tbody>
        {#each data.snippets as snippet, index}
            {#if show(snippet)}
                <tr>
                    <td><input class="input is-small" type="text" placeholder="Language" list="history-lang" bind:value={snippet.lang} /></td>
                    <td><input class="input is-small" type="text" placeholder="Title" bind:value={snippet.title} /></td>
                    <td>
                        <div class="field is-grouped">
                            <p class="control">
                                <Button clas="is-danger" icon="far fa-trash-alt" on:click={() => del(index)} />
                                <Button icon="fas fa-expand" on:click={() => document.getElementById(`snippet_${index}`).classList.toggle('hide')} />
                            </p>
                        </div>
                    </td>
                </tr>
                <tr id={`snippet_${index}`} class="hide">
                    <td colspan="2">
                        {#if edit}
                            <textarea class="textarea is-small" placeholder="Snippet" bind:value={snippet.snippet} />
                        {:else}
                            <HighlightCode lang={snippet.lang} code={snippet.snippet} />
                        {/if}
                    </td>
                    <td>
                        <div class="field is-grouped">
                            <p class="control">
                                <Button icon="far fa-copy" on:click={() => copy(snippet.snippet)} />
                                <Button icon="far {edit ? 'fa-eye' : 'fa-edit'}" on:click={() => (edit = !edit)} />
                            </p>
                        </div>
                    </td>
                </tr>
            {/if}
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th>New Language</th>
            <th>New Title</th>
            <th class="col-last">&nbsp;</th>
        </tr>
        <tr>
            <td><input class="input is-small" type="text" placeholder="Language" list="history-lang" bind:value={addLang} /></td>
            <td><input class="input is-small" type="text" placeholder="Title" bind:value={addTitle} /></td>
            <td>
                <div class="field is-grouped">
                    <p class="control">
                        <Button clas="is-success" icon="fas fa-check" on:click={() => set()} />
                        <Button icon="fas fa-expand" on:click={() => document.getElementById(`newSnippet`).classList.toggle('hide')} />
                    </p>
                </div>
            </td>
        </tr>
        <tr id="newSnippet" class="hide">
            <td colspan="2"><textarea class="textarea is-small" placeholder="Snippet" bind:value={addSnippet} /></td>
            <td>&nbsp;</td>
        </tr>
    </tfoot>
</table>

<style>
    .col-last {
        width: 80px;
    }
</style>
