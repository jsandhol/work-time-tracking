import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import basic from 'highlight.js/lib/languages/basic';
import dos from 'highlight.js/lib/languages/dos';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import vbscriptHtml from 'highlight.js/lib/languages/vbscript-html';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('basic', basic);
hljs.registerLanguage('dos', dos);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', vbscriptHtml);
hljs.registerLanguage('text', plaintext);

export function highlightCode(code, lang) {
    const source = String(code ?? '');
    const requested = typeof lang === 'string' ? lang.trim().toLowerCase() : 'text';
    const language = hljs.getLanguage(requested) ? requested : 'plaintext';
    return hljs.highlight(source, { language }).value;
}
