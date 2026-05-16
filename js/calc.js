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

// ---- LaTeX solver (integrals, sums, limits) ----
(function () {
"use strict";

function simpson(fn, a, b) {
    if (a === -Infinity) a = -100;
    if (b === Infinity) b = 100;
    var n = 2000, h = (b - a) / n, sum = 0;
    for (var i = 0; i <= n; i++) {
        var x = a + i * h, y;
        try { y = fn(x); } catch (e) { y = 0; }
        if (!isFinite(y)) y = 0;
        sum += y * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2);
    }
    return (h / 3) * sum;
}

function doSum(from, to, fn) {
    var total = 0, f = Math.round(from), t = Math.round(to);
    if (f > t) { var tmp = f; f = t; t = tmp; }
    for (var i = f; i <= t; i++) { try { total += fn(i); } catch (e) {} }
    return total;
}

function doLimit(approach, fn) {
    if (!isFinite(approach)) {
        var dir = approach > 0 ? 1 : -1, prev = 0;
        var vals = [10, 100, 1000, 5000, 10000, 50000, 100000];
        for (var i = 0; i < vals.length; i++) {
            try { var r = fn(dir * vals[i]); } catch (e) { r = prev; }
            if (i > 0 && Math.abs(r - prev) < 1e-10) return r;
            prev = r;
        }
        return prev;
    }
    var prev = 0, h = 0.1;
    for (var i = 1; i <= 12; i++) {
        try { var r = fn(approach + h); } catch (e) { r = prev; }
        if (i > 1 && Math.abs(r - prev) < 1e-10) return r;
        prev = r;
        h /= 10;
    }
    return prev;
}

function parseNum(s) {
    s = s.replace(/[\{\}\(\)\\]/g, '').trim();
    if (s === 'infty' || s === 'infinity') return Infinity;
    var js = s.replace(/\bM\.PI\b/g, 'Math.PI').replace(/\bpi\b/g, 'Math.PI');
    try { var val = new Function('return (' + js + ')')(); if (isFinite(val)) return val; } catch (e) {}
    return 0;
}

function preprocess(tex) {
    var s = tex;
    s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    s = s.replace(/\\sqrt(?:\[([^}]+)\])?\{([^}]+)\}/g, function (_, n, a) { return n ? 'Math.pow(' + a + ',1/' + n + ')' : 'Math.sqrt(' + a + ')'; });
    s = s.replace(/\\sin\b/g, 'M.sin');
    s = s.replace(/\\cos\b/g, 'M.cos');
    s = s.replace(/\\tan\b/g, 'M.tan');
    s = s.replace(/\\cot\b/g, '(1/M.tan)');
    s = s.replace(/\\sec\b/g, '(1/M.cos)');
    s = s.replace(/\\csc\b/g, '(1/M.sin)');
    s = s.replace(/\\arcsin\b/g, 'M.asin');
    s = s.replace(/\\arccos\b/g, 'M.acos');
    s = s.replace(/\\arctan\b/g, 'M.atan');
    s = s.replace(/\\sinh\b/g, 'M.sinh');
    s = s.replace(/\\cosh\b/g, 'M.cosh');
    s = s.replace(/\\tanh\b/g, 'M.tanh');
    s = s.replace(/\\ln\b/g, 'M.log');
    s = s.replace(/\\log\b/g, 'M.log');
    s = s.replace(/\\exp\b/g, 'M.exp');
    s = s.replace(/\\pi\b/g, 'M.PI');
    s = s.replace(/\\e\b/g, 'M.E');
    s = s.replace(/\\pmod\{([^}]+)\}/g, '%$1');
    s = s.replace(/\\mod\s+(\d+)/g, '%$1');
    s = s.replace(/\\displaystyle\s*/g, '');
    s = s.replace(/\\limits\s*/g, '');
    s = s.replace(/\\left\s*/g, '');
    s = s.replace(/\\right\s*/g, '');
    s = s.replace(/\\cdot\s*/g, '*');
    s = s.replace(/\\times\s*/g, '*');
    s = s.replace(/\\[,;:!]/g, '');
    s = s.replace(/\\qquad\s*/g, '');
    s = s.replace(/\\quad\s*/g, '');
    s = s.replace(/\\;/g, '');
    return s;
}

function evalJS(js, varMap) {
    js = js.replace(/\^/g, '**');
    js = js.replace(/(\d|\))\s*\(/g, '$1*(');
    js = js.replace(/(\d)([a-zA-Z])/g, '$1*$2');
    for (var v in varMap) {
        if (varMap.hasOwnProperty(v)) {
            var re = new RegExp('\\b' + v + '\\b', 'g');
            js = js.replace(re, '(' + varMap[v] + ')');
        }
    }
    js = js.replace(/\bpi\b/g, 'M.PI');
    js = js.replace(/\be\b(?!\s*\w)/g, 'M.E');
    try {
        return new Function('M', '"use strict";return (' + js + ')')(Math);
    } catch (e) {
        return NaN;
    }
}

