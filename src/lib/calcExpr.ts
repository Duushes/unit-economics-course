// Безопасный вычислитель арифметических выражений для калькулятора тренажёра.
// Понимает + − × ÷ ( ) %, десятичную запятую и точку, пробелы-разряды. Без eval.

type Tok =
  | { kind: 'num'; value: number }
  | { kind: 'op'; op: '+' | '-' | '*' | '/' | 'neg' | 'pct' }
  | { kind: 'open' }
  | { kind: 'close' };

function tokenize(input: string): Tok[] | null {
  // Нормализация: типографские знаки → ASCII, запятая → точка, убрать пробелы (в т.ч. неразрывные).
  const s = input
    .replace(/[×·]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/,/g, '.')
    .replace(/[\s  ]/g, '');
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      if ((raw.match(/\./g) ?? []).length > 1) return null;
      const value = Number(raw);
      if (!Number.isFinite(value)) return null;
      toks.push({ kind: 'num', value });
      i = j;
      continue;
    }
    if (ch === '(') { toks.push({ kind: 'open' }); i++; continue; }
    if (ch === ')') { toks.push({ kind: 'close' }); i++; continue; }
    if (ch === '%') { toks.push({ kind: 'op', op: 'pct' }); i++; continue; }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      const prev = toks[toks.length - 1];
      const unaryPos = !prev || prev.kind === 'open' || (prev.kind === 'op' && prev.op !== 'pct');
      if (ch === '-' && unaryPos) toks.push({ kind: 'op', op: 'neg' });
      else if (ch === '+' && unaryPos) { /* унарный плюс — пропускаем */ }
      else toks.push({ kind: 'op', op: ch });
      i++;
      continue;
    }
    return null;
  }
  return toks;
}

// Рекурсивный спуск: expr → term (('+'|'-') term)*; term → post (('*'|'/') post)*;
// post → atom '%'*; atom → num | '(' expr ')' | 'neg' post.
export function evalExpr(input: string): number | null {
  const toks = tokenize(input);
  if (!toks || toks.length === 0) return null;
  let pos = 0;

  const atom = (): number | null => {
    const t = toks[pos];
    if (!t) return null;
    if (t.kind === 'num') { pos++; return t.value; }
    if (t.kind === 'open') {
      pos++;
      const v = expr();
      if (v === null || toks[pos]?.kind !== 'close') return null;
      pos++;
      return v;
    }
    if (t.kind === 'op' && t.op === 'neg') {
      pos++;
      const v = post();
      return v === null ? null : -v;
    }
    return null;
  };

  const post = (): number | null => {
    let v = atom();
    while (v !== null && toks[pos]?.kind === 'op' && (toks[pos] as { op: string }).op === 'pct') {
      pos++;
      v = v / 100;
    }
    return v;
  };

  const term = (): number | null => {
    let v = post();
    while (v !== null) {
      const t = toks[pos];
      if (t?.kind !== 'op' || (t.op !== '*' && t.op !== '/')) break;
      pos++;
      const r = post();
      if (r === null) return null;
      v = t.op === '*' ? v * r : v / r;
    }
    return v;
  };

  const expr = (): number | null => {
    let v = term();
    while (v !== null) {
      const t = toks[pos];
      if (t?.kind !== 'op' || (t.op !== '+' && t.op !== '-')) break;
      pos++;
      const r = term();
      if (r === null) return null;
      v = t.op === '+' ? v + r : v - r;
    }
    return v;
  };

  const result = expr();
  if (result === null || pos !== toks.length || !Number.isFinite(result)) return null;
  return result;
}
