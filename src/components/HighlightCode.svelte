<script>
    import Highlight from 'svelte-highlight';
    import style from 'svelte-highlight/styles/github';

    import bash from 'svelte-highlight/languages/bash';
    import basic from 'svelte-highlight/languages/basic';
    import dos from 'svelte-highlight/languages/dos';
    import html from 'svelte-highlight/languages/vbscript-html';
    import java from 'svelte-highlight/languages/java';
    import javascript from 'svelte-highlight/languages/javascript';
    import json from 'svelte-highlight/languages/json';
    import sql from 'svelte-highlight/languages/sql';
    import text from 'svelte-highlight/languages/plaintext';
    import typescript from 'svelte-highlight/languages/typescript';
    import xml from 'svelte-highlight/languages/xml';

    export let lang = 'text';
    export let code;
</script>

<svelte:head>
    {@html style}
</svelte:head>

{#if lang === 'bash'}
    <Highlight language={bash} {code} />
{:else if lang === 'basic'}
    <Highlight language={basic} {code} />
{:else if lang === 'dos'}
    <Highlight language={dos} {code} />
{:else if lang === 'html'}
    <Highlight language={html} {code} />
{:else if lang === 'java'}
    <Highlight language={java} {code} />
{:else if lang === 'javascript'}
    <Highlight language={javascript} {code} />
{:else if lang === 'json'}
    <Highlight language={json} {code} />
{:else if lang === 'sql'}
    <Highlight language={sql} {code} />
{:else if lang === 'typescript'}
    <Highlight language={typescript} {code} />
{:else if lang === 'xml'}
    <Highlight language={xml} {code} />
{:else}
    <Highlight language={text} {code} />
{/if}
