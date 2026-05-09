/**
 * Genesis-AI: Tokenizer Module (Decode‑Only)
 * 
 * Decodes standard hex escape sequences in a string:
 *   - \xHH  → UTF‑8 byte (multiple consecutive bytes form a character)
 *   - \uXXXX → Unicode code point (supports BMP)
 *   - \u{H...} → Any Unicode code point (supports astral planes)
 * 
 * All other text is preserved as‑is.
 */

(function() {
    'use strict';

    const textDecoder = new TextDecoder('utf-8', { fatal: false });

    /**
     * Decodes a string by replacing all \xHH, \uXXXX, and \u{H...} escapes
     * with their actual characters. Non‑escape text stays the same.
     * 
     * @param {string} input The input string (may contain hex escapes).
     * @returns {string} The decoded string.
     */
    function decode(input) {
        if (typeof input !== 'string') return '';

        let result = '';
        let i = 0;
        const len = input.length;

        while (i < len) {
            if (input[i] === '\\' && i + 1 < len) {
                const next = input[i + 1];

                // ---- \xHH (UTF-8 byte) ----
                if (next === 'x' && i + 3 < len && /[0-9a-fA-F]{2}/.test(input.substr(i + 2, 2))) {
                    const bytes = [];
                    // Collect consecutive \xHH sequences
                    while (i + 3 < len && input[i] === '\\' && input[i + 1] === 'x' &&
                           /[0-9a-fA-F]{2}/.test(input.substr(i + 2, 2))) {
                        const hex = input.substr(i + 2, 2);
                        bytes.push(parseInt(hex, 16));
                        i += 4;
                    }
                    result += textDecoder.decode(new Uint8Array(bytes));
                    continue;
                }

                // ---- \uXXXX (BMP Unicode) ----
                if (next === 'u' && i + 5 < len && /[0-9a-fA-F]{4}/.test(input.substr(i + 2, 4))) {
                    const hex = input.substr(i + 2, 4);
                    const codePoint = parseInt(hex, 16);
                    result += String.fromCodePoint(codePoint);
                    i += 6;
                    continue;
                }

                // ---- \u{H...} (any Unicode, ES6) ----
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

                // Not a recognized escape – treat as literal backslash
                result += input[i];
                i++;
            } else {
                result += input[i];
                i++;
            }
        }
        return result;
    }

    // Expose only the decode function
    window.tokenizer = { decode };
    console.log("Tokenizer Module Loaded (decodes \\xHH, \\uXXXX, \\u{H...})");
})();
