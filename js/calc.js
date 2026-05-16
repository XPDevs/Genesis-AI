window.calc = function(expression) {
    try {
        let input = expression.replace(/^(?:calc|calculate|solve|math)\s*/i, '').trim();
        if (!input) return null;

        const originalInput = input;

        const factorial = (n) => {
            if (n < 0) return NaN;
            if (n === 0 || n === 1) return 1;
            if (n > 170) return Infinity;
            if (!Number.isInteger(n)) return gamma(n + 1);
            let r = 1;
            for (let i = 2; i <= n; i++) r *= i;
            return r;
        };

        const gamma = (z) => {
            if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
            z -= 1;
            const g = 7;
            const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
            let x = c[0];
            for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
            const t = z + g + 0.5;
            return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
        };

        const nCr = (n, r) => {
            if (r < 0 || r > n) return 0;
            r = Math.min(r, n - r);
            let res = 1;
            for (let i = 1; i <= r; i++) res = res * (n - i + 1) / i;
            return res;
        };

        const nPr = (n, r) => {
            if (r < 0 || r > n) return 0;
            let res = 1;
            for (let i = 0; i < r; i++) res *= (n - i);
            return res;
        };

        let sanitized = input
            .replace(/x/gi, '*')
            .replace(/\u00D7/gi, '*')
            .replace(/\u00F7/gi, '/')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/pi/gi, 'PI')
            .replace(/\be\b(?!x\b|xp\b|ps\b|psilon\b)/gi, 'Math.E')
            .replace(/\^/g, '**')
            .replace(/sqrt\(/gi, 'Math.sqrt(')
            .replace(/cbrt\(/gi, 'Math.cbrt(')
            .replace(/sinh\(/gi, 'Math.sinh(')
            .replace(/cosh\(/gi, 'Math.cosh(')
            .replace(/tanh\(/gi, 'Math.tanh(')
            .replace(/asin\(/gi, 'Math.asin(')
            .replace(/acos\(/gi, 'Math.acos(')
            .replace(/atan\(/gi, 'Math.atan(')
            .replace(/sin\(/gi, 'Math.sin(')
            .replace(/cos\(/gi, 'Math.cos(')
            .replace(/tan\(/gi, 'Math.tan(')
            .replace(/abs\(/gi, 'Math.abs(')
            .replace(/floor\(/gi, 'Math.floor(')
            .replace(/ceil\(/gi, 'Math.ceil(')
            .replace(/round\(/gi, 'Math.round(')
            .replace(/exp\(/gi, 'Math.exp(')
            .replace(/log2\(/gi, 'Math.log2(')
            .replace(/log10\(/gi, 'Math.log10(')
            .replace(/\blog\(/gi, 'Math.log(')
            .replace(/\bln\(/gi, 'Math.log(')
            .replace(/PI/g, 'Math.PI');

        sanitized = sanitized.replace(/(\d+)\s*[Cc]\s*(\d+)/g, 'nCr($1,$2)');
        sanitized = sanitized.replace(/(\d+)\s*[Pp]\s*(\d+)/g, 'nPr($1,$2)');

        sanitized = sanitized.replace(/(\d+)(?=[a-zA-Z_])/g, '$1*');
        sanitized = sanitized.replace(/\)(?=\()/g, ')*');
        sanitized = sanitized.replace(/\)(?=\d)/g, ')*');

        sanitized = sanitized
            .replace(/factorial|fact/g, 'factorial')
            .replace(/(\d+)!/g, 'factorial($1)')
            .replace(/\)!/g, ')');

        sanitized = sanitized.replace(/[^\d\s+\-*/().,% Math\.a-z_A-Z0-9]/gi, '');

        if (!sanitized.trim() || /^[\s+\-*/%.]*$/.test(sanitized)) return null;

        const available = { Math, PI: Math.PI, E: Math.E, factorial, nCr, nPr, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, floor: Math.floor, ceil: Math.ceil, round: Math.round, exp: Math.exp, log: Math.log, log2: Math.log2, log10: Math.log10, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh };

        const result = new Function(...Object.keys(available), `"use strict"; return (${sanitized})`)(...Object.values(available));

        if (!isFinite(result) || isNaN(result)) return null;

        const formattedResult = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString();

        const katexInput = originalInput
            .replace(/\*/g, '\\times ')
            .replace(/\*\*/g, '^')
            .replace(/Math\./g, '')
            .replace(/PI/g, '\\pi')
            .replace(/\bE\b/g, 'e')
            .replace(/sqrt/g, '\\sqrt')
            .replace(/abs/g, '\\left|')
            .replace(/\b(sin|cos|tan|log|ln)\b/g, '\\$1');

        const katex = `${katexInput} = ${formattedResult}`;

        return {
            value: Number(formattedResult),
            formatted: formattedResult,
            katex
        };
    } catch (e) {
        return null;
    }
};
