/**
 * Genesis-AI: Tokenizer Module
 * Encodes and decodes text to/from a UTF-8 hex representation.
 * Supports all Unicode characters, including those outside the BMP
 * (e.g., emojis, rare symbols) by encoding them as their UTF-8 byte sequences.
 */

(function() {
    'use strict';

    // Use built‑in TextEncoder/TextDecoder for robust UTF‑8 handling.
    // They are available in all modern browsers and Node.js.
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder('utf-8', { fatal: false });

    /**
     * Encodes a string into a sequence of UTF-8 hex bytes.
     * Each byte is represented as "\xHH", where HH is a two‑digit hex number.
     * Example: "A" → "\x41", "€" → "\xE2\x82\xAC"
     * Also handles Unicode escape sequences like \u2014, \u2019, etc.
     * @param {string} text The input string.
     * @returns {string} The encoded string consisting only of "\xHH" sequences.
     */
    function encode(text) {
        if (typeof text !== 'string') return '';
        try {
            text = JSON.parse('"' + text + '"');
        } catch (e) {}
        const bytes = textEncoder.encode(text);
        return Array.from(bytes).map(byte => '\\x' + byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Decodes a UTF-8 hex representation back into a string.
     * The input must consist entirely of "\xHH" sequences (no extra characters).
     * If the input does not start with "\x", it is returned unchanged.
     * @param {string} encodedText The encoded string (e.g., "\x41\x42").
     * @returns {string} The decoded string.
     */
    function decode(encodedText) {
        if (typeof encodedText !== 'string' || !encodedText.startsWith('\\x')) {
            return encodedText; // Return as is if not in the expected format.
        }
        // Split by "\x", discard the first empty element, parse hex → bytes
        const hexes = encodedText.split('\\x').slice(1);
        const bytes = new Uint8Array(hexes.length);
        for (let i = 0; i < hexes.length; i++) {
            // Parse each two‑digit hex number as a byte (0‑255)
            bytes[i] = parseInt(hexes[i], 16);
        }
        // Decode the byte array as UTF-8
        return textDecoder.decode(bytes);
    }

    // Expose the tokenizer to the global window object
    window.tokenizer = { encode, decode };
    console.log("Tokenizer Module Loaded (UTF‑8 enabled)");
})();
