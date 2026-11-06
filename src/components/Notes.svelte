<script>
    import { SvelteSet } from 'svelte/reactivity';
    import ActionButton from './ActionButton.svelte';
    import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
    import Check from '@lucide/svelte/icons/check';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';
    import ChevronUp from '@lucide/svelte/icons/chevron-up';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import X from '@lucide/svelte/icons/x';
    import { addNote, app, markDirty, notify, removeNote, sortNotes } from '$lib/store.svelte.js';

    let filterCategory = $state('');
    let filterTitle = $state('');
    let newCategory = $state('');
    let newTitle = $state('');
    let newNote = $state('');
    let showNewNote = $state(false);
    let categoryInput = $state();
    const expanded = new SvelteSet();

    const visibleNotes = $derived.by(() => {
        const category = filterCategory.trim().toLowerCase();
        const title = filterTitle.trim().toLowerCase();

        return app.data.notes.filter(note => (!category || note.category.toLowerCase().includes(category)) && (!title || note.title.toLowerCase().includes(title)));
    });

    function add() {
        if (!newCategory.trim() || !newTitle.trim()) {
            notify('Note category and title are required.', 'warning');
            return;
        }

        addNote({ category: newCategory, title: newTitle, note: newNote });
        newCategory = '';
        newTitle = '';
        newNote = '';
        showNewNote = false;
        categoryInput?.focus();
    }

    function addOnEnter(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        add();
    }

    function toggle(note) {
        if (expanded.has(note)) expanded.delete(note);
        else expanded.add(note);
    }

    function clearFilters() {
        filterCategory = '';
        filterTitle = '';
    }

    function clearCategoryFilter() {
        filterCategory = '';
    }

    function clearTitleFilter() {
        filterTitle = '';
    }
</script>

<datalist id="history-note">
    {#each app.data.history.notes as category (category)}
        <option value={category}></option>
    {/each}
</datalist>

<div class="table-wrap">
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Category</th>
                <th scope="col">Title</th>
                <th scope="col" class="col-actions" aria-label="Actions"></th>
            </tr>
            <tr class="filter-row">
                <td>
                    <input type="search" placeholder="Filter category" aria-label="Filter notes by category" list="history-note" bind:value={filterCategory} ondblclick={clearCategoryFilter} />
                </td>
                <td>
                    <input type="search" placeholder="Filter title" aria-label="Filter notes by title" bind:value={filterTitle} ondblclick={clearTitleFilter} />
                </td>
                <td class="col-actions">
                    <ActionButton label="Clear filters" icon={X} onclick={clearFilters} />
                    <ActionButton label="Sort notes" icon={ArrowUpDown} onclick={sortNotes} />
                </td>
            </tr>
        </thead>
        <tbody>
            {#each visibleNotes as note (note)}
                <tr>
                    <td><input type="text" aria-label="Note category" list="history-note" bind:value={note.category} oninput={markDirty} /></td>
                    <td><input type="text" aria-label="Note title" bind:value={note.title} oninput={markDirty} /></td>
                    <td class="col-actions">
                        <ActionButton
                            label={expanded.has(note) ? 'Hide note text' : 'Show note text'}
                            icon={expanded.has(note) ? ChevronUp : ChevronDown}
                            onclick={() => toggle(note)} />
                        <ActionButton
                            label="Delete note"
                            icon={Trash2}
                            variant="danger"
                            onclick={() => {
                                if (confirm('Really want to remove row?')) removeNote(note);
                            }} />
                    </td>
                </tr>
                {#if expanded.has(note)}
                    <tr class="detail-row">
                        <td colspan="3"><textarea rows="3" placeholder="Note" aria-label="Note text" bind:value={note.note} oninput={markDirty}></textarea></td>
                    </tr>
                {/if}
            {/each}
            {#if visibleNotes.length === 0}
                <tr>
                    <td colspan="3" class="muted">No notes match the current view.</td>
                </tr>
            {/if}
        </tbody>
        <tfoot>
            <tr>
                <td><input type="text" placeholder="New category" aria-label="New note category" list="history-note" bind:this={categoryInput} bind:value={newCategory} /></td>
                <td><input type="text" placeholder="New title" aria-label="New note title" bind:value={newTitle} onkeydown={addOnEnter} /></td>
                <td class="col-actions">
                    <ActionButton
                        label={showNewNote ? 'Hide new note text' : 'Show new note text'}
                        icon={showNewNote ? ChevronUp : ChevronDown}
                        onclick={() => (showNewNote = !showNewNote)} />
                    <ActionButton label="Add note" icon={Check} variant="success" onclick={add} />
                </td>
            </tr>
            {#if showNewNote}
                <tr class="detail-row">
                    <td colspan="3"><textarea rows="3" placeholder="Note text" aria-label="New note text" bind:value={newNote}></textarea></td>
                </tr>
            {/if}
        </tfoot>
    </table>
</div>
