<script>
    import ActionButton from './ActionButton.svelte';
    import Check from '@lucide/svelte/icons/check';
    import Clock from '@lucide/svelte/icons/clock';
    import Power from '@lucide/svelte/icons/power';
    import Search from '@lucide/svelte/icons/search';
    import Square from '@lucide/svelte/icons/square';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import { addTime, app, beginTime, markDirty, notify, removeTime, saveNow } from '$lib/store.svelte.js';
    import { formatDateTime } from '../utils.js';

    let newTime = $state('');
    let newRef = $state('');
    let newDesc = $state('');
    let timeInput = $state();
    let refInput = $state();
    let descInput = $state();

    const issueSearch = $derived(app.data.config.search.issues);

    function startNow() {
        newTime = formatDateTime();
        refInput?.focus();
    }

    function endNow() {
        newTime = formatDateTime();
        newRef = '@END';
        newDesc = '';
        descInput?.focus();
    }

    function commit() {
        if (!newTime.trim()) {
            notify('Set a time before adding the row.', 'warning');
            timeInput?.focus();
            return;
        }

        addTime({ time: newTime, ref: newRef, desc: newDesc });
        newTime = '';
        newRef = '';
        newDesc = '';
        refInput?.focus();
    }

    function onAddKeydown(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        commit();
    }

    function begin(time) {
        if (confirm('Really want to replace time?')) beginTime(time);
    }

    function remove(time) {
        if (confirm('Really want to remove row?')) removeTime(time);
    }

    function openIssue(ref) {
        const key = String(ref ?? '').trim();
        if (!issueSearch || !key) return;
        window.open(`${issueSearch}${encodeURI(key)}`, '_blank', 'noopener,noreferrer');
    }

    function toggleReported(time, systemId) {
        if (!time.reported) time.reported = {};
        if (time.reported[systemId]) delete time.reported[systemId];
        else time.reported[systemId] = formatDateTime();
        saveNow();
    }

    function allReported(time) {
        const systems = app.data.config.reporting.systems;
        return systems.length > 0 && systems.every(system => Boolean(time.reported?.[system.id]));
    }
</script>

<datalist id="history-refs">
    {#each app.data.history.times as ref (ref)}
        <option value={ref}></option>
    {/each}
</datalist>

<div class="card">
    <div class="card-header">
        <h2 class="card-title">Work time</h2>
        <span class="muted">{app.data.times.length} rows</span>
    </div>

    <div class="table-wrap">
        <table class="table table-wide">
            <thead>
                <tr>
                    <th scope="col" class="col-mark" aria-label="Set time"></th>
                    <th scope="col" class="col-time">Time</th>
                    <th scope="col" class="col-ref">Reference</th>
                    <th scope="col">Description</th>
                    <th scope="col" class="col-row-actions" aria-label="Actions"></th>
                </tr>
            </thead>
            <tbody>
                {#each app.data.times as time (time)}
                    <tr>
                        <td class="col-mark"><ActionButton label="Set this row's time to now" icon={Clock} variant="warning" onclick={() => begin(time)} /></td>
                        <td><input class="mono" type="text" aria-label="Time" bind:value={time.time} oninput={markDirty} /></td>
                        <td class="col-ref">
                            <div class="ref-field">
                                <input type="text" aria-label="Reference" list="history-refs" bind:value={time.ref} oninput={markDirty} />
                                <ActionButton
                                    label="Open issue in a new tab"
                                    icon={Search}
                                    compact
                                    disabled={!issueSearch || !time.ref.trim() || time.ref === '@END'}
                                    onclick={() => openIssue(time.ref)} />
                            </div>
                        </td>
                        <td><input type="text" aria-label="Description" bind:value={time.desc} oninput={markDirty} /></td>
                        <td class="col-row-actions">
                            <ActionButton label="Delete row" icon={Trash2} variant="danger" onclick={() => remove(time)} />
                        </td>
                    </tr>
                    {#if time.ref === '@END'}
                        <tr class="report-row {allReported(time) ? 'complete' : ''}">
                            <td colspan="5">
                                <div class="report-controls">
                                    <span class="muted" title="Tick each system once you have manually entered this work time into that customer's system, or your own.">Work time reported to</span>
                                    {#if app.data.config.reporting.systems.length === 0}
                                        <span class="muted">No reporting systems configured</span>
                                    {:else}
                                        {#each app.data.config.reporting.systems as system (system.id)}
                                            {@const isReported = Boolean(time.reported?.[system.id])}
                                            {@const reportedAt = time.reported?.[system.id]}
                                            <button
                                                type="button"
                                                class="report-chip {isReported ? 'done' : ''}"
                                                aria-pressed={isReported}
                                                title={isReported ? `Reported at ${reportedAt}` : 'Click to confirm this work time has been entered into this system'}
                                                onclick={() => toggleReported(time, system.id)}>
                                                {#if isReported}
                                                    <Check size={12} aria-hidden="true" />
                                                    <span>{system.label || system.id}</span>
                                                    <span class="report-time">{reportedAt.slice(11, 16)}</span>
                                                {:else}
                                                    <Square size={12} aria-hidden="true" />
                                                    <span>{system.label || system.id}</span>
                                                {/if}
                                            </button>
                                        {/each}
                                        {#if allReported(time)}
                                            <span class="report-complete-label">All reported</span>
                                        {/if}
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {/if}
                {/each}
            </tbody>
        </table>
    </div>

    <div class="add-bar">
        <ActionButton label="Set new time to now" icon={Clock} variant="success" onclick={startNow} />
        <input class="mono add-time" type="text" placeholder="New time" aria-label="New time" bind:this={timeInput} bind:value={newTime} onkeydown={onAddKeydown} />
        <div class="ref-field add-ref">
            <input type="text" placeholder="New reference" aria-label="New reference" list="history-refs" bind:this={refInput} bind:value={newRef} onkeydown={onAddKeydown} />
            <ActionButton
                label="Open issue in a new tab"
                icon={Search}
                compact
                disabled={!issueSearch || !newRef.trim()}
                onclick={() => openIssue(newRef)} />
        </div>
        <input class="add-desc" type="text" placeholder="New description" aria-label="New description" bind:this={descInput} bind:value={newDesc} onkeydown={onAddKeydown} />
        <div class="add-actions">
            <ActionButton label="Add time row" icon={Check} variant="success" onclick={commit} />
            <ActionButton label="End this session (@END)" icon={Power} variant="accent" onclick={endNow} />
        </div>
    </div>
</div>
