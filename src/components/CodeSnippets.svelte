<script>
    import { SvelteSet } from 'svelte/reactivity';
    import ActionButton from './ActionButton.svelte';
    import CodeBlock from './CodeBlock.svelte';
    import CodeEditor from './CodeEditor.svelte';
    import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
    import Check from '@lucide/svelte/icons/check';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';
    import ChevronUp from '@lucide/svelte/icons/chevron-up';
    import Copy from '@lucide/svelte/icons/copy';
    import Eye from '@lucide/svelte/icons/eye';
    import Pencil from '@lucide/svelte/icons/pencil';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import X from '@lucide/svelte/icons/x';
    import { addSnippet, app, markDirty, notify, removeSnippet, sortSnippets } from '$lib/store.svelte.js';

    let filterLang = $state('');
    let filterTitle = $state('');
    let newLang = $state('');
    let newTitle = $state('');
    let newSnippet = $state('');
    let showNewSnippet = $state(false);
    let langInput = $state();
    const expanded = new SvelteSet();
    const editing = new SvelteSet();

    const visibleSnippets = $derived.by(() => {
        const lang = filterLang.trim().toLowerCase();
        const title = filterTitle.trim().toLowerCase();

        return app.data.snippets.filter(snippet => (!lang || snippet.lang.toLowerCase().includes(lang)) && (!title || snippet.title.toLowerCase().includes(title)));
    });

    function add() {
        if (!newLang.trim() || !newTitle.trim()) {
            notify('Snippet language and title are required.', 'warning');
            return;
        }

        addSnippet({ lang: newLang, title: newTitle, snippet: newSnippet });
        newLang = '';
        newTitle = '';
        newSnippet = '';
        showNewSnippet = false;
        langInput?.focus();
    }

    function addOnEnter(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        add();
    }

    function toggleExpanded(snippet) {
        if (expanded.has(snippet)) expanded.delete(snippet);
        else expanded.add(snippet);
    }

    function toggleEditing(snippet) {
        if (editing.has(snippet)) editing.delete(snippet);
        else editing.add(snippet);
    }

    async function copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            notify('Copied to clipboard.', 'success');
        } catch (error) {
            notify(`Could not copy: ${error instanceof Error ? error.message : String(error)}`, 'error');
        }
    }

    function clearFilters() {
        filterLang = '';
        filterTitle = '';
    }

    function clearLangFilter() {
        filterLang = '';
    }

    function clearTitleFilter() {
        filterTitle = '';
    }
</script>

<datalist id="history-lang">
    {#each app.data.history.snippets as lang (lang)}
        <option value={lang}></option>
    {/each}
</datalist>

<div class="table-wrap">
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Language</th>
                <th scope="col">Title</th>
                <th scope="col" class="col-actions" aria-label="Actions"></th>
            </tr>
            <tr class="filter-row">
                <td>
                    <input type="search" placeholder="Filter language" aria-label="Filter snippets by language" list="history-lang" bind:value={filterLang} ondblclick={clearLangFilter} />
                </td>
                <td>
                    <input type="search" placeholder="Filter title" aria-label="Filter snippets by title" bind:value={filterTitle} ondblclick={clearTitleFilter} />
                </td>
                <td class="col-actions">
                    <ActionButton label="Clear filters" icon={X} onclick={clearFilters} />
                    <ActionButton label="Sort snippets" icon={ArrowUpDown} onclick={sortSnippets} />
                </td>
            </tr>
        </thead>
        <tbody>
            {#each visibleSnippets as snippet (snippet)}
                <tr>
                    <td><input type="text" aria-label="Snippet language" list="history-lang" bind:value={snippet.lang} oninput={markDirty} /></td>
                    <td><input type="text" aria-label="Snippet title" bind:value={snippet.title} oninput={markDirty} /></td>
                    <td class="col-actions">
                        <ActionButton
                            label={expanded.has(snippet) ? 'Hide snippet' : 'Show snippet'}
                            icon={expanded.has(snippet) ? ChevronUp : ChevronDown}
                            onclick={() => toggleExpanded(snippet)} />
                        <ActionButton
                            label="Delete snippet"
                            icon={Trash2}
                            variant="danger"
                            onclick={() => {
                                if (confirm('Really want to remove row?')) removeSnippet(snippet);
                            }} />
                    </td>
                </tr>
                {#if expanded.has(snippet)}
                    <tr class="detail-row">
                        <td colspan="2">
                            {#if editing.has(snippet)}
                                <CodeEditor bind:value={snippet.snippet} lang={snippet.lang} label="Snippet code" placeholder="Snippet" oninput={markDirty} />
                            {:else}
                                <CodeBlock code={snippet.snippet} lang={snippet.lang} />
                            {/if}
                        </td>
                        <td class="col-actions">
                            <ActionButton label="Copy snippet" icon={Copy} onclick={() => copy(snippet.snippet)} />
                            <ActionButton
                                label={editing.has(snippet) ? 'View highlighted code' : 'Edit snippet'}
                                icon={editing.has(snippet) ? Eye : Pencil}
                                onclick={() => toggleEditing(snippet)} />
                        </td>
                    </tr>
                {/if}
            {/each}
            {#if visibleSnippets.length === 0}
                <tr>
                    <td colspan="3" class="muted">No snippets match the current view.</td>
                </tr>
            {/if}
        </tbody>
        <tfoot>
            <tr>
                <td><input type="text" placeholder="New language" aria-label="New snippet language" list="history-lang" bind:this={langInput} bind:value={newLang} /></td>
                <td><input type="text" placeholder="New title" aria-label="New snippet title" bind:value={newTitle} onkeydown={addOnEnter} /></td>
                <td class="col-actions">
                    <ActionButton
                        label={showNewSnippet ? 'Hide new snippet' : 'Show new snippet'}
                        icon={showNewSnippet ? ChevronUp : ChevronDown}
                        onclick={() => (showNewSnippet = !showNewSnippet)} />
                    <ActionButton label="Add snippet" icon={Check} variant="success" onclick={add} />
                </td>
            </tr>
            {#if showNewSnippet}
                <tr class="detail-row">
                    <td colspan="3"><CodeEditor bind:value={newSnippet} lang={newLang} label="New snippet code" placeholder="Snippet text" /></td>
                </tr>
            {/if}
        </tfoot>
    </table>
</div>
