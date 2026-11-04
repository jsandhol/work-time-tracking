<script>
    let { label, icon: Icon, variant = 'ghost', disabled = false, compact = false, onclick } = $props();
</script>

<button type="button" class="icon-btn {variant}{compact ? ' compact' : ''}" aria-label={label} title={label} {disabled} {onclick}>
    {#if Icon}
        <Icon size={compact ? 12 : 14} strokeWidth={2} aria-hidden="true" />
    {/if}
</button>
