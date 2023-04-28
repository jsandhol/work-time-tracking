<script>
    import CodeSnippets from './components/CodeSnippets.svelte';
    import Config from './components/Config.svelte';
    import Messages from './components/Messages.svelte';
    import Navbar from './components/Navbar.svelte';
    import Notes from './components/Notes.svelte';
    import TimeSummary from './components/TimeSummary.svelte';
    import ToDo from './components/ToDo.svelte';
    import WorkTime from './components/WorkTime.svelte';
    import { _WTT } from './utils';

    let data = _WTT.loadData();
    let messages = [];
    let tab = 0;
</script>

<Navbar bind:data bind:messages />

<section class="section">
    <h5 class="title is-5">Work Time Tracking</h5>

    <div class="columns is-multiline is-mobile">
        <div class="column is-9">
            <div class="columns is-multiline is-mobile">
                <div class="column is-12">
                    <WorkTime bind:data bind:messages />
                </div>
                <div class="column is-12">
                    <div class="tabs">
                        <ul>
                            <li class:is-active={tab === 0}><a href={'#'} on:click={() => (tab = 0)}>Info</a></li>
                            <li class:is-active={tab === 1}><a href={'#'} on:click={() => (tab = 1)}>ToDo ({data.todos.filter(t => t.done !== true).length})</a></li>
                            <li class:is-active={tab === 2}><a href={'#'} on:click={() => (tab = 2)}>Notes ({data.notes.length})</a></li>
                            <li class:is-active={tab === 3}><a href={'#'} on:click={() => (tab = 3)}>Snippets ({data.snippets.length})</a></li>
                        </ul>
                    </div>
                    {#if tab === 0}
                        <div class="notification">
                            Use work time tracking to handle daily items: work time per issue (like JIRA ref), current todo lists and notes. Work time is summarized to help entering work time
                            data to your organization's time management system at the end of the day. You can also maintain often used code snippets for easy access. Navigation bar provides
                            access to links and searches most frequently needed. You can alter the configuration from the Config section. You can export/import your data by using the Full
                            Config option in the Config section.
                        </div>
                    {:else if tab === 1}
                        <ToDo bind:data bind:messages />
                    {:else if tab === 2}
                        <Notes bind:data bind:messages />
                    {:else if tab === 3}
                        <CodeSnippets bind:data bind:messages />
                    {/if}
                </div>
            </div>
        </div>
        <div class="column is-3">
            <div class="columns is-multiline is-mobile">
                <div class="column is-12">
                    <TimeSummary bind:data />
                </div>
                <div class="column is-12">
                    <Config bind:data bind:messages />
                </div>
                <div class="column is-12">
                    <Messages bind:messages />
                </div>
            </div>
        </div>
    </div>
</section>
