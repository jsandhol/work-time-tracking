<script>
    import ActionButton from './components/ActionButton.svelte';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';
    import ChevronUp from '@lucide/svelte/icons/chevron-up';
    import Config from './components/Config.svelte';
    import CodeSnippets from './components/CodeSnippets.svelte';
    import Messages from './components/Messages.svelte';
    import Navbar from './components/Navbar.svelte';
    import Notes from './components/Notes.svelte';
    import Tabs from './components/Tabs.svelte';
    import TimeSummary from './components/TimeSummary.svelte';
    import ToDo from './components/ToDo.svelte';
    import WorkTime from './components/WorkTime.svelte';
    import { app } from '$lib/store.svelte.js';
    import { theme } from '$lib/theme.svelte.js';

    let detailsExpanded = $state(false);
    let tab = $state('info');

    const openTodos = $derived(app.data.todos.filter(todo => !todo.done).length);
    const tabs = $derived([
        { id: 'info', label: 'Info' },
        { id: 'todos', label: 'To-do', count: openTodos },
        { id: 'notes', label: 'Notes', count: app.data.notes.length },
        { id: 'snippets', label: 'Snippets', count: app.data.snippets.length },
    ]);

    $effect(() => {
        const root = document.documentElement;
        root.dataset.theme = theme.resolved;
        root.dataset.themeMode = theme.mode;
        root.style.colorScheme = theme.resolved;
        root.style.removeProperty('background-color');
    });

    function onBeforeUnload(event) {
        if (app.saveStatus === 'saved') return;
        event.preventDefault();
        event.returnValue = '';
    }
</script>

<svelte:window onbeforeunload={onBeforeUnload} />

<Navbar />

<main class="app-main">
    <section class="main-col">
        <WorkTime />

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Info / To-do / Notes / Snippets</h2>
                <ActionButton
                    label={detailsExpanded ? 'Collapse section' : 'Expand section'}
                    icon={detailsExpanded ? ChevronUp : ChevronDown}
                    onclick={() => (detailsExpanded = !detailsExpanded)} />
            </div>

            {#if detailsExpanded}
                <Tabs {tabs} bind:active={tab} panelId="section" />
                <div class="tab-panels">
                    {#if tab === 'info'}
                        <div class="info-panel" id="section-info" role="tabpanel" aria-labelledby="section-tab-info" tabindex="0">
                            <p>
                                Use work time tracking to handle daily items: work time per issue (like a JIRA reference), current to-do lists and notes. Work time is summarized to
                                help entering work time data to your organization's time management system at the end of the day.
                            </p>
                            <p>
                                You can also maintain often-used code snippets for easy access. The navigation bar provides links and searches you need most frequently. Change
                                settings from Config, and export/import everything with the Full Config JSON.
                            </p>
                        </div>
                    {:else if tab === 'todos'}
                        <div class="tab-panel" id="section-todos" role="tabpanel" aria-labelledby="section-tab-todos">
                            <ToDo />
                        </div>
                    {:else if tab === 'notes'}
                        <div class="tab-panel" id="section-notes" role="tabpanel" aria-labelledby="section-tab-notes">
                            <Notes />
                        </div>
                    {:else if tab === 'snippets'}
                        <div class="tab-panel" id="section-snippets" role="tabpanel" aria-labelledby="section-tab-snippets">
                            <CodeSnippets />
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </section>

    <aside class="side-col">
        <TimeSummary />
        <Config />
        <Messages />
    </aside>
</main>
