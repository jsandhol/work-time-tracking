<script>
    import { _WTT } from './../utils.js';
    import Button from './Button.svelte';

    export let data;
    export let messages = [];

    let expanded = false;
    let addTitle;
    let addHref;

    const save = withMessage => {
        data = _WTT.storeData(data);
        if (withMessage) {
            messages.push(withMessage);
            messages = [...messages];
        }
    };

    const add = withMessage => {
        if (_WTT.isNotEmptyStr(addTitle) && _WTT.isNotEmptyStr(addHref)) {
            data.config.links.push({ title: addTitle, href: addHref });
            addTitle = undefined;
            addHref = undefined;
            save(withMessage);
        }
    };

    const del = (index, withMessage) => {
        data.config.links.splice(index, 1);
        save(withMessage);
    };

    const imp = withMessage => {
        if (confirm('Really want to replace full config?')) {
            let newData = JSON.parse(document.querySelector('#config').value);
            data = { ...newData };
            if (withMessage) {
                messages.push(withMessage);
                messages = [...messages];
            }
        }
    };
</script>

<h6 class="title is-6">Config</h6>

<table class="table is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
        <tr>
            <th>Name</th>
            <th>Value</th>
            <th class="min-width">
                <a href={'#'} on:click={() => (expanded = !expanded)}>{expanded ? '▲' : '▼'}</a>
            </th>
        </tr>
    </thead>
    {#if expanded}
        <tbody>
            <tr>
                <td><label for="config.history">History</label></td>
                <td><input class="input is-small" id="config.history" type="number" bind:value={data.config.history} /></td>
                <td><Button clas="is-success" icon="fas fa-check" on:click={() => save(`History updated to ${data.config.history}.`)} /></td>
            </tr>
            <tr>
                <td><label for="config.search.google">Search Google</label></td>
                <td><input class="input is-small" id="config.search.google" type="text" bind:value={data.config.search.google} /></td>
                <td><Button clas="is-success" icon="fas fa-check" on:click={() => save(`Search Google updated to ${data.config.search.google}.`)} /></td>
            </tr>
            <tr>
                <td><label for="config.search.issues">Search Issues</label></td>
                <td><input class="input is-small" id="config.search.issues" type="text" bind:value={data.config.search.issues} /></td>
                <td><Button clas="is-success" icon="fas fa-check" on:click={() => save(`Search Issues updated to ${data.config.search.issues}.`)} /></td>
            </tr>
            <tr>
                <td><label for="config.search.reddit">Search Reddit</label></td>
                <td><input class="input is-small" id="config.search.reddit" type="text" bind:value={data.config.search.reddit} /></td>
                <td><Button clas="is-success" icon="fas fa-check" on:click={() => save(`Search Reddit updated to ${data.config.search.reddit}.`)} /></td>
            </tr>
            <tr>
                <td><label for="config.search.sof">Search SOF</label></td>
                <td><input class="input is-small" id="config.search.sof" type="text" bind:value={data.config.search.sof} /></td>
                <td><Button clas="is-success" icon="fas fa-check" on:click={() => save(`Search SOF updated to ${data.config.search.sof}`)} /></td>
            </tr>
            <tr>
                <td><label for="config">Full Config</label></td>
                <td><textarea id="config" class="textarea is-small" placeholder="Full Config">{JSON.stringify(data)}</textarea></td>
                <td><Button clas="is-danger" icon="fas fa-check" on:click={() => imp(`Full config imported.`)} /></td>
            </tr>
            {#each data.config.links as link, index}
                <tr>
                    <td><input class="input is-small" type="text" bind:value={link.title} /></td>
                    <td><input class="input is-small" type="text" bind:value={link.href} /></td>
                    <td><Button clas="is-warning" icon="far fa-trash-alt" on:click={() => del(index, `Removed link ${link.title}.`)} /></td>
                </tr>
            {/each}
        </tbody>
        <tfoot>
            <tr>
                <th>New Link Title</th>
                <th colspan="2">New Link Value</th>
            </tr>
            <tr>
                <td><input class="input is-small" type="text" bind:value={addTitle} /></td>
                <td><input class="input is-small" type="text" bind:value={addHref} /></td>
                <td><Button clas="is-success" icon="fas fa-check" on:click={() => add(`Added link ${addTitle}`)} /></td>
            </tr>
        </tfoot>
    {/if}
</table>

<style>
    .min-width {
        width: 0px;
    }
    a,
    a:hover,
    a:visited,
    a:active {
        color: inherit;
        text-decoration: none;
    }
    input {
        width: 100px;
    }
</style>
