<script>
    import { highlightCode } from '$lib/highlight.js';

    let { value = $bindable(''), lang = 'text', label = 'Code', placeholder = '', oninput } = $props();

    let highlightEl = $state();

    function highlight(node) {
        $effect(() => {
            node.innerHTML = highlightCode(value, lang) + '\n';
        });
    }

    function handleInput(event) {
        value = event.currentTarget.value;
        oninput?.();
    }

    function syncScroll(event) {
        if (!highlightEl) return;
        highlightEl.scrollTop = event.currentTarget.scrollTop;
        highlightEl.scrollLeft = event.currentTarget.scrollLeft;
    }
</script>

<div class="code-editor">
    <pre class="code-editor-highlight" aria-hidden="true" bind:this={highlightEl}><code class="hljs" {@attach highlight}></code></pre>
    <textarea
        class="code-editor-input"
        rows="5"
        wrap="off"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        {placeholder}
        aria-label={label}
        value={value}
        oninput={handleInput}
        onscroll={syncScroll}></textarea>
</div>
