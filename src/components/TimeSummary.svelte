<script>
    import ActionButton from './ActionButton.svelte';
    import RefreshCw from '@lucide/svelte/icons/refresh-cw';
    import { app } from '$lib/store.svelte.js';
    import { calcTotals } from '../utils.js';

    let refreshTick = $state(0);
    const totals = $derived.by(() => {
        void refreshTick;
        return calcTotals(app.data.times, Date.now());
    });

    function refresh() {
        refreshTick += 1;
    }
</script>

<div class="card">
    <div class="card-header">
        <h2 class="card-title">Time summary</h2>
        <ActionButton label="Refresh totals" icon={RefreshCw} compact onclick={refresh} />
    </div>

    <table class="table summary-table">
        <thead>
            <tr>
                <th scope="col">Reference</th>
                <th scope="col" class="num">Total</th>
            </tr>
        </thead>
        <tbody>
            {#each totals.rows as row (row.ref)}
                <tr>
                    <td>
                        {row.ref}
                        {#if row.invalid}
                            <span class="summary-invalid" title="Some intervals have invalid or out-of-order times">!</span>
                        {/if}
                    </td>
                    <td class="num">{row.time}</td>
                </tr>
            {/each}
            {#if totals.rows.length === 0}
                <tr>
                    <td colspan="2" class="muted">No time rows yet.</td>
                </tr>
            {/if}
            <tr class="summary-total">
                <td>GRAND TOTAL</td>
                <td class="num">{totals.total.time}</td>
            </tr>
        </tbody>
    </table>

    {#if totals.hasInvalid}
        <div class="card-body summary-warning">Some rows have invalid or out-of-order times; those intervals are excluded from the totals.</div>
    {/if}
</div>
