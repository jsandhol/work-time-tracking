<script>
    import ActionButton from './ActionButton.svelte';
    import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
    import Monitor from '@lucide/svelte/icons/monitor';
    import Moon from '@lucide/svelte/icons/moon';
    import Save from '@lucide/svelte/icons/save';
    import Sun from '@lucide/svelte/icons/sun';
    import { app, notify, resetAll, resetTime, saveNow } from '$lib/store.svelte.js';
    import { theme } from '$lib/theme.svelte.js';
    import { buildSearchUrl } from '../utils.js';

    let searchGoogle = $state('');
    let searchGoogleAi = $state('');
    let searchIssues = $state('');
    let searchReddit = $state('');
    let searchSof = $state('');
    let linksEl = $state();

    const themeIcon = $derived(theme.mode === 'system' ? Monitor : theme.mode === 'light' ? Sun : Moon);
    const themeLabel = $derived(
        theme.mode === 'system'
            ? 'Theme: system (click for light)'
            : theme.mode === 'light'
              ? 'Theme: light (click for dark)'
              : 'Theme: dark (click for system)'
    );

    function openSearch(template, value) {
        const url = buildSearchUrl(template, value);
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    function onSearchKey(event, template, value) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        openSearch(template, value);
    }

    function cycleTheme() {
        try {
            theme.cycle();
        } catch (error) {
            notify(`Could not save the theme: ${error instanceof Error ? error.message : String(error)}`, 'error');
        }
    }

    function doResetTime() {
        if (confirm('Really want to reset time data?')) resetTime();
    }

    function doResetAll() {
        if (confirm('Really want to reset time and todos (notes, snippets and config remain)?')) resetAll();
    }

    function closeLinks() {
        if (linksEl) linksEl.open = false;
    }

    function onWindowClick(event) {
        if (linksEl?.open && !linksEl.contains(event.target)) linksEl.open = false;
    }

    function onWindowKeydown(event) {
        if (event.key === 'Escape' && linksEl) linksEl.open = false;
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            saveNow();
        }
    }
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeydown} />

<header class="app-topbar">
    <div class="topbar-inner">
        <a class="brand" href="#app" aria-label="Work Time Tracking">
            <svg viewBox="0 0 64 64" aria-hidden="true">
                <path d="M32 8 52 28 32 48 12 28Z" fill="var(--accent)"></path>
                <path d="M9 35 32 58 55 35" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <span>Work time</span>
        </a>

        {#if app.data.config.links.length > 0}
            <details class="links-menu" bind:this={linksEl}>
                <summary class="btn">Links</summary>
                <div class="links-dropdown">
                    {#each app.data.config.links as link (link)}
                        <a href={link.href} target="_blank" rel="noopener noreferrer" onclick={closeLinks}>{link.title || link.href}</a>
                    {/each}
                </div>
            </details>
        {/if}

        <div class="topbar-spacer"></div>

        <div class="topbar-section">
            {#if app.data.config.search.google}
                <input
                    class="search-input"
                    type="search"
                    placeholder="Google"
                    aria-label="Search Google"
                    bind:value={searchGoogle}
                    onkeydown={event => onSearchKey(event, app.data.config.search.google, searchGoogle)}
                    ondblclick={() => (searchGoogle = '')} />
            {/if}
            {#if app.data.config.search.google_ai}
                <input
                    class="search-input"
                    type="search"
                    placeholder="Ask AI"
                    aria-label="Ask Google AI Mode"
                    bind:value={searchGoogleAi}
                    onkeydown={event => onSearchKey(event, app.data.config.search.google_ai, searchGoogleAi)}
                    ondblclick={() => (searchGoogleAi = '')} />
            {/if}
            {#if app.data.config.search.issues}
                <input
                    class="search-input"
                    type="search"
                    placeholder="Issue"
                    aria-label="Search issue"
                    bind:value={searchIssues}
                    onkeydown={event => onSearchKey(event, app.data.config.search.issues, searchIssues)}
                    ondblclick={() => (searchIssues = '')} />
            {/if}
            {#if app.data.config.search.reddit}
                <input
                    class="search-input"
                    type="search"
                    placeholder="Reddit"
                    aria-label="Search Reddit"
                    bind:value={searchReddit}
                    onkeydown={event => onSearchKey(event, app.data.config.search.reddit, searchReddit)}
                    ondblclick={() => (searchReddit = '')} />
            {/if}
            {#if app.data.config.search.sof}
                <input
                    class="search-input"
                    type="search"
                    placeholder="SOF"
                    aria-label="Search Stack Overflow"
                    bind:value={searchSof}
                    onkeydown={event => onSearchKey(event, app.data.config.search.sof, searchSof)}
                    ondblclick={() => (searchSof = '')} />
            {/if}
        </div>

        <div class="topbar-section">
            <button
                type="button"
                class="btn save-button {app.saveStatus}"
                title={app.saveStatus === 'dirty'
                    ? 'Save changes to local storage'
                    : app.saveStatus === 'error'
                      ? 'Retry saving'
                      : 'All changes saved (click to save anyway)'}
                onclick={saveNow}>
                {#if app.saveStatus === 'error'}
                    <AlertTriangle size={13} aria-hidden="true" /> Retry save
                {:else}
                    <Save size={13} aria-hidden="true" /> Save
                {/if}
            </button>
            <ActionButton label={themeLabel} icon={themeIcon} onclick={cycleTheme} />
            <button type="button" class="btn btn-warning" onclick={doResetTime}>Reset time</button>
            <button type="button" class="btn btn-danger" onclick={doResetAll}>Reset all</button>
        </div>
    </div>
</header>
