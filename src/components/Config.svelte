<script>
    import ActionButton from './ActionButton.svelte';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';
    import ChevronUp from '@lucide/svelte/icons/chevron-up';
    import Copy from '@lucide/svelte/icons/copy';
    import Download from '@lucide/svelte/icons/download';
    import Plus from '@lucide/svelte/icons/plus';
    import RefreshCw from '@lucide/svelte/icons/refresh-cw';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import Upload from '@lucide/svelte/icons/upload';
    import { app, importData, markDirty, notify, saveNow, setHistoryLimit } from '$lib/store.svelte.js';
    import { formatDate } from '../utils.js';

    let expanded = $state(false);
    let draft = $state('');
    let historyLimit = $state(app.data.config.history);
    let newTitle = $state('');
    let newHref = $state('');
    let newSystemLabel = $state('');

    function loadCurrent() {
        draft = JSON.stringify($state.snapshot(app.data), null, 2);
    }

    function toggle() {
        expanded = !expanded;
        if (expanded) loadCurrent();
    }

    function applyHistoryLimit() {
        const value = Number(historyLimit);
        if (!Number.isInteger(value) || value < 0) {
            notify('History must be a whole number of 0 or more.', 'warning');
            historyLimit = app.data.config.history;
            return;
        }

        setHistoryLimit(value);
        historyLimit = app.data.config.history;
    }

    function addLink() {
        if (!newTitle.trim() || !newHref.trim()) {
            notify('Link title and URL are required.', 'warning');
            return;
        }

        app.data.config.links.push({ title: newTitle.trim(), href: newHref.trim() });
        newTitle = '';
        newHref = '';
        if (saveNow()) notify('Link added.', 'success');
    }

    function removeLink(link) {
        if (!confirm(`Remove link "${link.title || link.href}"?`)) return;

        const index = app.data.config.links.indexOf(link);
        if (index === -1) throw new Error('Link not found.');
        app.data.config.links.splice(index, 1);
        if (saveNow()) notify('Link removed.', 'success');
    }

    function addSystem() {
        const label = newSystemLabel.trim();
        if (!label) {
            notify('Reporting system name is required.', 'warning');
            return;
        }

        const systems = app.data.config.reporting.systems;
        const used = new Set(systems.map(system => system.id));
        let index = systems.length + 1;
        let id = `client-${index}`;
        while (used.has(id)) {
            index += 1;
            id = `client-${index}`;
        }

        systems.push({ id, label });
        newSystemLabel = '';
        markDirty();
    }

    function removeSystem(system) {
        if (!confirm(`Remove reporting system "${system.label || system.id}"?`)) return;

        const systems = app.data.config.reporting.systems;
        const index = systems.indexOf(system);
        if (index === -1) throw new Error('Reporting system not found.');
        systems.splice(index, 1);
        markDirty();
    }

    async function copyDraft() {
        try {
            await navigator.clipboard.writeText(draft);
            notify('Config copied to clipboard.', 'success');
        } catch (error) {
            notify(`Could not copy: ${error instanceof Error ? error.message : String(error)}`, 'error');
        }
    }

    function downloadDraft() {
        const blob = new Blob([draft], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `wtt-data-${formatDate()}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    function importDraft() {
        let parsed;
        try {
            parsed = JSON.parse(draft);
        } catch (error) {
            notify(`Import failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
            return;
        }

        if (!confirm('Really want to replace all data with the imported config?')) return;

        try {
            importData(parsed);
        } catch (error) {
            notify(`Import failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
            return;
        }

        historyLimit = app.data.config.history;
        loadCurrent();
    }
</script>

<div class="card">
    <div class="card-header">
        <h2 class="card-title">Config</h2>
        <ActionButton label={expanded ? 'Collapse config' : 'Expand config'} icon={expanded ? ChevronUp : ChevronDown} onclick={toggle} />
    </div>

    {#if expanded}
        <div class="card-body">
            <div class="config-section">
                <h3 class="config-section-title">History</h3>
                <div class="config-row">
                    <label for="config-history">Remember</label>
                    <input id="config-history" type="number" min="0" step="1" bind:value={historyLimit} onchange={applyHistoryLimit} />
                    <span class="muted">last used</span>
                </div>
                <p class="muted">0 disables suggestions for references and note categories.</p>
            </div>

            <div class="config-section">
                <h3 class="config-section-title">Search</h3>
                <div class="config-row">
                    <label for="search-google">Google</label>
                    <input id="search-google" type="text" bind:value={app.data.config.search.google} oninput={markDirty} />
                    <span></span>
                </div>
                <div class="config-row">
                    <label for="search-google-ai">Google AI</label>
                    <input id="search-google-ai" type="text" bind:value={app.data.config.search.google_ai} oninput={markDirty} />
                    <span></span>
                </div>
                <div class="config-row">
                    <label for="search-issues">Issues</label>
                    <input id="search-issues" type="text" bind:value={app.data.config.search.issues} oninput={markDirty} />
                    <span></span>
                </div>
                <div class="config-row">
                    <label for="search-reddit">Reddit</label>
                    <input id="search-reddit" type="text" bind:value={app.data.config.search.reddit} oninput={markDirty} />
                    <span></span>
                </div>
                <div class="config-row">
                    <label for="search-sof">Stack Overflow</label>
                    <input id="search-sof" type="text" bind:value={app.data.config.search.sof} oninput={markDirty} />
                    <span></span>
                </div>
            </div>

            <div class="config-section">
                <h3 class="config-section-title">Reporting</h3>
                <div class="config-links">
                    {#each app.data.config.reporting.systems as system (system.id)}
                        <div class="system-row">
                            <input type="text" aria-label="Reporting system name" bind:value={system.label} oninput={markDirty} />
                            <ActionButton label="Remove reporting system" icon={Trash2} variant="danger" onclick={() => removeSystem(system)} />
                        </div>
                    {/each}
                    <div class="system-row">
                        <input type="text" placeholder="New client/system name" aria-label="New reporting system" bind:value={newSystemLabel} />
                        <ActionButton label="Add reporting system" icon={Plus} variant="success" onclick={addSystem} />
                    </div>
                </div>
                <p class="muted">Mark each system once you have manually entered that day's work time into that customer's time-keeping system, or your own. Shown as confirmation toggles on @END rows.</p>
            </div>

            <div class="config-section">
                <h3 class="config-section-title">Links</h3>
                <div class="config-links">
                    {#each app.data.config.links as link (link)}
                        <div class="link-row">
                            <input type="text" aria-label="Link title" bind:value={link.title} oninput={markDirty} />
                            <input type="text" aria-label="Link URL" bind:value={link.href} oninput={markDirty} />
                            <ActionButton label="Remove link" icon={Trash2} variant="danger" onclick={() => removeLink(link)} />
                        </div>
                    {/each}
                    <div class="link-row">
                        <input type="text" placeholder="New link title" aria-label="New link title" bind:value={newTitle} />
                        <input type="text" placeholder="New link URL" aria-label="New link URL" bind:value={newHref} />
                        <ActionButton label="Add link" icon={Plus} variant="success" onclick={addLink} />
                    </div>
                </div>
            </div>

            <div class="config-section">
                <h3 class="config-section-title">Full Config</h3>
                <textarea class="full-config" rows="10" aria-label="Full configuration JSON" bind:value={draft}></textarea>
                <div class="config-actions">
                    <button type="button" class="btn" onclick={loadCurrent}><RefreshCw size={13} aria-hidden="true" /> Load current</button>
                    <button type="button" class="btn" onclick={copyDraft}><Copy size={13} aria-hidden="true" /> Copy</button>
                    <button type="button" class="btn" onclick={downloadDraft}><Download size={13} aria-hidden="true" /> Download</button>
                    <button type="button" class="btn btn-danger" onclick={importDraft}><Upload size={13} aria-hidden="true" /> Import</button>
                </div>
            </div>
        </div>
    {/if}
</div>
