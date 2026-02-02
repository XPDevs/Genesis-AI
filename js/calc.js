window.calc = function(expression) {
    try {
        if (typeof expression !== 'string') return "Invalid input";
        let sanitized = expression;

        // --- Normalize unicode punctuation/spaces ---
        sanitized = sanitized
            .replace(/\u2212/g, '-')       // minus sign (−) -> hyphen-minus
            .replace(/[–—]/g, '-')         // en/em dashes -> hyphen-minus
            .replace(/\s+/g, ' ')          // collapse whitespace
            .trim();

        // --- Normalize common math symbols ---
        sanitized = sanitized
            .replace(/[×xX]/g, '*')        // × or x/X -> *
            .replace(/÷/g, '/')            // ÷ -> /

        // --- Word-based operators (case-insensitive) ---
        // Use word boundaries to avoid changing variable-like tokens (though we later sanitize non-numerics anyway)
        sanitized = sanitized
            .replace(/\b(plus|add|added to)\b/gi, '+')
            .replace(/\b(minus|subtract|subtracted by|less)\b/gi, '-')
            .replace(/\b(times|multiply|multiplied by)\b/gi, '*')
            .replace(/\b(divide|divided by|over)\b/gi, '/')
            // exponent phrases -> **
            .replace(/\b(to the power of|power of)\b/gi, '**');

        // --- Caret to JavaScript exponent ---
        sanitized = sanitized.replace(/\^/g, '**');

        // Remove any characters that are not numbers, decimal points, math operators, parentheses, or spaces
        // Allowed: digits, ., + - * / ( ) ** spaces
        sanitized = sanitized.replace(/[^0-9+\-*/().\s*]/g, '');

        if (!sanitized.trim()) return "Invalid input";

        // Simple safety check: disallow consecutive disallowed operator sequences (other than valid **)
        // e.g., prevent things like "*/", "//", etc.
        const invalidOpSeq = /([+\-*/])\s*\1(?!\*)/;
        if (invalidOpSeq.test(sanitized)) return "Error";

        // Extra: normalize multiple * to ** when appropriate has already been handled; keep as-is otherwise
        // Evaluate
        const result = new Function('return ' + sanitized)();

        if (!isFinite(result) || isNaN(result)) return "Error";
        return result;
    } catch (e) {
        return "Error";
    }
};
