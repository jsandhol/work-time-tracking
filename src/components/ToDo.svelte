<script>
    import ActionButton from './ActionButton.svelte';
    import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
    import Check from '@lucide/svelte/icons/check';
    import Save from '@lucide/svelte/icons/save';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import X from '@lucide/svelte/icons/x';
    import { addTodo, app, markDirty, notify, removeTodo, saveNow, sortTodos } from '$lib/store.svelte.js';
    import { formatDate, sortTodosInPlace } from '../utils.js';

    let filterTitle = $state('');
    let filterDue = $state('');
    let newTitle = $state('');
    let newDue = $state(formatDate());
    let newTitleInput = $state();

    const visibleTodos = $derived.by(() => {
        const title = filterTitle.trim().toLowerCase();
        const due = filterDue.trim().toLowerCase();

        return app.data.todos.filter(todo => (!title || todo.title.toLowerCase().includes(title)) && (!due || todo.due.toLowerCase().includes(due)));
    });

    function add() {
        if (!newTitle.trim()) {
            notify('Todo title is required.', 'warning');
            newTitleInput?.focus();
            return;
        }

        addTodo({ title: newTitle, due: newDue });
        newTitle = '';
        newDue = formatDate();
        newTitleInput?.focus();
    }

    function addOnEnter(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        add();
    }

    function clearFilters() {
        filterTitle = '';
        filterDue = '';
    }

    function clearTitleFilter() {
        filterTitle = '';
    }

    function clearDueFilter() {
        filterDue = '';
    }

    function toggleDone(todo, event) {
        todo.done = event.currentTarget.checked;
        sortTodosInPlace(app.data.todos);
        markDirty();
    }
</script>

{#if app.saveStatus !== 'saved'}
    <div class="section-toolbar">
        <span class="muted">{app.saveStatus === 'error' ? 'Save failed' : 'Unsaved changes'}</span>
        <button type="button" class="btn {app.saveStatus === 'error' ? 'btn-danger' : 'btn-success'}" onclick={saveNow}>
            <Save size={13} aria-hidden="true" /> {app.saveStatus === 'error' ? 'Retry save' : 'Save'}
        </button>
    </div>
{/if}

<div class="table-wrap">
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Title</th>
                <th scope="col" class="col-due">Due</th>
                <th scope="col" class="col-done">Done</th>
                <th scope="col" class="col-actions" aria-label="Actions"></th>
            </tr>
            <tr class="filter-row">
                <td>
                    <input type="search" placeholder="Filter title" aria-label="Filter todos by title" bind:value={filterTitle} ondblclick={clearTitleFilter} />
                </td>
                <td>
                    <input type="search" placeholder="Filter due" aria-label="Filter todos by due date" bind:value={filterDue} ondblclick={clearDueFilter} />
                </td>
                <td></td>
                <td class="col-actions">
                    <ActionButton label="Clear filters" icon={X} onclick={clearFilters} />
                    <ActionButton label="Sort todos" icon={ArrowUpDown} onclick={sortTodos} />
                </td>
            </tr>
        </thead>
        <tbody>
            {#each visibleTodos as todo (todo)}
                <tr class={{ 'done-row': todo.done }}>
                    <td><input type="text" aria-label="Todo title" bind:value={todo.title} oninput={markDirty} /></td>
                    <td><input type="text" aria-label="Todo due date" bind:value={todo.due} oninput={markDirty} /></td>
                    <td class="col-done">
                        <input type="checkbox" checked={todo.done} aria-label="Todo done" onchange={event => toggleDone(todo, event)} />
                    </td>
                    <td class="col-actions">
                        <ActionButton
                            label="Delete todo"
                            icon={Trash2}
                            variant="danger"
                            onclick={() => {
                                if (confirm('Really want to remove row?')) removeTodo(todo);
                            }} />
                    </td>
                </tr>
            {/each}
            {#if visibleTodos.length === 0}
                <tr>
                    <td colspan="4" class="muted">No to-dos match the current view.</td>
                </tr>
            {/if}
        </tbody>
        <tfoot>
            <tr>
                <td>
                    <input type="text" placeholder="New todo title" aria-label="New todo title" bind:this={newTitleInput} bind:value={newTitle} onkeydown={addOnEnter} />
                </td>
                <td><input type="text" placeholder="Due (YYYY-MM-DD)" aria-label="New todo due date" bind:value={newDue} onkeydown={addOnEnter} /></td>
                <td class="col-done"></td>
                <td class="col-actions">
                    <ActionButton label="Add todo" icon={Check} variant="success" onclick={add} />
                </td>
            </tr>
        </tfoot>
    </table>
</div>
