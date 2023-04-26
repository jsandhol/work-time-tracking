<script>
    export let messages = [];

    const del = index => {
        messages.splice(index, 1);
        messages = [...messages];
    };
</script>

{#if messages.length > 0}
    {#each messages as message, index}
        <div class="notification m-1 p-2">
            <button class="delete" on:click={() => del(index)} />
            {message}
        </div>
    {/each}

    <div class="is-pulled-right">
        <a href={'#'} alt="clear all message" on:click={() => (messages = [])}>Clear All Messages</a>
    </div>
{/if}
