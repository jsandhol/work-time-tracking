<script>
    import { _WTT } from '../utils';

    export let data;

    let totals = [];

    const calc = data => {
        let summary = [];

        const updateSummary = (obj, millis) => {
            let found = false;

            for (const s of summary) {
                if (s.ref === obj.ref) {
                    s.millis = s.millis + millis;
                    found = true;
                    break;
                }
            }

            if (!found) summary.push({ ref: obj.ref, time: undefined, millis });
        };

        const calcGrandTotal = () => {
            const total = { ref: 'Grand Total', time: undefined, millis: 0 };

            summary.forEach(s => {
                s.time = _WTT.millisToTime(s.millis);
                total.millis = total.millis + s.millis;
            });

            total.time = _WTT.millisToTime(total.millis);

            return total;
        };

        data.times.forEach((obj, index) => {
            if (obj.ref !== '@END') {
                let d1 = new Date(obj.time);
                let d2 = data.times[index + 1] ? new Date(data.times[index + 1].time) : new Date();
                updateSummary(obj, d2.getTime() - d1.getTime());
            }
        });

        summary.push(calcGrandTotal());

        return summary;
    };

    $: totals = calc(data);
</script>

<table class="table is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
        <th>Reference</th>
        <th>Total</th>
    </thead>
    <tbody>
        {#each totals as t}
            <tr>
                <td class:is-bold={t.ref === 'Grand Total'}>{t.ref}</td>
                <td class:is-bold={t.ref === 'Grand Total'}>{t.time}</td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .is-bold {
        font-weight: bold;
    }
</style>
