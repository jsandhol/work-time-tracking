<script>
    import X from '@lucide/svelte/icons/x';
    import { app, clearMessages, dismissMessage } from '$lib/store.svelte.js';
</script>

{#if app.messages.length > 0}
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">Messages</h2>
            {#if app.messages.length > 1}
                <button type="button" class="btn" onclick={clearMessages}>Clear all</button>
            {/if}
        </div>
        <div class="card-body message-list" aria-live="polite" aria-atomic="false">
            {#each app.messages as message (message.id)}
                <div class="message {message.tone}" role={message.tone === 'error' ? 'alert' : undefined}>
                    <span class="message-text">{message.text}</span>
                    <button type="button" class="message-close" aria-label="Dismiss message" onclick={() => dismissMessage(message.id)}>
                        <X size={13} aria-hidden="true" />
                    </button>
                </div>
            {/each}
        </div>
    </div>
{/if}