function evaluateNode(str) {
    var changed = true;
    while (changed) {
        changed = false;
        var intMatch = str.match(/\\int_\{([^}]*)\}\^\{([^}]*)\}/);
        if (intMatch) {
            var a = parseNum(intMatch[1]), b = parseNum(intMatch[2]);
            var pos = intMatch.index + intMatch[0].length;
            var rest = str.substring(pos);
            var dxMatch = rest.match(/(?:\\,\s*|\\\s+)?\\?d\s*[a-zA-Z]/);
            if (dxMatch) {
                var bodyRaw = rest.substring(0, dxMatch.index);
                var bodyJS = preprocess(bodyRaw);
                var fn = function (x) { return evalJS(bodyJS, { x: x }); };
                var result = simpson(fn, a, b);
                var fullLen = intMatch[0].length + dxMatch.index + dxMatch[0].length;
                str = str.substring(0, intMatch.index) + '(' + result + ')' + str.substring(intMatch.index + fullLen);
                changed = true;
            }
        }
    }

    changed = true;
    while (changed) {
        changed = false;
        var sumMatch = str.match(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/);
        if (sumMatch) {
            var idxPart = sumMatch[1], toPart = sumMatch[2];
            var idxM = idxPart.match(/^(\w+)=(.+)/);
            if (!idxM) break;
            var idxVar = idxM[1], fromStr = idxM[2], toStr = toPart;
            if (/[a-z]/i.test(toStr) && toStr.indexOf('M.') === -1) { changed = false; break; }
            var fromVal = parseNum(fromStr), toVal = parseNum(toStr);
            var pos = sumMatch.index + sumMatch[0].length;
            var depth = 0, bodyEnd = pos;
            for (var j = pos; j < str.length; j++) {
                var ch = str[j];
                if (ch === '(') depth++;
                else if (ch === ')') { depth--; if (depth < 0) { bodyEnd = j; break; } }
                if (bodyEnd !== pos) break;
                if ((ch === '+' || ch === '-') && depth === 0 && str[j - 1] === ' ') { bodyEnd = j; break; }
            }
            if (bodyEnd <= pos) bodyEnd = str.length;
            var bodyRaw = str.substring(pos, bodyEnd).trim();
            var bodyJS = preprocess(bodyRaw);
            var fn = function (k) {
                var vm = {};
                vm[idxVar] = k;
                return evalJS(bodyJS, vm);
            };
            var result = doSum(fromVal, toVal, fn);
            str = str.substring(0, sumMatch.index) + '(' + result + ')' + str.substring(bodyEnd);
            changed = true;
        }
    }

    changed = true;
    while (changed) {
        changed = false;
        var limMatch = str.match(/\\lim_\{([^}]*)\}/);
        if (limMatch) {
            var limSpec = limMatch[1];
            var parts = limSpec.split(/\\to/);
            if (parts.length < 2) break;
            var limVar = parts[0].trim(), approachVal = parseNum(parts[1].trim());
            var pos = limMatch.index + limMatch[0].length;
            var depth = 0, bodyEnd = pos;
            for (var j = pos; j < str.length; j++) {
                var ch = str[j];
                if (ch === '(') depth++;
                else if (ch === ')') { depth--; if (depth < 0) { bodyEnd = j; break; } }
                if (bodyEnd !== pos) break;
                if ((ch === '+' || ch === '-') && depth === 0 && str[j - 1] === ' ') { bodyEnd = j; break; }
            }
            if (bodyEnd <= pos) bodyEnd = str.length;
            var bodyRaw = str.substring(pos, bodyEnd).trim();
            var fn = function (v) {
                var subbed = bodyRaw.replace(new RegExp('\\b' + limVar + '\\b', 'g'), '(' + v + ')');
                var evaled = evaluateNode(subbed);
                try { return new Function('M', '"use strict";return (' + evaled + ')')(Math); } catch(e) { return 0; }
            };
            var result = doLimit(approachVal, fn);
            str = str.substring(0, limMatch.index) + '(' + result + ')' + str.substring(bodyEnd);
            changed = true;
        }
    }

    str = str.replace(/\b([a-gi-su-z]|[A-Z])\s*\((\d+(?:\.\d+)?)\)/g, '$2');
    return str;
}

window.solveLatex = function (raw) {
    try {
        var s = raw.replace(/^\$\$|\$\$$/g, '').trim();
        s = s.replace(/^[A-Za-z]\s*=\s*/, '');
        s = preprocess(s);
        s = evaluateNode(s);
        s = s.replace(/\\[a-zA-Z]+\s*/g, '');
        s = s.replace(/[{}]/g, '');
        s = s.replace(/\^/g, '**');
        s = s.replace(/\bpi\b/g, 'M.PI');
        s = s.replace(/\be\b(?!\s*\()/g, 'M.E');
        s = s.replace(/\s+/g, ' ');
        var result = new Function('M', '"use strict";return (' + s + ')')(Math);
        if (!isFinite(result)) return { error: 'Result is not finite (may diverge).' };
        var formatted = Number.isInteger(result) ? String(result) : parseFloat(result.toFixed(12)).toString();
        var katexStr = Number.isInteger(result) ? String(result) : '\\approx ' + result.toFixed(6);
        return { value: result, formatted: formatted, katex: katexStr };
    } catch (e) {
        return { error: 'Could not evaluate: ' + e.message };
    }
};

window.solve = async function (input) {
    var lm = input.match(/\$\$([\s\S]*?)\$\$/);
    if (lm) return window.solveLatex(lm[1]);
    if (typeof window.calc === 'function') return window.calc(input);
    return null;
};

})();
