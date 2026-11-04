<script>
    import { highlightCode } from '$lib/highlight.js';

    let { code = '', lang = 'text' } = $props();

    function highlight(node) {
        $effect(() => {
            // highlight.js escapes the input before adding markup, so this HTML is safe.
            node.innerHTML = highlightCode(code, lang);
        });
    }
</script>

<div class="code-block">
    <pre><code class="hljs" {@attach highlight}></code></pre>
</div>
