<script>
    export let clas = undefined;
    export let icon = undefined;
</script>

<button class="button is-small {clas}" on:click>
    {#if icon}
        <span class="icon is-small">
            <i class={icon} />
        </span>
    {/if}
</button>
