window.calc = function(expression) {
    try {
        // Replace 'x' with '*' for multiplication
        let sanitized = expression.replace(/x/g, '*');
        // Remove any characters that are not numbers or math operators
        sanitized = sanitized.replace(/[^0-9+\-*/().\s^]/g, '');
        
        if (!sanitized.trim()) return "Invalid input";

        // Replace '^' with '**' for exponentiation
        sanitized = sanitized.replace(/\^/g, '**');

        // Safe evaluation
        const result = new Function('return ' + sanitized)();
        
        if (!isFinite(result) || isNaN(result)) return "Error";
        return result;
    } catch (e) {
        return "Error";
    }
};
