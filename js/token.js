/**
 * Genesis-AI: Tokenizer Module
 * Encodes and decodes text to/from a UTF-8 hex representation.
 */

(function() {
    'use strict';

    /**
     * Encodes a string into a UTF-8 hex representation (e.g., "A" -> "\\x41").
     * @param {string} text The input string.
     * @returns {string} The encoded string.
     */
    function encode(text) {
        if (typeof text !== 'string') return '';
        return Array.from(text).map(char => '\\x' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join('');
    }

    /**
     * Decodes a UTF-8 hex representation back into a string.
     * @param {string} encodedText The encoded string (e.g., "\\x41\\x42").
     * @returns {string} The decoded string.
     */
    function decode(encodedText) {
        if (typeof encodedText !== 'string' || !encodedText.startsWith('\\x')) {
            return encodedText; // Return as is if not in the expected format.
        }
        return encodedText.split('\\x').slice(1).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
    }

    window.tokenizer = { encode, decode };
    console.log("Tokenizer Module Loaded");
})();