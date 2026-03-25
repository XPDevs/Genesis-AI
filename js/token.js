/**
 * Genesis-AI: Tokenizer Module (Enhanced)
 * - Converts \uXXXX sequences (like "\u2014") into real Unicode characters
 * - Then encodes them as UTF‑8 hex
 */

(function() {
    'use strict';

    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder('utf-8', { fatal: false });

    /**
     * Converts \uXXXX sequences into real characters.
     * Example: "\u2014" → "—"
     */
    function unescapeUnicode(str) {
        if (typeof str !== 'string') return str;

        return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
            return String.fromCharCode(parseInt(grp, 16));
        });
    }

    /**
     * Encodes a string into UTF‑8 hex bytes.
     * Automatically normalises \uXXXX → characters first.
     */
    function encode(text) {
        if (typeof text !== 'string') return '';

        // ✅ Convert any hard‑coded \uXXXX into real characters
        const normalized = unescapeUnicode(text);

        // Convert to UTF‑8 bytes
        const bytes = textEncoder.encode(normalized);

        return Array.from(bytes)
            .map(byte => '\\x' + byte.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Decodes UTF‑8 hex back into a string.
     */
    function decode(encodedText) {
        if (typeof encodedText !== 'string' || !encodedText.startsWith('\\x')) {
            return encodedText;
        }

        const hexes = encodedText.split('\\x').slice(1);
        const bytes = new Uint8Array(hexes.length);

        for (let i = 0; i < hexes.length; i++) {
            bytes[i] = parseInt(hexes[i], 16);
        }

        return textDecoder.decode(bytes);
    }

    window.tokenizer = { encode, decode };
    console.log("Tokenizer Module Loaded (UTF‑8 + Unicode unescape enabled)");
})();
