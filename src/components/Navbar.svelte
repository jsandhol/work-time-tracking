<script>
    import { _WTT } from '../utils';

    export let data;
    export let messages = [];

    const save = withMessage => {
        data = _WTT.storeData(data);
        if (withMessage) {
            messages.push(withMessage);
            messages = [...messages];
        }
    };

    const resetTime = () => {
        if (confirm('Really want to reset time data?')) {
            data.times = [];
            data.summary.categories = [];
            data.summary.total = undefined;
            save('Time data reset.');
        }
    };

    const resetAll = () => {
        if (confirm('Really want to reset time and todos (notes, snippets and config remains)?')) {
            data.times = [];
            data.todos = [];
            data.summary.categories = [];
            data.summary.total = undefined;
            save('All data reset.');
        }
    };

    let valGoogle;
    let valIssues;
    let valReddit;
    let valSOF;
    let isActive = false;

    const searchGoogle = e => {
        if (e.key === 'Enter') {
            window.open(`${data.config.search.google}${valGoogle}`, '_blank');
        }
    };

    const searchIssues = e => {
        if (e.key === 'Enter') {
            window.open(`${data.config.search.issues}${valIssues}`, '_blank');
        }
    };

    const searchReddit = e => {
        if (e.key === 'Enter') {
            window.open(`${data.config.search.reddit}${valReddit}`, '_blank');
        }
    };

    const searchSOF = e => {
        if (e.key === 'Enter') {
            window.open(`${data.config.search.sof}${valSOF}`, '_blank');
        }
    };
</script>

<nav class="navbar is-light" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href={'#'}>
            <img src="wtt.png" alt="WTT" />
        </a>
        <a href={'#'} role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarContent" on:click={() => (isActive = !isActive)}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
        </a>
    </div>
    <div id="navbarContent" class="navbar-menu" class:is-active={isActive}>
        <div class="navbar-start">
            {#if data.config.links.length > 0}
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link" href={'#'}> Links </a>
                    <div class="navbar-dropdown">
                        {#each data.config.links as link}
                            <a class="navbar-item" target="_blank" href={link.href}> {link.title} </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
        <div class="navbar-end">
            <div class="navbar-item">
                <div class="field is-grouped">
                    <p class="control">
                        {#if _WTT.isNotEmptyStr(data.config.search.google)}
                            <input class="input is-small" type="text" placeholder="Search Google" bind:value={valGoogle} on:keyup={searchGoogle} on:dblclick={() => (valGoogle = undefined)} />
                        {/if}
                        {#if _WTT.isNotEmptyStr(data.config.search.reddit)}
                            <input class="input is-small" type="text" placeholder="Search Reddit" bind:value={valReddit} on:keyup={searchReddit} on:dblclick={() => (valReddit = undefined)} />
                        {/if}
                        {#if _WTT.isNotEmptyStr(data.config.search.sof)}
                            <input class="input is-small" type="text" placeholder="Search SOF" bind:value={valSOF} on:keyup={searchSOF} on:dblclick={() => (valSOF = undefined)} />
                        {/if}
                        {#if _WTT.isNotEmptyStr(data.config.search.issues)}
                            <input class="input is-small" type="text" placeholder="Search Issues" bind:value={valIssues} on:keyup={searchIssues} on:dblclick={() => (valIssues = undefined)} />
                        {/if}
                    </p>
                </div>
            </div>
            <div class="navbar-item">
                <div class="field is-grouped">
                    <p class="control">
                        <a href={'#'} class="button is-warning" on:click={() => resetTime()}>Reset Time</a>
                        <a href={'#'} class="button is-danger" on:click={() => resetAll()}>Reset All</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</nav>

<style>
    input {
        width: 125px;
    }
</style>
