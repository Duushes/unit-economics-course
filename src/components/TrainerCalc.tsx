'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { evalExpr } from '@/lib/calcExpr';
import { fmtNum } from './calculator/format';

const OPEN_KEY = 'uecon-trainer-calc-open';

// Число → строка для инпута: без потери точности, с запятой, без float-шума.
function toInputValue(n: number): string {
  const s = String(Number(n.toPrecision(12)));
  return s.includes('e') ? '' : s.replace('.', ',');
}

interface HistoryEntry {
  expr: string;
  result: number;
}

// Кнопочная раскладка: строки по 4 клавиши.
const KEYS: string[][] = [
  ['C', '(', ')', '⌫'],
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', ',', '%', '+'],
];

export default function TrainerCalc() {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOpen(localStorage.getItem(OPEN_KEY) === '1');
  }, []);

  const toggle = () => {
    const next = !open;
    localStorage.setItem(OPEN_KEY, next ? '1' : '0');
    setOpen(next);
  };

  const result = evalExpr(expr);

  const commit = () => {
    if (result === null || expr.trim() === '') return;
    setHistory((h) => [{ expr, result }, ...h].slice(0, 5));
    setExpr(toInputValue(result) || expr);
    inputRef.current?.focus();
  };

  const press = (key: string) => {
    if (key === 'C') setExpr('');
    else if (key === '⌫') setExpr((e) => e.slice(0, -1));
    else setExpr((e) => e + key);
    inputRef.current?.focus();
  };

  return (
    <div className="mt-4">
      <button
        onClick={toggle}
        className="text-xs text-accent hover:underline underline-offset-2 cursor-pointer"
        aria-expanded={open}
      >
        🧮 {open ? 'Скрыть калькулятор' : 'Калькулятор'}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl border border-border bg-card p-3 sm:max-w-xs">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={expr}
                  onChange={(e) => setExpr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === '=') {
                      e.preventDefault();
                      commit();
                    }
                  }}
                  placeholder="Например: 190/0,2"
                  inputMode="decimal"
                  className="flex-1 min-w-0 bg-muted rounded-lg px-2.5 py-1.5 text-sm tabular-nums outline-none focus:ring-1 focus:ring-accent/50"
                />
                <button
                  onClick={commit}
                  disabled={result === null}
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  =
                </button>
              </div>

              <div className="mt-1.5 h-5 text-sm tabular-nums text-muted-foreground" aria-live="polite">
                {expr.trim() !== '' && (result !== null ? `= ${fmtNum(result, 4)}` : 'ждём выражение…')}
              </div>

              <div className="grid grid-cols-4 gap-1 mt-1">
                {KEYS.flat().map((k) => (
                  <button
                    key={k}
                    onClick={() => press(k)}
                    className={`py-1.5 rounded-lg border text-sm tabular-nums cursor-pointer transition-colors ${
                      /[0-9,]/.test(k)
                        ? 'border-border/60 hover:border-accent/50'
                        : 'border-border/40 bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              {history.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {history.map((h, i) => (
                    <button
                      key={`${h.expr}-${i}`}
                      onClick={() => {
                        setExpr(toInputValue(h.result) || expr);
                        inputRef.current?.focus();
                      }}
                      title="Подставить результат"
                      className="block w-full text-left text-[11px] tabular-nums text-muted-foreground hover:text-foreground truncate cursor-pointer"
                    >
                      {h.expr} = {fmtNum(h.result, 4)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
