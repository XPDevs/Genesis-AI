(function() {
    'use strict';

    const textDecoder = new TextDecoder('utf-8', { fatal: false });

    function decode(input) {
        if (typeof input !== 'string') return '';

        let result = '';
        let i = 0;
        const len = input.length;

        while (i < len) {
            if (input[i] === '\\' && i + 1 < len) {
                const next = input[i + 1];

                if (next === 'x' && i + 3 < len && /[0-9a-fA-F]{2}/.test(input.substr(i + 2, 2))) {
                    const bytes = [];
                    while (i + 3 < len && input[i] === '\\' && input[i + 1] === 'x' &&
                           /[0-9a-fA-F]{2}/.test(input.substr(i + 2, 2))) {
                        const hex = input.substr(i + 2, 2);
                        bytes.push(parseInt(hex, 16));
                        i += 4;
                    }
                    result += textDecoder.decode(new Uint8Array(bytes));
                    continue;
                }

                if (next === 'u' && i + 5 < len && /[0-9a-fA-F]{4}/.test(input.substr(i + 2, 4))) {
                    const hex = input.substr(i + 2, 4);
                    const codePoint = parseInt(hex, 16);
                    result += String.fromCodePoint(codePoint);
                    i += 6;
                    continue;
                }

                if (next === 'u' && i + 3 < len && input[i + 2] === '{') {
                    let end = i + 3;
                    while (end < len && input[end] !== '}') end++;
                    if (end < len) {
                        const hex = input.substring(i + 3, end);
                        if (/^[0-9a-fA-F]+$/.test(hex)) {
                            const codePoint = parseInt(hex, 16);
                            result += String.fromCodePoint(codePoint);
                            i = end + 1;
                            continue;
                        }
                    }
                }

                result += input[i];
                i++;
            } else {
                result += input[i];
                i++;
            }
        }
        return result;
    }

    function tokenizeLikeLLM(text) {
        const tokens = [];
        let i = 0;

        function splitCamelCase(word) {
            const parts = [];
            let j = 0;
            while (j < word.length) {
                if (/[a-z]/.test(word[j])) {
                    let k = j + 1;
                    while (k < word.length && /[a-z]/.test(word[k])) k++;
                    parts.push(word.slice(j, k));
                    j = k;
                } else if (/[A-Z]/.test(word[j])) {
                    let k = j + 1;
                    if (k < word.length && /[a-z]/.test(word[k])) {
                        while (k < word.length && /[a-z]/.test(word[k])) k++;
                        parts.push(word.slice(j, k));
                        j = k;
                    } else {
                        while (k < word.length && /[A-Z]/.test(word[k])) k++;
                        const cluster = word.slice(j, k);
                        if (k < word.length && /[a-z]/.test(word[k])) {
                            for (let l = 0; l < cluster.length; l++) parts.push(cluster[l]);
                        } else if (cluster.length === 1) {
                            parts.push(cluster);
                        } else {
                            parts.push(cluster[0]);
                            parts.push(cluster.slice(1));
                        }
                        j = k;
                    }
                } else {
                    j++;
                }
            }
            return parts;
        }

        let leadingSpaces = '';
        while (i < text.length) {
            const ch = text[i];
            if (ch === ' ') {
                let spaces = '';
                while (i < text.length && text[i] === ' ') spaces += text[i++];
                leadingSpaces += spaces;
                continue;
            }
            if (/[^\w\s]/.test(ch)) {
                tokens.push(leadingSpaces + ch);
                leadingSpaces = '';
                i++;
                continue;
            }
            if (/\d/.test(ch)) {
                let num = '';
                while (i < text.length && /\d/.test(text[i])) num += text[i++];
                tokens.push(leadingSpaces + num);
                leadingSpaces = '';
                continue;
            }
            if (/[a-zA-Z]/.test(ch)) {
                let word = '';
                while (i < text.length && /[a-zA-Z]/.test(text[i])) word += text[i++];
                const parts = splitCamelCase(word);
                parts[0] = leadingSpaces + parts[0];
                tokens.push(...parts);
                leadingSpaces = '';
                continue;
            }
            i++;
        }
        if (leadingSpaces) tokens.push(leadingSpaces);
        return tokens;
    }

    function getTokenDelay(token, baseSpeed) {
        let delay = baseSpeed + (Math.random() - 0.5) * 8;
        if (Math.random() < 0.01) delay += 200 + Math.random() * 300;
        if (delay < 15) delay = 15;
        if (delay > 150 && delay < 200) delay = 150;
        if (delay > 450) delay = 450;
        return delay;
    }

    function typewriter(element, text, speed = 60, onDone, onToken) {
        const tokens = tokenizeLikeLLM(text);
        let index = 0;
        let timeoutId = null;
        let stopped = false;
        element.textContent = '';
        function tick() {
            if (stopped) return;
            if (index < tokens.length) {
                const rand = Math.random();
                let burstSize = 1;
                if (rand < 0.05) burstSize = 3;
                else if (rand < 0.30) burstSize = 2;
                burstSize = Math.min(burstSize, tokens.length - index);
                const chunk = tokens.slice(index, index + burstSize).join('');
                element.textContent += chunk;
                if (onToken) onToken();
                const delay = getTokenDelay(tokens[index], speed);
                index += burstSize;
                timeoutId = setTimeout(tick, delay);
            } else if (onDone) {
                onDone();
            }
        }
        tick();
        return function cancel() {
            stopped = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
    }

    window.tokenizer = { decode, tokenizeLikeLLM, typewriter };
    console.log("Tokenizer Module Loaded");
})();
