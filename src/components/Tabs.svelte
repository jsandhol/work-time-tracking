<script>
    let { tabs, active = $bindable(), panelId } = $props();

    function onkeydown(event, index) {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

        event.preventDefault();

        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;

        active = tabs[next].id;
        document.getElementById(`${panelId}-tab-${tabs[next].id}`)?.focus();
    }
</script>

<div class="tabs" role="tablist" aria-label="Sections">
    {#each tabs as tab, index (tab.id)}
        <button
            type="button"
            class="tab"
            id={`${panelId}-tab-${tab.id}`}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`${panelId}-${tab.id}`}
            tabindex={active === tab.id ? 0 : -1}
            onclick={() => (active = tab.id)}
            onkeydown={event => onkeydown(event, index)}>
            {tab.label}
            {#if tab.count !== undefined}
                <span class="tab-count">{tab.count}</span>
            {/if}
        </button>
    {/each}
</div>
