/* ============================================================
 * XPDevs JS→PY Engine  (js/js2py.js)  v2.0
 * A real, in-browser JavaScript-to-Python transpiler.
 *
 *   tokenize()  → token stream (strings, template literals, regexes, comments)
 *   Transpiler  → brace-based statement parser that re-indents to Python
 *   Expr        → context-aware expression converter + runtime shim emitter
 *
 * Handles: var/let/const, function declarations & expressions, arrow
 * functions, if / else-if / else, for(;;), for-of, for-in, while,
 * do-while, switch, try/catch/finally, throw, classes (constructor,
 * methods, static, extends, super), ternaries, ++/--, compound
 * assignment, spread/rest, destructuring, template literals → f-strings,
 * console.log, Math.*, JSON.*, Date, typeof, instanceof, regex literals,
 * and dozens of array/string/object methods via auto-emitted helpers.
 *
 * Public API:
 *   const { code, warnings } = JS2PY.transpile(source);
 * ============================================================ */
(function (global) {
  'use strict';

  /* ========================== Tokenizer =========================== */
  const PUNCT = ['>>>=', '...', '===', '!==', '**=', '>>=', '<<=', '&&=', '||=', '??=',
    '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '++', '--', '+=', '-=', '*=', '/=', '%=',
    '**', '<<', '>>', '{', '}', '(', ')', '[', ']', ';', ',', '.', '<', '>', '+', '-', '*',
    '/', '%', '&', '|', '^', '!', '?', ':', '='];

  function isIdentStart(c) { return c !== undefined && /[A-Za-z_$\u00C0-\uFFFF]/.test(c); }
  function isIdentPart(c) { return c !== undefined && /[A-Za-z0-9_$\u00C0-\uFFFF]/.test(c); }

  function tokenize(src) {
    const toks = [];
    let i = 0;
    const n = src.length;

    function prevMeaningful() {
      for (let j = toks.length - 1; j >= 0; j--) if (toks[j].t !== 'comment') return toks[j];
      return null;
    }
    function canBeRegex() {
      const p = prevMeaningful();
      if (!p) return true;
      if (p.t === 'name') return ['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'case', 'do', 'else'].includes(p.v);
      if (p.t === 'num' || p.t === 'str' || p.t === 'regex' || p.t === 'template') return false;
      if (p.t === 'punct') return ![')', ']', '}'].includes(p.v);
      return true;
    }

    while (i < n) {
      const c = src[i];
      if (c === '\n') { toks.push({ t: 'nl' }); i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') {
        let j = i; while (j < n && src[j] !== '\n') j++;
        toks.push({ t: 'comment', v: src.slice(i, j) }); i = j; continue;
      }
      if (c === '/' && src[i + 1] === '*') {
        let j = src.indexOf('*/', i + 2); j = j === -1 ? n : j + 2;
        toks.push({ t: 'comment', v: src.slice(i, j).replace(/\n\s*\*{0,}\s*/g, ' ') }); i = j; continue;
      }
      if (c === '"' || c === "'") {
        let j = i + 1, s = '';
        while (j < n && src[j] !== c && src[j] !== '\n') {
          if (src[j] === '\\') { s += src[j] + (src[j + 1] || ''); j += 2; } else { s += src[j]; j++; }
        }
        toks.push({ t: 'str', v: s, quote: c }); i = j + 1; continue;
      }
      if (c === '`') {
        let j = i + 1, parts = [{ type: 'text', v: '' }];
        while (j < n && src[j] !== '`') {
          if (src[j] === '\\') { parts[parts.length - 1].v += src[j] + (src[j + 1] || ''); j += 2; continue; }
          if (src[j] === '$' && src[j + 1] === '{') {
            let depth = 1, k = j + 2, expr = '';
            while (k < n && depth > 0) {
              if (src[k] === '{') depth++;
              else if (src[k] === '}') { depth--; if (!depth) break; }
              expr += src[k]; k++;
            }
            parts.push({ type: 'expr', v: expr }); j = k + 1; parts.push({ type: 'text', v: '' });
          } else { parts[parts.length - 1].v += src[j]; j++; }
        }
        toks.push({ t: 'template', parts }); i = j + 1; continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i;
        if (/^0[xX]/.test(src.slice(i, i + 2))) { j = i + 2; while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++; }
        else if (/^0[bB]/.test(src.slice(i, i + 2))) { j = i + 2; while (j < n && /[01_]/.test(src[j])) j++; }
        else if (/^0[oO]/.test(src.slice(i, i + 2))) { j = i + 2; while (j < n && /[0-7_]/.test(src[j])) j++; }
        else while (j < n && /[0-9._eE]/.test(src[j])) {
          if ((src[j] === 'e' || src[j] === 'E')) {
            if (/[+-]/.test(src[j + 1] || '') && /[0-9]/.test(src[j + 2] || '')) { j += 3; continue; }
            if (!/[0-9]/.test(src[j + 1] || '')) break;
          }
          j++;
        }
        toks.push({ t: 'num', v: src.slice(i, j) }); i = j; continue;
      }
      if (isIdentStart(c)) {
        let j = i; while (j < n && isIdentPart(src[j])) j++;
        toks.push({ t: 'name', v: src.slice(i, j) }); i = j; continue;
      }
      if (c === '/' && canBeRegex()) {
        let j = i + 1, ok = false, inClass = false;
        while (j < n) {
          const d = src[j];
          if (d === '\\') { j += 2; continue; }
          if (d === '[') inClass = true;
          else if (d === ']') inClass = false;
          else if (d === '/' && !inClass) { ok = true; break; }
          else if (d === '\n') break;
          j++;
        }
        if (ok) {
          let k = j + 1; while (k < n && /[dgimsuy]/.test(src[k])) k++;
          toks.push({ t: 'regex', v: src.slice(i + 1, j), flags: src.slice(j + 1, k) }); i = k; continue;
        }
      }
      let matched = null;
      for (const p of PUNCT) if (src.startsWith(p, i)) { matched = p; break; }
      if (matched) { toks.push({ t: 'punct', v: matched }); i += matched.length; continue; }
      toks.push({ t: 'punct', v: c }); i++;
    }
    return toks;
  }

  /* ======================= token utilities ======================== */
  const OPEN = { '(': ')', '[': ']', '{': '}' };

  function balancedFrom(toks, startIdx) {
    // returns tokens [startIdx .. end], with inner content between the opener at startIdx
    const open = toks[startIdx].v, close = OPEN[open];
    let depth = 0;
    for (let i = startIdx; i < toks.length; i++) {
      const t = toks[i];
      if (t.t === 'punct' && t.v === open) depth++;
      else if (t.t === 'punct' && t.v === close) {
        depth--;
        if (depth === 0) return { inner: toks.slice(startIdx + 1, i), end: i, count: i - startIdx + 1 };
      }
    }
    return { inner: toks.slice(startIdx + 1), end: toks.length - 1, count: toks.length - startIdx };
  }

  function splitTop(toks, sep) {
    const parts = []; let cur = [], d = 0;
    for (const t of toks) {
      if (t.t === 'punct') {
        if (OPEN[t.v]) d++;
        else if (')]}'.includes(t.v)) d--;
        else if (t.v === sep && d === 0) { parts.push(cur); cur = []; continue; }
      }
      cur.push(t);
    }
    parts.push(cur);
    return parts.filter(p => p.some(x => x.t !== 'nl'));
  }

  function findTop(toks, pred, from) {
    let d = 0;
    for (let i = from || 0; i < toks.length; i++) {
      const t = toks[i];
      if (t.t === 'punct') { if (OPEN[t.v]) d++; else if (')]}'.includes(t.v)) d--; }
      if (d === 0 && pred(t, i)) return i;
    }
    return -1;
  }

  function stripNL(toks) { return toks.filter(t => t.t !== 'nl'); }
  function meaningful(toks) { return toks.filter(t => t.t !== 'nl' && t.t !== 'comment'); }
  function lastMeaningful(arr) { for (let j = arr.length - 1; j >= 0; j--) if (arr[j].t !== 'nl') return arr[j]; return null; }

  /* ===================== Runtime helper library ==================== */
  const RUNTIME = {
    _type_of: `def _type_of(value):
    """JavaScript \`typeof\` emulation."""
    if value is None:
        return "undefined"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, (int, float)):
        return "number"
    if isinstance(value, str):
        return "string"
    if callable(value):
        return "function"
    return "object"`,

    _is_nan: `def _is_nan(value):
    """JavaScript isNaN() emulation."""
    try:
        return float(value) != float(value)
    except (TypeError, ValueError):
        return True`,

    _includes: `def _includes(collection, item, from_index=0):
    """JS Array/String .includes()"""
    try:
        return item in collection[from_index:]
    except TypeError:
        return False`,

    _index_of: `def _index_of(collection, item, from_index=0):
    """JS .indexOf(): returns -1 when the item is absent."""
    try:
        idx = collection.index(item)
        return idx if idx >= from_index else -1
    except (ValueError, TypeError):
        return -1`,

    _replace_first: `def _replace_first(text, old, new):
    """JS String.replace(str, ...) replaces only the first occurrence."""
    if isinstance(old, str):
        return text.replace(old, new, 1)
    return old.sub(new, text, count=1)`,

    _for_each: `def _for_each(arr, fn):
    """JS Array.forEach()"""
    for _i, _v in enumerate(arr):
        fn(_v, _i, arr)`,

    _map: `def _map(arr, fn):
    """JS Array.map()"""
    return [fn(v, i, arr) for i, v in enumerate(arr)]`,

    _filter: `def _filter(arr, fn):
    """JS Array.filter()"""
    return [v for i, v in enumerate(arr) if fn(v, i, arr)]`,

    _reduce: `def _reduce(arr, fn, initial=None):
    """JS Array.reduce()"""
    if initial is None:
        acc, start = arr[0], 1
    else:
        acc, start = initial, 0
    for i in range(start, len(arr)):
        acc = fn(acc, arr[i], i, arr)
    return acc`,

    _find: `def _find(arr, fn):
    """JS Array.find()"""
    for i, v in enumerate(arr):
        if fn(v, i, arr):
            return v
    return None`,

    _find_index: `def _find_index(arr, fn):
    """JS Array.findIndex()"""
    for i, v in enumerate(arr):
        if fn(v, i, arr):
            return i
    return -1`,

    _some: `def _some(arr, fn):
    """JS Array.some()"""
    return any(fn(v, i, arr) for i, v in enumerate(arr))`,

    _every: `def _every(arr, fn):
    """JS Array.every()"""
    return all(fn(v, i, arr) for i, v in enumerate(arr))`,

    slice_: `def slice_(seq, start=None, end=None):
    """JS .slice() for lists and strings."""
    return seq[start:end]`,

    sort_: `def sort_(arr, key=None):
    """JS Array.sort(): numeric-aware when no comparator is given."""
    if key is None:
        result = sorted(arr, key=lambda x: (0, x) if isinstance(x, (int, float)) else (1, str(x)))
    else:
        result = sorted(arr, key=key)
    if isinstance(arr, list):
        arr[:] = result
    return result`,

    splice_: `def splice_(arr, start, delete_count=None, *items):
    """JS Array.splice(): mutates the list, returns removed items."""
    if delete_count is None:
        delete_count = len(arr) - start
    removed = arr[start:start + delete_count]
    arr[start:start + delete_count] = list(items)
    return removed`,

    charAt_: `def charAt_(text, index):
    """JS String.charAt() with out-of-range safety."""
    if -len(text) <= index < len(text):
        return text[index]
    return ""`,

    pad_start: `def pad_start(text, target_len, pad=" "):
    """JS String.padStart()"""
    return str(text).rjust(target_len, pad)`,

    pad_end: `def pad_end(text, target_len, pad=" "):
    """JS String.padEnd()"""
    return str(text).ljust(target_len, pad)`,

    _set_timeout: `def _set_timeout(fn, ms=0, *args):
    """Best-effort setTimeout emulation using a background timer thread."""
    import threading
    t = threading.Timer(max(ms, 0) / 1000.0, lambda: fn(*args))
    t.daemon = True
    t.start()
    return t`,

    _set_interval: `def _set_interval(fn, ms=0, *args):
    """Best-effort setInterval emulation (returns a handle you can stop)."""
    import threading
    stop = threading.Event()

    def _loop():
        while not stop.wait(max(ms, 1) / 1000.0):
            fn(*args)

    t = threading.Thread(target=_loop, daemon=True)
    t.start()
    t._stop_event = stop
    return t`,

    _interval_stop: `def _interval_stop(handle):
    """Stop an interval created by _set_interval()."""
    ev = getattr(handle, "_stop_event", None)
    if ev:
        ev.set()`,

    __js_delete: `def __js_delete(obj, key):
    """JS \`delete obj.key\` / \`delete obj[key]\`"""
    if isinstance(obj, dict):
        return obj.pop(key, None)
    if hasattr(obj, key):
        delattr(obj, key)
        return True
    return False`,

    _json_default: `def _json_default(obj):
    """Encoder fallback so json.dumps works on class instances."""
    return getattr(obj, "__dict__", str(obj))`
  };

  /* ====================== Expression converter ===================== */
  class Expr {
    constructor(tp) { this.tp = tp; }
    warn(m) { this.tp.warn(m); }
    use(nm) { this.tp.useRuntime(nm); }
    imp(mod) { this.tp.useImport(mod); }

    convert(toks) {
      return this.cleanup(this.walk(toks));
    }

    /* Balanced-paren helpers for marker resolution */
    static matchParen(s, openIdx) {
      let d = 0;
      for (let i = openIdx; i < s.length; i++) {
        if (s[i] === '(') d++;
        else if (s[i] === ')') { d--; if (d === 0) return i; }
      }
      return -1;
    }
    // operand immediately before index `end` (exclusive): walks a balanced chain
    static operandBefore(s, end) {
      let i = end - 1;
      while (i >= 0 && /\s/.test(s[i])) i--;
      if (i < 0) return null;
      if (s[i] === ')') {
        let d = 0;
        for (; i >= 0; i--) {
          if (s[i] === ')') d++;
          else if (s[i] === '(') { d--; if (d === 0) break; }
        }
        if (i <= 0) return null;
        let j = i - 1;
        while (j >= 0 && /[\w.]/.test(s[j])) j--;
        const base = s.slice(j + 1, i);
        if (!base) return null;
        return { start: j + 1, text: base + s.slice(i, end) };
      }
      if (/[\w"]/.test(s[i])) {
        let j = i;
        while (j >= 0 && /[\w."']/.test(s[j])) {
          if (s[j] === '"') { // walk back over string literal
            j--;
            while (j >= 0 && !(s[j] === '"' && s[j - 1] !== '\\')) j--;
            j--;
            continue;
          }
          if (s[j] === ']') {
            let d = 0;
            for (; j >= 0; j--) {
              if (s[j] === ']') d++;
              else if (s[j] === '[') { d--; if (d === 0) break; }
            }
            continue;
          }
          j--;
        }
        const text = s.slice(j + 1, i + 1);
        if (!/^["\w]/.test(text)) return null;
        return { start: j + 1, text };
      }
      return null;
    }
    static resolveMarkers(s) {
      const MARKER = '@@MARK:';
      let guard = 0;
      while (guard++ < 200) {
        const idx = s.indexOf(MARKER);
        if (idx === -1) break;
        const m = s.slice(idx).match(/^@@MARK:(\w+)(\(NOT)?\(/);
        if (!m) { s = s.replace('@@MARK:', ''); continue; }
        const fn = m[1];
        const notFlag = !!m[2];
        const parenOpen = idx + m[0].length - 1; // index of the final '('
        const parenClose = Expr.matchParen(s, parenOpen);
        if (parenClose === -1) { s = s.slice(0, idx) + s.slice(idx + m[0].length); continue; }
        let args = s.slice(parenOpen + 1, parenClose).trim();
        const objInfo = Expr.operandBefore(s, idx);
        let replacement;
        if (fn === 'join_sep') {
          const sep = args ? args : '", "';
          replacement = objInfo ? `${sep}.join(${objInfo.text})` : args;
        } else if (objInfo) {
          replacement = `${fn}(${objInfo.text}${args ? ', ' + args : ''})`;
        } else {
          replacement = `${fn}(${args})`;
        }
        if (notFlag) replacement = `not (${replacement})`;
        s = s.slice(0, objInfo ? objInfo.start : idx) + replacement + s.slice(parenClose + 1);
      }
      // leftover markers without wrapper
      s = s.replace(/@@MARK:\w+\(/g, m => m.slice(8));
      // length: X@@LEN -> len(X)
      let lguard = 0;
      while (lguard++ < 100) {
        const li = s.indexOf('@@LEN');
        if (li === -1) break;
        const info = Expr.operandBefore(s, li);
        if (!info) { s = s.slice(0, li) + s.slice(li + 5); continue; }
        s = s.slice(0, info.start) + `len(${info.text})` + s.slice(li + 5);
      }
      // isinstance: handled via marker too
      let iguard = 0;
      while (iguard++ < 100) {
        const ii = s.indexOf('@@ISINSTANCE(');
        if (ii === -1) break;
        const close = Expr.matchParen(s, ii + 13);
        const rhs = s.slice(ii + 14, close).trim();
        const info = Expr.operandBefore(s, ii);
        const rep = info ? `isinstance(${info.text}, ${rhs})` : `isinstance(None, ${rhs})`;
        s = s.slice(0, info ? info.start : ii) + rep + s.slice(close + 1);
      }
      // Object.assign(target, ...srcs) -> target.update(...)
      let aguard = 0;
      while (aguard++ < 50) {
        const ai = s.indexOf('@@ASSIGN(');
        if (ai === -1) break;
        const close = Expr.matchParen(s, ai + 9);
        const args = s.slice(ai + 10, close);
        const argList = args.split(',').map(x => x.trim());
        const tgt = argList[0] || '';
        const rest = argList.slice(1).join(', ');
        s = s.slice(0, ai) + `(${tgt}).update(${rest})` + s.slice(close + 1);
      }
      s = s.replace(/@@ISLIST\(/g, '_is_list(');
      s = s.replace(/@@ARRFROM\(/g, 'list(');
      s = s.replace(/@@DATENOW\(\)/g, 'int(time.time() * 1000)');
      s = s.replace(/@@CONCAT\(/g, '+ (');
      s = s.replace(/@@REVM:(\w+)\(/g, '$1(');
      return s;
    }

    walk(toks) { return this.core(toks); }

    core(toks) {
      let out = '';
      const consumed = new Set();
      const N = toks.length;

      for (let i = 0; i < N; i++) {
        if (consumed.has(i)) continue;
        const tk = toks[i];
        const prev = lastMeaningful(toks.slice(0, i));
        const next = toks[i + 1];

        if (tk.t === 'num') { out += ' ' + this.num(tk.v) + ' '; continue; }
        if (tk.t === 'str') { out += ' ' + this.strLit(tk.v, tk.quote) + ' '; continue; }
        if (tk.t === 'template') { out += ' ' + this.template(tk.parts) + ' '; continue; }
        if (tk.t === 'regex') { out += ' ' + this.regex(tk.v, tk.flags) + ' '; continue; }
        if (tk.t === 'comment') { out += ' ' + this.comment(tk.v) + ' '; continue; }

        if (tk.t === 'name') {
          // object literal key detection: { name: value }
          if (!this.inArrayLiteral && prev && prev.t === 'punct' && (prev.v === '{' || prev.v === ',') && next && next.t === 'punct' && next.v === ':') {
            const colonIdx = i + 1;
            const isComputed = false;
            out += ' ' + JSON.stringify(tk.v) + ' :';
            consumed.add(colonIdx);
            i = colonIdx;
            continue;
          }
          const r = this.keyword(tk, prev, next, toks, i, consumed);
          if (r !== null) { out += r; continue; }
          out += ' ' + this.ident(tk.v, prev, next) + ' ';
          continue;
        }

        if (tk.t === 'punct') {
          // ternary ':' inside object literal or switch already handled upstream; skip dict colons
          if (tk.v === ':' && !this.inTernary) {
            // inside a converted expression that came from an object literal — keep as else only in ternary mode
            const inObj = (() => {
              let d = 0;
              for (let j = i - 1; j >= 0; j--) {
                const t2 = toks[j];
                if (t2.t === 'punct') {
                  if (')]}'.includes(t2.v)) d++;
                  else if (OPEN[t2.v]) { if (d === 0 && t2.v === '{') return true; d--; }
                }
              }
              return false;
            })();
            if (inObj) { out += ': '; continue; }
          }
          const r = this.operator(tk, prev, next, toks, i, consumed);
          if (r !== null) { out += r; continue; }
        }
      }
      return out;
    }

    cleanup(s) {
      s = s.replace(/\s+/g, ' ').trim();
      s = s.replace(/([A-Za-z_)\]"]) \(/g, '$1(');   // call parens attach to callee
      s = s.replace(/\s*([,)\]])\s*/g, '$1');
      s = s.replace(/\(\s+/g, '(');
      s = s.replace(/,\s*\)/g, ')');
      s = s.replace(/ \. /g, '.');
      s = s.replace(/\(\s*\)/g, '()');
      s = s.replace(/\blambda\b\s*/g, 'lambda ');
      s = s.trim();
      return s;
    }

    comment(v) {
      if (v.startsWith('//')) return '# ' + v.slice(2).trim();
      return '# ' + v.replace(/^\/\*\s?/, '').replace(/\s?\*\/$/, '').trim();
    }

    num(v) {
      if (/^0[xX]/.test(v)) return '0x' + v.slice(2).replace(/_/g, '');
      if (/^0[bB]/.test(v)) return '0b' + v.slice(2).replace(/_/g, '');
      if (/^0[oO]/.test(v)) return '0o' + v.slice(2).replace(/_/g, '');
      return v.replace(/_/g, '');
    }

    strLit(inner, quote) {
      let s = inner;
      // normalize escapes that differ between languages
      s = s.replace(/\\'/g, "'").replace(/\\"/g, '\\"');
      s = s.replace(/(?<!\\)"/g, '\\"');
      return '"' + s + '"';
    }

    template(parts) {
      const hasExpr = parts.some(p => p.type === 'expr');
      if (!hasExpr) return this.strLit(parts[0].v, '`');
      let body = '';
      for (const p of parts) {
        if (p.type === 'text') body += p.v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\{/g, '{{').replace(/\}/g, '}}').replace(/\r?\n/g, '\\n');
        else body += '{' + this.convert(tokenize(p.v)) + '}';
      }
      return 'f"' + body + '"';
    }

    regex(pat, flags) {
      this.imp('re');
      const fl = [];
      if (flags.includes('i')) fl.push('re.IGNORECASE');
      if (flags.includes('m')) fl.push('re.MULTILINE');
      if (flags.includes('s')) fl.push('re.DOTALL');
      this.warn('Regex literals became re.compile(...) — remember JS .test() maps to truthy re.search().');
      return `re.compile(r"${pat.replace(/"/g, '\\"')}"${fl.length ? ', ' + fl.join(' | ') : ''})`;
    }

    ident(v, prev, next) {
      // member names after '.' pass through unchanged (except `length`)
      const afterDot = prev && prev.t === 'punct' && (prev.v === '.' || prev.v === '?.');
      if (afterDot) {
        if (v === 'length') return '@@LEN';
        return v;
      }
      switch (v) {
        case 'true': return 'True';
        case 'false': return 'False';
        case 'null': return 'None';
        case 'undefined': return 'None';
      }
      if (['None', 'True', 'False', 'elif', 'lambda', 'nonlocal', 'pass', 'yield', 'exec', 'assert', 'class', 'def', 'del', 'global', 'import', 'raise', 'async', 'await', 'in', 'is', 'not', 'or', 'and'].includes(v)) return v + '_';
      return v;
    }

    keyword(tk, prev, next, toks, i, consumed) {
      const v = tk.v;
      const afterDot = prev && prev.t === 'punct' && (prev.v === '.' || prev.v === '?.');
      if (afterDot) return null;

      switch (v) {
        case 'this': return ' self ';
        case 'super': return ' super ';
        case 'NaN': return ' float("nan") ';
        case 'Infinity': return ' float("inf") ';
        case 'new': {
          // new Foo(args) -> Foo(args) ; new Error("m") -> Error("m") handled by statement raise mapping
          const j = i + 1;
          if (toks[j] && toks[j].t === 'name') {
            const name = toks[j].v;
            if (/(Error|Exception)$/.test(name)) { this.tp.pendingNewError = name; }
            return ' ';
          }
          return ' ';
        }
        case 'typeof': {
          this.use('_type_of');
          const span = takeOperand(toks, i + 1);
          const inner = this.convert(stripNL(toks.slice(i + 1, i + 1 + span)));
          for (let k = i + 1; k < i + 1 + span; k++) consumed.add(k);
          return ` _type_of(${inner}) `;
        }
        case 'instanceof': {
          const span = takeOperand(toks, i + 1);
          const rhs = this.convert(stripNL(toks.slice(i + 1, i + 1 + span)));
          for (let k = i + 1; k < i + 1 + span; k++) consumed.add(k);
          // wrap left side: find preceding operand in out string — easier textual approach:
          return ` @@ISINSTANCE(${rhs}) `;
        }
        case 'void': {
          const span = takeOperand(toks, i + 1);
          for (let k = i + 1; k < i + 1 + span; k++) consumed.add(k);
          return ' None ';
        }
        case 'delete': {
          this.use('__js_delete');
          const span = takeOperand(toks, i + 1);
          const e = this.convert(stripNL(toks.slice(i + 1, i + 1 + span)));
          for (let k = i + 1; k < i + 1 + span; k++) consumed.add(k);
          const m = e.match(/^(.+?)\.(\w+)$/);
          if (m) return ` ${m[1]}.pop("${m[2]}", None) `;
          const b = e.match(/^(.+?)\[(.+)\]$/);
          if (b) return ` ${b[1]}.pop(${b[2]}, None) `;
          return ` __js_delete(${e}) `;
        }
        case 'let': case 'const': case 'var': return ' ';
        case 'function': return ' def ';
        case 'async': return ' async ';
        case 'await': return ' await ';
        case 'in': return ' in ';
        case 'of': return ' of ';
        case 'if': case 'else': case 'for': case 'while': case 'do': case 'return':
        case 'break': case 'continue': case 'try': case 'catch': case 'finally':
        case 'throw': case 'switch': case 'case': case 'default': case 'class':
          return ' ' + v + ' ';
      }

      const G = {
        parseInt: 'int', parseFloat: 'float', isNaN: '_is_nan', isFinite: '_is_finite',
        encodeURIComponent: 'quote', decodeURIComponent: 'unquote', encodeURI: 'quote',
        String: 'str', Number: 'float', Boolean: 'bool', alert: 'print', prompt: 'input',
        globalThis: 'self'
      };
      if (G[v]) {
        if (v === 'isNaN') this.use('_is_nan');
        if (v === 'encodeURIComponent' || v === 'decodeURIComponent' || v === 'encodeURI') this.imp('urllib.parse');
        return ' ' + G[v] + ' ';
      }
      if (v === 'JSON') { this.imp('json'); return ' json '; }
      if (v === 'Math') { this.imp('math'); return ' math '; }
      if (v === 'Date') { this.imp('datetime'); return ' datetime '; }
      if (v === 'RegExp') { this.imp('re'); return ' re '; }
      if (v === 'console') return ' console ';
      if (v === 'Promise') { this.warn('Promises map loosely onto Python; review async flow.'); return ' _Promise '; }
      if (['window', 'document', 'localStorage', 'sessionStorage', 'fetch', 'require', 'module'].includes(v)) {
        this.warn(`"${v}" is a JS/browser/Node API with no direct Python equivalent — emitted as-is for manual porting.`);
        return ' ' + v + ' ';
      }
      return null; // normal identifier
    }

    operator(tk, prev, next, toks, i, consumed) {
      const v = tk.v;

      switch (v) {
        case '===': return ' == ';
        case '!==': return ' != ';
        case '==': return ' == ';
        case '!=': return ' != ';
        case '&&': return ' and ';
        case '||': return ' or ';
        case '??': return ' or ';
        case '?.': return '.';
        case '=>': return ' lambda ';
        case '?': return ' if ';
        case ':': return ' else ';
        case '**': return ' ** ';
        case '~': return ' ~ ';
        case '!': {
          if (next && next.t === 'punct' && next.v === '=') return '';
          if (next && next.t === 'punct' && next.v === '(') {
            const g = balancedFrom(toks, i);
            const inner = this.convert(g.inner);
            for (let k = i + 1; k <= g.end; k++) consumed.add(k);
            return ` not (${inner}) `;
          }
          const span = takeOperand(toks, i + 1);
          const e = this.convert(stripNL(toks.slice(i + 1, i + 1 + span)));
          for (let k = i + 1; k < i + 1 + span; k++) consumed.add(k);
          return ` not ${e} `;
        }
        case '++': case '--': {
          const dir = v === '++' ? '1' : '-1';
          if (prev && (prev.t === 'name' || prev.v === ')' || prev.v === ']')) {
            // postfix: X++  -> wrap previous identifier
            return ` +(${dir}) `;
          }
          return ` +(${dir}) `;
        }
        case '+':
          if (next && next.t === 'punct' && next.v === '+') return ' ';
          if (!prev || ['=', '(', ',', '[', '{', ':'].includes(prev.v) || prev.t === 'op') return ' ';
          return ' + ';
        case '-':
          if (next && next.t === 'punct' && next.v === '-') return ' ';
          if (!prev || ['=', '(', ',', '[', '{', ':'].includes(prev.v)) return '-';
          return ' - ';
        case '.': {
          if (next && next.t === 'name') {
            const callIdx = i + 2;
            const isCall = toks[callIdx] && toks[callIdx].t === 'punct' && toks[callIdx].v === '(';
            const r = this.member(next.v, isCall, toks, callIdx, prev);
            if (r !== null) return r;
            // Object.keys / Array.isArray / JSON.stringify etc.
            if (prev && prev.t === 'name') {
              if (prev.v === 'Object' && next.v === 'keys') { this.imp('builtins'); return ' .keys('; }
              if (prev.v === 'Object' && next.v === 'values') return ' .values(';
              if (prev.v === 'Object' && next.v === 'entries') return ' .items(';
              if (prev.v === 'Object' && next.v === 'assign') { this.warn('Object.assign → dict update(); verify shallow-copy semantics.'); return ' @@ASSIGN('; }
              if (prev.v === 'Array' && next.v === 'isArray') { this.warn('Array.isArray converted to isinstance(..., list).'); return ' @@ISLIST('; }
              if (prev.v === 'Array' && next.v === 'from') { this.warn('Array.from(...) converted to list(...).'); return ' @@ARRFROM('; }
              if (prev.v === 'JSON' && next.v === 'stringify') { this.imp('json'); this.useRuntimeIfClasses(); return ' .dumps('; }
              if (prev.v === 'JSON' && next.v === 'parse') { this.imp('json'); return ' .loads('; }
              if (prev.v === 'Math') return ' .' + this.mathFn(next.v) + '(';
              if (prev.v === 'Date' && next.v === 'now') { this.imp('time'); this.warn('Date.now() → time.time()*1000 (milliseconds).'); return ' @@DATENOW('; }
            }
            return '.' + this.memberNameAfterDot(next.v) + ' ';
          }
          return '.';
        }
        case '...': {
          // spread in call/array context becomes *args; in object literal handled by parser note
          return '*';
        }
        case '{': return ' {';
        case '}': return '} ';
        case '(': return '(';
        case ')': return ')';
        case '[': return '[';
        case ']': return ']';
        case ',': return ', ';
        case ';': return ' ; ';
      }
      return null;
    }

    mathFn(name) {
      const MAP = { abs: 'fabs', pow: 'pow', sqrt: 'sqrt', cbrt: 'cbrt', floor: 'floor', ceil: 'ceil', round: 'round', max: 'max', min: 'min', random: 'random', sign: 'copysign', sin: 'sin', cos: 'cos', tan: 'tan', asin: 'asin', acos: 'acos', atan: 'atan', atan2: 'atan2', log: 'log', log2: 'log2', log10: 'log10', exp: 'exp', hypot: 'hypot', trunc: 'trunc' };
      if (name === 'PI') { return 'pi'; }
      if (name === 'E') return 'e';
      if (MAP[name]) return MAP[name];
      this.warn(`Math.${name} has no direct Python mapping — emitted as math.${name}.`);
      return name;
    }

    memberNameAfterDot(name) {
      // property renames that are not calls
      if (name === 'length') return '@@LEN';
      if (name === 'toString') return 'str_';
      return name;
    }

    member(name, isCall, toks, argIdx, prev) {
      if (!isCall) return null;
      const REV = { // obj.method(a,b) -> helper(obj, a, b)
        includes: '_includes', indexOf: '_index_of', replace: '_replace_first',
        slice: 'slice_', substring: 'slice_', forEach: '_for_each', map: '_map',
        filter: '_filter', reduce: '_reduce', find: '_find', findIndex: '_find_index',
        some: '_some', every: '_every', sort: 'sort_', splice: 'splice_',
        charAt: 'charAt_', padStart: 'pad_start', padEnd: 'pad_end',
        test: 'search', exec: 'match', join: 'join_rev'
      };
      const DIRECT = {
        push: 'append', pop: 'pop', split: 'split', toUpperCase: 'upper', toLowerCase: 'lower',
        trim: 'strip', trimStart: 'lstrip', trimEnd: 'rstrip', startsWith: 'startswith',
        endsWith: 'endswith', replaceAll: 'replace', reverse: 'reverse', keys: 'keys',
        values: 'values', entries: 'items', addEventListener: 'on', getTime: 'timestamp',
        toISOString: 'isoformat', getFullYear: 'year_note', getMonth: 'month_note',
        getDate: 'day_note', getHours: 'hour', getMinutes: 'minute', getSeconds: 'second',
        hasOwnProperty: '__contains__', toString: 'str', charCodeAt: 'ord_wrap',
        fromCharCode: 'chr', stringify: 'dumps', parse: 'loads', now: 'now',
        setTimeout: '_set_timeout', setInterval: '_set_interval', clearInterval: '_interval_stop',
        clearTimeout: '_interval_stop', log: 'print', error: 'print', warn: 'print',
        info: 'print', debug: 'print', concat: 'concat_', match: 'match'
      };
      if (REV[name]) {
        this.use(REV[name] === 'join_rev' ? 'join_sep' : REV[name]);
        return `@@REV:${REV[name]}(`;
      }
      if (DIRECT[name]) {
        const py = DIRECT[name];
        if (py === '_set_timeout' || py === '_set_interval' || py === '_interval_stop') this.use(py);
        if (['year_note', 'month_note', 'day_note'].includes(py)) this.warn('JS Date getters differ from Python (months are 1-based in Python) — verify calendar math.');
        if (py === 'ord_wrap') return '@@REVM:ord(';
        if (py === 'concat_') { this.warn('.concat() mapped to list/str concatenation helper.'); return '@@CONCAT('; }
        return py + '(';
      }
      return null;
    }

    /* Post-processing of markers over the final expression string */
    static resolveMarkers(s, ctx) {
      // @@REV:helper( ... )  -> helper(obj, ...) where obj precedes the marker
      s = s.replace(/@@REV:(\w+)\(/g, (m, fn) => `[[REV]]${fn}(`);
      // pattern: OBJ [[REV]]fn( ARGS )  -> fn(OBJ, ARGS)
      s = s.replace(/([A-Za-z_][\w.\[\]()'"* ]*?)\s*\[\[REV\]\](\w+)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g,
        (m, obj, fn, args) => `${fn}(${obj.trim()}${args ? ', ' + args.trim() : ''})`);
      // leftover simple form: X.[[REV]]fn(args)
      s = s.replace(/([A-Za-z_][\w.]*)\.\[\[REV\]\](\w+)\(/g, '$2($1, ');

      // @@REVM:ord( X ) -> ord(X)
      s = s.replace(/([A-Za-z_][\w.\[\]'\"]*)\s*@@REVM:(\w+)\(([^()]*)\)/g, '$2($1[$3])');

      // @@LEN handling: X.length -> len(X)
      s = s.replace(/([A-Za-z_][\w]*(?:\([^()]*\)|\[[^\[\]]*\])*)\.@@LEN/g, 'len($1)');

      // isinstance: a @@ISINSTANCE(B) -> isinstance(a, B)
      s = s.replace(/([A-Za-z_][\w.\[\]()'"*]*?)\s*@@ISINSTANCE\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, 'isinstance($1, $2)');

      // Object.assign(target, src)
      s = s.replace(/([A-Za-z_][\w.\[\]()'"*]*?)\s*@@ASSIGN\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (_m, tgt, args) => {
        const first = args.split(',')[0].trim();
        return `(${tgt}).update(${first}${args.split(',').slice(1).length ? ', ' + args.split(',').slice(1).map(x => x.trim()).join(', ') : ''})`;
      });

      // Array.isArray(x)
      s = s.replace(/@@ISLIST\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, 'isinstance($1, list)');
      // Array.from(x)
      s = s.replace(/@@ARRFROM\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, 'list($1)');
      // Date.now()
      s = s.replace(/@@DATENOW\(\)/g, 'int(time.time() * 1000)');
      // .concat(a, b...)
      s = s.replace(/([A-Za-z_][\w.]*)\.@@CONCAT\(([^()]*)\)/g, '($1 + [$2])');
      // join: arr.join(sep) -> sep.join(arr)
      s = s.replace(/([A-Za-z_][\w.\[\]()'"*]*?)\s*@@REV:join_sep\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (_m, arr, sep) => `${sep || '","'}.join(${arr.trim()})`);

      return s;
    }
  }

  function takeOperand(toks, i) {
    // width of one primary expression starting at i, incl. postfix chains
    if (i >= toks.length) return 0;
    let count = 0;
    const t = toks[i];
    if (t.t === 'punct' && t.v === '(') { const g = balancedFrom(toks, i); return g.count; }
    if (t.t === 'punct' && t.v === '[') { const g = balancedFrom(toks, i); return g.count; }
    if (t.t === 'name' || t.t === 'num' || t.t === 'str' || t.t === 'template' || t.t === 'regex') count = 1;
    else if (t.t === 'punct' && (t.v === '-' || t.v === '!' || t.v === '+' || t.v === '~')) return 1 + takeOperand(toks, i + 1);
    else count = 1;
    let j = i + count;
    while (j < toks.length) {
      const u = toks[j];
      if (u.t === 'punct' && (u.v === '.' || u.v === '?.' )) { j += 2; count = j - i; continue; }
      if (u.t === 'punct' && (u.v === '(' || u.v === '[')) { const g = balancedFrom(toks, j); j += g.count; count = j - i; continue; }
      if (u.t === 'punct' && (u.v === '++' || u.v === '--')) { j++; count = j - i; continue; }
      break;
    }
    return count;
  }

  /* ========================= Statement parser ======================== */
  class Transpiler {
    constructor() {
      this.lines = [];
      this.warnings = [];
      this.runtimes = new Set();
      this.imports = new Set();
      this.classesSeen = false;
    }
    warn(m) { if (!this.warnings.includes(m)) this.warnings.push(m); }
    useRuntime(nm) { this.runtimes.add(nm); }
    useRuntimeIfClasses() { this.needsJsonDefault = true; }
    useImport(mod) {
      if (mod === 'json') this.imports.add('import json');
      else if (mod === 'math') this.imports.add('import math');
      else if (mod === 're') this.imports.add('import re');
      else if (mod === 'datetime') this.imports.add('from datetime import datetime');
      else if (mod === 'time') this.imports.add('import time');
      else if (mod === 'urllib.parse') this.imports.add('from urllib.parse import quote, unquote');
    }

    emit(depth, text) {
      if (text === undefined || text === null) return;
      text = String(text).trim();
      if (!text) { this.lines.push('    '.repeat(depth) + 'pass'); return; }
      // strip internal markers before writing
      text = text.replace(/@@SKIP:\d+/g, '');
      this.lines.push('    '.repeat(depth) + text);
    }

    run(src) {
      const toks = tokenize(src);
      this.statements(toks, 0);
      return this.assemble();
    }

    assemble() {
      let body = this.lines.join('\n').replace(/\n{3,}/g, '\n\n');
      body = body.replace(/@@REV:/g, '');
      const banner = [
        '# ============================================================',
        '# Translated from JavaScript by the XPDevs JS\u2192PY Engine',
        '# ' + new Date().toISOString(),
        '# Review carefully before running — dynamic JS idioms may need tweaks.',
        '# ============================================================'
      ];
      let head = banner.join('\n');
      const imports = [...this.imports];
      if (/@@|\bjson\.dumps\b/.test(body) && this.classesSeen) { /* handled below */ }
      if (imports.length) head += '\n\n' + imports.join('\n');
      let rt = [...this.runtimes].filter(nm => RUNTIME[nm]).map(nm => RUNTIME[nm]);
      if (this.needsJsonDefault && !rt.some(x => x.includes('_json_default'))) { rt.push(RUNTIME._json_default); }
      if (rt.length) head += '\n\n\n' + rt.join('\n\n\n');
      return head + '\n\n\n' + body + '\n';
    }

    /* ---------- splitting into statements ---------- */
    statements(toks, depth) {
      let pos = 0;
      const N = toks.length;
      while (pos < N) {
        // skip empties
        while (pos < N && (toks[pos].t === 'nl' || (toks[pos].t === 'punct' && toks[pos].v === ';'))) pos++;
        if (pos >= N) break;
        const seg = this.collectStatement(toks, pos);
        if (seg.toks.length) this.statement(seg.toks, depth);
        pos = seg.next;
      }
    }

    collectStatement(toks, start) {
      let d = 0, i = start;
      const seg = [];
      while (i < toks.length) {
        const t = toks[i];
        if (t.t === 'punct') {
          if (OPEN[t.v]) d++;
          else if (')]}'.includes(t.v)) d--;
          else if (t.v === ';' && d === 0) { return { toks: seg, next: i + 1 }; }
        }
        if (t.t === 'nl' && d === 0) {
          if (seg.length) {
            const nxt = (() => { let k = i; while (k < toks.length && toks[k].t === 'nl') k++; return toks[k]; })();
            if (nxt && nxt.t === 'punct' && ['(', '[', '.', '+', '-'].includes(nxt.v) && lastMeaningful(seg) && [')', ']', '++', '--'].includes(lastMeaningful(seg).v) === false) {
              // possible continuation; keep going only for safe cases
            }
            // statement terminators by newline (ASI) unless trailing operator/comma
            const lm = lastMeaningful(seg);
            if (lm && (lm.t === 'punct' && ['=', '+', '-', '*', '/', '%', '&&', '||', '(', ',', '.', '=>', '?', ':', '...', '!', '<', '>', '=='].includes(lm.v))) { i++; continue; }
            // multi-line object/array literals inside depth>0 already covered by d
            return { toks: seg, next: i + 1 };
          }
          i++; continue;
        }
        seg.push(t); i++;
        // block-ending statements complete immediately
        if (d === 0 && t.t === 'punct' && t.v === '}') {
          const lm = lastMeaningful(seg);
          if (lm && lm.v === '}') {
            // check trailing else/catch/finally
            let k = i; while (k < toks.length && toks[k].t === 'nl') k++;
            const nx = toks[k];
            if (nx && nx.t === 'name' && ['else', 'catch', 'finally'].includes(nx.v)) { continue; }
            return { toks: seg, next: i };
          }
        }
      }
      return { toks: seg, next: i };
    }

    /* ---------- dispatch ---------- */
    statement(toks, depth) {
      toks = toks.filter(t => t.t !== 'nl');
      if (!toks.length) return;
      const first = toks[0];

      if (first.t === 'comment') {
        this.emit(depth, this.exprConvert([first]));
        if (toks.length > 1) this.statement(toks.slice(1).filter(t => t.t !== 'nl'), depth);
        return;
      }
      if (first.t === 'punct' && first.v === '{') {
        const g = balancedFrom(toks, 0);
        this.statements(g.inner, depth);
        return;
      }
      if (first.t === 'name') {
        switch (first.v) {
          case 'var': case 'let': case 'const': return this.declaration(toks, depth);
          case 'function': return this.functionDecl(toks, depth, false);
          case 'class': return this.classDecl(toks, depth);
          case 'if': return this.ifStmt(toks, depth, false);
          case 'for': return this.forStmt(toks, depth);
          case 'while': return this.whileStmt(toks, depth);
          case 'do': return this.doWhile(toks, depth);
          case 'switch': return this.switchStmt(toks, depth);
          case 'try': return this.tryStmt(toks, depth);
          case 'return': {
            const rest = stripNL(toks.slice(1));
            return this.emit(depth, rest.length ? 'return ' + this.exprConvert(rest) : 'return');
          }
          case 'throw': return this.emit(depth, 'raise ' + this.throwArg(stripNL(toks.slice(1))));
          case 'break': return this.emit(depth, 'break');
          case 'continue': return this.emit(depth, 'continue');
          case 'else': return this.ifStmt([{ t: 'name', v: 'if' }, ...toks.slice(1)], depth, true);
          case 'import': case 'export':
            this.warn('ES module syntax was preserved as a comment — wire up Python imports manually.');
            return this.emit(depth, '# ' + raw(toks));
          case 'debugger': return this.emit(depth, 'breakpoint()  # from debugger');
          case 'async': {
            if (toks[1] && toks[1].t === 'name' && toks[1].v === 'function') return this.functionDecl(toks.slice(1), depth, true);
            break;
          }
        }
      }
      // plain expression-statement (assignments, calls, increments)
      this.expressionStatement(toks, depth);
    }

    expressionStatement(toks, depth) {
      // handle postfix/prefix ++/-- as standalone statements: x++; x--; ++x;
      const inc = (() => {
        const last = toks[toks.length - 1];
        const first = toks[0];
        if (last && last.t === 'punct' && (last.v === '++' || last.v === '--') && meaningful(toks.slice(0, -1)).length) {
          const target = stripNL(toks.slice(0, toks.length - 1));
          const t = this.exprConvert(target);
          return `${t} ${last.v === '++' ? '+=' : '-='} 1`;
        }
        if (first && first.t === 'punct' && (first.v === '++' || first.v === '--')) {
          const target = stripNL(toks.slice(1));
          const t = this.exprConvert(target);
          return `${t} ${first.v === '++' ? '+=' : '-='} 1`;
        }
        return null;
      })();
      if (inc) return this.emit(depth, inc);
      const e = this.exprConvert(toks);
      if (e) this.emit(depth, e);
    }

    exprConvert(toks) {
      const ex = new Expr(this);
      let s = ex.convert(toks);
      s = Expr.resolveMarkers(s);
      // cleanup leftovers
      s = s.replace(/@@\w+(:|\()?/g, m => m.startsWith('@@REV:') ? '' : m.replace('@@', ''));
      s = s.replace(/\s+/g, ' ').trim();
      // semicolons mid-line (chained statements) -> split into separate emits handled upstream; drop them
      s = s.replace(/ ;/g, '');
      return s;
    }

    throwArg(toks) {
      const e = this.exprConvert(toks);
      const m = e.match(/^(\w*Error)\s*\((.*)\)$/);
      if (m) return m[1] + '(' + m[2] + ')';
      if (/\bError\s*\(/.test(e)) return e;
      this.warn('throw <value> became raise Exception(<value>) — map to a specific exception class.');
      return 'Exception(' + e + ')';
    }

    declaration(toks, depth) {
      const kind = toks[0].v;
      const rest = stripNL(toks.slice(1));
      const parts = splitTop(rest, ',');
      for (const p of parts) {
        const eq = findTop(p, t => t.t === 'punct' && t.v === '=' && !(p[t.__i + 1] && p[t.__i + 1].v === '='));
        const eqIdx = (() => {
          let d = 0;
          for (let i = 0; i < p.length; i++) {
            const t = p[i];
            if (t.t === 'punct') {
              if (OPEN[t.v]) d++;
              else if (')]}'.includes(t.v)) d--;
              else if (t.v === '=' && d === 0) {
                const nv = p[i + 1] && p[i + 1].v;
                const pv = p[i - 1] && p[i - 1].v;
                if (nv === '=' || ['!','<','>','+','-','*','/','%','&','|','^'].includes(pv)) continue;
                return i;
              }
            }
          }
          return -1;
        })();
        if (eqIdx === -1) { this.emit(depth, this.exprConvert(p) + ' = None'); continue; }
        const lhsToks = p.slice(0, eqIdx);
        const rhsToks = p.slice(eqIdx + 1);
        // destructuring detection
        if (lhsToks[0] && lhsToks[0].t === 'punct' && (lhsToks[0].v === '{' || lhsToks[0].v === '[')) {
          this.destructured(kind, lhsToks, rhsToks, depth);
          continue;
        }
        // function-valued const: const f = function(...) / arrow
        const rhsRaw = stripNL(rhsToks);
        if (rhsRaw[0] && rhsRaw[0].t === 'name' && (rhsRaw[0].v === 'function' || (rhsRaw[0].v === 'async' && rhsRaw[1] && rhsRaw[1].v === 'function'))) {
          const fd = rhsRaw[0].v === 'async' ? rhsRaw.slice(1) : rhsRaw;
          const fake = [{ t: 'name', v: 'function' }, ...lhsToks, ...fd.slice(1)];
          this.functionDecl(fake, depth, rhsRaw[0].v === 'async');
          continue;
        }
        // arrow assigned to name: const f = (a) => ...  | const f = a => ...
        const arrowIdx = findTop(rhsRaw, t => t.t === 'punct' && t.v === '=>');
        if (arrowIdx !== -1 && looksLikeArrowHead(rhsRaw, arrowIdx)) {
          this.arrowAsFunction(lhsToks, rhsRaw, depth);
          continue;
        }
        const lhs = this.exprConvert(lhsToks);
        const rhs = this.exprConvert(rhsToks);
        this.emit(depth, `${lhs} = ${rhs}`);
      }
    }

    destructured(kind, lhsToks, rhsToks, depth) {
      this.warn('Destructuring was expanded into indexed access — verify nested defaults.');
      const isObj = lhsToks[0].v === '{';
      const inner = balancedFrom(lhsToks, 0).inner;
      const tmp = '_tmp_' + (this.tmpN = (this.tmpN || 0) + 1);
      const rhs = this.exprConvert(rhsToks);
      this.emit(depth, `${tmp} = ${rhs}`);
      for (const p of splitTop(inner, ',')) {
        const q = p.filter(t => t.t !== 'nl');
        let nameTok = q[0];
        let defaultToks = null;
        const eq = findTop(q, t => t.t === 'punct' && t.v === '=');
        if (eq !== -1) { nameTok = q[0]; defaultToks = q.slice(eq + 1); }
        // {a: b} rename
        let key = nameTok.v, target = nameTok.v;
        const colon = findTop(q, t => t.t === 'punct' && t.v === ':');
        if (colon !== -1 && isObj) { key = this.exprConvert(q.slice(0, colon)); target = this.exprConvert(q.slice(colon + 1, eq === -1 ? q.length : eq)); }
        const val = isObj ? `${tmp}.get("${key.replace(/"/g, '')}")` : `${tmp}[${splitTop(inner, ',').indexOf(p)}]`;
        if (defaultToks) this.emit(depth, `${target} = ${val} if ${val} is not None else ${this.exprConvert(defaultToks)}`);
        else this.emit(depth, `${target} = ${val}`);
      }
    }

    looksLikeArrowHead(rhs, arrowIdx) {
      // params must be simple names / paren group directly before =>
      for (let i = 0; i < arrowIdx; i++) {
        const t = rhs[i];
        if (t.t === 'punct' && !['(', ')', ',', '=', '...', '[', ']', '{', '}', ':'].includes(t.v)) return false;
      }
      return true;
    }

    arrowAsFunction(lhsToks, rhsRaw, depth) {
      const arrowIdx = findTop(rhsRaw, t => t.t === 'punct' && t.v === '=>');
      const paramToks = rhsRaw.slice(0, arrowIdx);
      const bodyToks = rhsRaw.slice(arrowIdx + 1);
      const name = this.exprConvert(lhsToks);
      const params = this.paramString(paramToks);
      this.emit(depth, `def ${name}${params}:`);
      if (bodyToks[0] && bodyToks[0].t === 'punct' && bodyToks[0].v === '{') {
        const g = balancedFrom(bodyToks, 0);
        this.statements(g.inner, depth + 1);
      } else {
        this.emit(depth + 1, 'return ' + this.exprConvert(bodyToks));
      }
    }

    paramString(paramToks) {
      let inner = paramToks;
      if (paramToks[0] && paramToks[0].t === 'punct' && paramToks[0].v === '(') inner = balancedFrom(paramToks, 0).inner;
      const parts = splitTop(stripNL(inner), ',');
      const out = [];
      for (const p of parts) {
        if (!p.length) continue;
        if (p[0].t === 'punct' && p[0].v === '...') { out.push('*' + this.exprConvert(p.slice(1))); continue; }
        const eq = findTop(p, t => t.t === 'punct' && t.v === '=' && !(p[t.__i + 1] && p[t.__i + 1].v === '='));
        const eqIdx = (() => {
          let d = 0;
          for (let i = 0; i < p.length; i++) {
            const t = p[i];
            if (t.t === 'punct') { if (OPEN[t.v]) d++; else if (')]}'.includes(t.v)) d--; else if (t.v === '=' && d === 0 && p[i + 1] && p[i + 1].v !== '=' && !(p[i - 1] && /[!<>\+\-\*\/%&|^]/.test(p[i - 1].v))) return i; }
          }
          return -1;
        })();
        if (eqIdx !== -1) { out.push(this.exprConvert(p.slice(0, eqIdx)) + '=' + this.exprConvert(p.slice(eqIdx + 1))); continue; }
        if (p[0].t === 'punct' && (p[0].v === '{' || p[0].v === '[')) { this.warn('Parameter destructuring needs manual review.'); out.push(this.exprConvert(p)); continue; }
        out.push(this.exprConvert(p));
      }
      return '(' + out.join(', ') + ')';
    }

    functionDecl(toks, depth, isAsync) {
      // function name(params){body}  OR  function(params){body} (expression)
      let i = 1;
      let name = 'anonymous_fn';
      if (toks[i] && toks[i].t === 'name') { name = this.exprConvert([toks[i]]); i++; }
      if (toks[i] && toks[i].t === 'punct' && toks[i].v === '(') {
        const params = this.paramString(toks.slice(i));
        const g = balancedFrom(toks, i);
        i = g.end + 1;
        this.emit(depth, `${isAsync ? 'async ' : ''}def ${name}${params}:`);
        if (toks[i] && toks[i].t === 'punct' && toks[i].v === '{') {
          const bg = balancedFrom(toks, i);
          this.statements(bg.inner, depth + 1);
        } else this.emit(depth + 1, 'pass');
      }
    }

    ifStmt(toks, depth, isElse) {
      const g = balancedFrom(toks, 1);
      const cond = this.exprConvert(g.inner);
      this.emit(depth, (isElse ? 'el' : '') + 'if ' + cond + ':');
      let i = g.end + 1;
      i = this.body(toks, i, depth + 1);
      // attach else chain
      while (i < toks.length && toks[i].t === 'name' && toks[i].v === 'else') {
        if (toks[i + 1] && toks[i + 1].v === 'if') { this.ifStmt(toks.slice(i + 1), depth, true); return; }
        this.emit(depth, 'else:');
        i = this.body(toks, i + 1, depth + 1);
      }
    }

    body(toks, i, depth) {
      if (i >= toks.length) { this.emit(depth, 'pass'); return i; }
      if (toks[i].t === 'punct' && toks[i].v === '{') {
        const g = balancedFrom(toks, i);
        this.statements(g.inner, depth);
        return g.end + 1;
      }
      const seg = this.collectStatement(toks, i);
      if (seg.toks.length) this.statement(seg.toks, depth); else this.emit(depth, 'pass');
      return seg.next;
    }

    forStmt(toks, depth) {
      const g = balancedFrom(toks, 1);
      const inner = stripNL(g.inner);
      let i = g.end + 1;
      const ofIdx = inner.findIndex((t, j) => t.t === 'name' && t.v === 'of' && j > 0);
      const inIdx = inner.findIndex((t, j) => t.t === 'name' && t.v === 'in' && j > 0);
      const semi = findTop(inner, t => t.t === 'punct' && t.v === ';');

      if (ofIdx !== -1) {
        const varName = this.exprConvert(inner.slice(0, ofIdx));
        const iter = this.exprConvert(inner.slice(ofIdx + 1));
        this.emit(depth, `for ${varName} in ${iter}:`);
        this.body(toks, i, depth + 1);
        return;
      }
      if (inIdx !== -1) {
        const varName = this.exprConvert(inner.slice(0, inIdx));
        const obj = this.exprConvert(inner.slice(inIdx + 1));
        this.warn('for...in iterates object keys in JS; translated to .keys(). Use for...of for arrays.');
        this.emit(depth, `for ${varName} in ${obj}.keys():`);
        this.body(toks, i, depth + 1);
        return;
      }
      if (semi !== -1) {
        const parts = splitTop(inner, ';');
        const initP = parts[0], condP = parts[1] || [], updP = parts[2] || [];
        // C-style single-var loop → range() when it matches `let i = 0; i < N; i++`
        const rangeMatch = this.tryRange(initP, condP, updP);
        if (rangeMatch) {
          this.emit(depth, `for ${rangeMatch[0]} in ${rangeMatch[1]}:`);
          this.body(toks, i, depth + 1);
          return;
        }
        if (initP.length) this.statement(stripNL(initP), depth);
        const cond = condP.length ? this.exprConvert(condP) : 'True';
        this.emit(depth, `while ${cond}:`);
        const end = this.body(toks, i, depth + 1);
        if (updP.length) this.expressionStatement(stripNL(updP), depth + 1);
        return;
      }
      this.warn('Unrecognized for-loop header preserved as a comment.');
      this.emit(depth, '# for (' + raw(inner) + ') { ... }');
      this.body(toks, i, depth + 1);
    }

    tryRange(initP, condP, updP) {
      if (!initP.length || !condP.length || !updP.length) return null;
      const ip = stripNL(initP), cp = stripNL(condP), up = stripNL(updP);
      const eq = findTop(ip, t => t.t === 'punct' && t.v === '=');
      if (eq === -1) return null;
      const varToks = ip.slice(0, eq).filter(t => t.t !== 'nl' && !(t.t === 'name' && ['var', 'let', 'const'].includes(t.v)));
      if (varToks.length !== 1 || varToks[0].t !== 'name') return null;
      const startE = this.exprConvert(ip.slice(eq + 1));
      // cond: var < X  or var <= X
      const lt = findTop(cp, t => t.t === 'punct' && (t.v === '<' || t.v === '<='));
      if (lt === -1) return null;
      const lhs = this.exprConvert(cp.slice(0, lt));
      const rhs = this.exprConvert(cp.slice(lt + 1));
      if (lhs !== this.exprConvert(varToks)) return null;
      // update: var++ / var += 1
      const lastU = up[up.length - 1];
      let step = null;
      if (lastU && lastU.t === 'punct' && lastU.v === '++' && this.exprConvert(up.slice(0, -1)) === lhs) step = '1';
      if (step === null) {
        const pluseq = findTop(up, t => t.t === 'punct' && t.v === '+=');
        if (pluseq !== -1 && this.exprConvert(up.slice(0, pluseq)) === lhs) step = this.exprConvert(up.slice(pluseq + 1));
      }
      if (step === null) return null;
      const varName = this.exprConvert(varToks);
      if (cp[lt].v === '<' && step === '1') return [varName, `range(${startE}, ${rhs})`];
      return [varName, `_range_step(${startE}, ${rhs}${cp[lt].v === '<=' ? ' + 1' : ''}, ${step})`];
    }

    whileStmt(toks, depth) {
      const g = balancedFrom(toks, 1);
      this.emit(depth, 'while ' + this.exprConvert(g.inner) + ':');
      this.body(toks, g.end + 1, depth + 1);
    }

    doWhile(toks, depth) {
      this.warn('do...while became while True + conditional break.');
      const brace = toks.findIndex(t => t.t === 'punct' && t.v === '{');
      const g = balancedFrom(toks, brace);
      let w = g.end + 1;
      while (w < toks.length && !(toks[w].t === 'name' && toks[w].v === 'while')) w++;
      const cg = balancedFrom(toks, w + 1);
      this.emit(depth, 'while True:');
      this.statements(g.inner, depth + 1);
      this.emit(depth + 1, 'if ' + this.exprConvert(cg.inner) + ':');
      this.emit(depth + 2, 'break');
    }

    switchStmt(toks, depth) {
      const g = balancedFrom(toks, 1);
      const subj = this.exprConvert(g.inner);
      const brace = toks.findIndex((t, j) => j > g.end && t.t === 'punct' && t.v === '{');
      const body = balancedFrom(toks, brace).inner;
      this.warn('switch → if/elif chain; fall-through (missing break) is flattened — verify.');
      // partition into cases
      const cases = [];
      let cur = null;
      const flat = stripNL(body);
      for (let i = 0; i < flat.length; i++) {
        const t = flat[i];
        if (t.t === 'name' && t.v === 'case') {
          const colon = findTop(flat, x => x.t === 'punct' && x.v === ':', i + 1);
          cur = { label: this.exprConvert(flat.slice(i + 1, colon)), stmts: [] };
          cases.push(cur);
          i = colon;
          continue;
        }
        if (t.t === 'name' && t.v === 'default') {
          const colon = findTop(flat, x => x.t === 'punct' && x.v === ':', i + 1);
          cur = { label: null, stmts: [] };
          cases.push(cur);
          i = colon;
          continue;
        }
        if (cur) cur.stmts.push(t);
      }
      let first = true;
      for (const cs of cases) {
        const stmts = cs.stmts.slice();
        // remove break statements
        const cleaned = [];
        let sawBreak = false;
        // split by top-level break
        let buf = [];
        for (const t of stmts) {
          if (t.t === 'name' && t.v === 'break') { sawBreak = true; if (buf.length) cleaned.push(buf); buf = []; continue; }
          buf.push(t);
        }
        if (buf.length) cleaned.push(buf);
        const kw = first ? 'if' : 'elif'; first = false;
        if (cs.label === null) this.emit(depth, 'else:');
        else this.emit(depth, `${kw} ${subj} == ${cs.label}:`);
        const grp = cleaned[0] || [];
        if (grp.length) this.statements(grp, depth + 1); else this.emit(depth + 1, 'pass');
        if (cleaned.length > 1) this.warn('Multiple case sections merged; check fall-through logic.');
      }
      if (first) this.emit(depth, 'pass');
    }

    tryStmt(toks, depth) {
      this.emit(depth, 'try:');
      let i = this.body(toks, 1, depth + 1);
      while (i < toks.length && toks[i].t === 'name') {
        if (toks[i].v === 'catch') {
          let errName = 'err';
          let j = i + 1;
          if (toks[j] && toks[j].t === 'punct' && toks[j].v === '(') {
            const pg = balancedFrom(toks, j);
            if (pg.inner.length) errName = this.exprConvert(pg.inner);
            j = pg.end + 1;
          }
          this.warn('catch → except Exception; narrow the exception type where possible.');
          this.emit(depth, `except Exception as ${errName}:`);
          i = this.body(toks, j, depth + 1);
          continue;
        }
        if (toks[i].v === 'finally') {
          this.emit(depth, 'finally:');
          i = this.body(toks, i + 1, depth + 1);
          continue;
        }
        break;
      }
    }

    classDecl(toks, depth) {
      this.classesSeen = true;
      let i = 1;
      const name = toks[i] && toks[i].t === 'name' ? toks[i].v : 'MyClass';
      i++;
      let bases = '';
      if (toks[i] && toks[i].t === 'name' && toks[i].v === 'extends') {
        let btoks = []; i++;
        while (i < toks.length && !(toks[i].t === 'punct' && toks[i].v === '{')) { btoks.push(toks[i]); i++; }
        bases = '(' + this.exprConvert(btoks) + ')';
      }
      this.emit(depth, `class ${name}${bases}:`);
      const brace = toks.findIndex((t, j) => j >= i && t.t === 'punct' && t.v === '{');
      if (brace === -1) { this.emit(depth + 1, 'pass'); return; }
      const body = balancedFrom(toks, brace).inner;
      this.classBody(body, depth + 1);
    }

    classBody(toks, depth) {
      const flat = toks;
      let i = 0, any = false;
      while (i < flat.length) {
        const t = flat[i];
        if (t.t === 'nl' || (t.t === 'punct' && t.v === ';')) { i++; continue; }
        if (t.t === 'comment') { this.emit(depth, this.exprConvert([t])); i++; continue; }
        let isStatic = false, isAsync = false, accessor = null;
        if (t.t === 'name' && t.v === 'static') { isStatic = true; i++; continue; }
        if (t.t === 'name' && t.v === 'async') { isAsync = true; i++; continue; }
        if (t.t === 'name' && (t.v === 'get' || t.v === 'set') && flat[i + 1] && flat[i + 1].t === 'name' && !(flat[i + 2] && flat[i + 2].v === '(') === false) {
          accessor = t.v; i++; continue;
        }
        if (t.t === 'name' && flat[i + 1] && flat[i + 1].t === 'punct' && flat[i + 1].v === '(') {
          const mname = t.v === 'constructor' ? '__init__' : t.v;
          const pg = balancedFrom(flat, i + 1);
          const params = this.paramString(flat.slice(i + 1, pg.end + 1));
          const pr = params.slice(1, -1);
          let full;
          if (t.v === 'constructor') full = '(self' + (pr ? ', ' + pr : '') + ')';
          else if (isStatic) full = '(' + pr + ')';
          else full = '(self' + (pr ? ', ' + pr : '') + ')';
          if (accessor === 'get') this.emit(depth, '@property');
          if (isStatic) this.emit(depth, '@staticmethod');
          this.emit(depth, `${isAsync ? 'async ' : ''}def ${mname}${full}:`);
          let j = pg.end + 1;
          if (flat[j] && flat[j].t === 'punct' && flat[j].v === '{') {
            const bg = balancedFrom(flat, j);
            let binner = bg.inner;
            if (t.v === 'constructor') binner = this.fixSuper(binner);
            this.statements(binner, depth + 1);
            i = bg.end + 1;
          } else { this.emit(depth + 1, 'pass'); i = j; }
          any = true;
          continue;
        }
        // class field: name = value
        if (t.t === 'name') {
          let j = i, d = 0;
          while (j < flat.length) {
            const u = flat[j];
            if (u.t === 'punct') { if (OPEN[u.v]) d++; else if (')]}'.includes(u.v)) d--; }
            if (d === 0 && ((u.t === 'punct' && u.v === ';') || u.t === 'nl' || (u.t === 'punct' && u.v === '}'))) break;
            j++;
          }
          const seg = stripNL(flat.slice(i, j));
          const eq = findTop(seg, x => x.t === 'punct' && x.v === '=' && !(seg[x.__i + 1] && seg[x.__i + 1].v === '='));
          const eqIdx = (() => { let dd = 0; for (let k = 0; k < seg.length; k++) { const x = seg[k]; if (x.t === 'punct') { if (OPEN[x.v]) dd++; else if (')]}'.includes(x.v)) dd--; else if (x.v === '=' && dd === 0 && seg[k + 1] && seg[k + 1].v !== '=') return k; } } return -1; })();
          if (eqIdx !== -1) {
            const fname = this.exprConvert(seg.slice(0, eqIdx));
            const fval = this.exprConvert(seg.slice(eqIdx + 1));
            this.warn(`Class field "${fname}" was placed at class scope; move into __init__ if it must be per-instance.`);
            this.emit(depth, `${fname} = ${fval}`);
          }
          i = j;
          any = true;
          continue;
        }
        i++;
      }
      if (!any) this.emit(depth, 'pass');
    }

    fixSuper(inner) {
      const flat = stripNL(inner);
      const si = flat.findIndex(t => t.t === 'name' && t.v === 'super');
      if (si !== -1 && flat[si + 1] && flat[si + 1].v === '(') {
        const g = balancedFrom(flat, si + 1);
        return [...flat.slice(0, si), { t: 'name', v: 'super' }, { t: 'punct', v: '.' }, { t: 'name', v: '__init__' }, ...flat.slice(si + 1, g.end + 1), ...flat.slice(g.end + 1)];
      }
      return inner;
    }
  }

  function raw(toks) { return toks.map(t => t.v !== undefined ? t.v : '').join(' ').replace(/\s+/g, ' '); }

  /* ============================ Public API ========================== */
  const JS2PY = {
    version: '2.0',
    transpile(source) {
      const warnings = [];
      let code;
      try {
        const t = new Transpiler();
        const origWarn = t.warn.bind(t);
        t.warn = (m) => { origWarn(m); };
        code = t.run(source);
        warnings.push(...t.warnings);
        if (/\b_range_step\b/.test(code)) {
          code = code.replace(/\n\n\n/, '\n\n\ndef _range_step(start, stop, step):\n    """Helper for translated for-loops with custom steps."""\n    import itertools\n    return itertools.count(start, step) if step and start > stop else range(start, stop, step)\n\n');
        }
        // sanity: collapse triple blanks
        code = code.replace(/\n{4,}/g, '\n\n\n');
      } catch (e) {
        code = '# [XPDevs JS\u2192PY] Internal transpiler error: ' + (e && e.message ? e.message : String(e)) +
               '\n# Try simplifying the input (remove exotic syntax) and convert again.';
        warnings.push('The engine hit an internal error on this input; a best-effort fallback was produced.');
      }
      return { code, warnings };
    }
  };

  global.JS2PY = JS2PY;
})(typeof window !== 'undefined' ? window : globalThis);
