'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse } from '@/context/CourseContext';

function hashKey(prefix: string, text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  }
  return `${prefix}-${(h >>> 0).toString(36)}`;
}

interface ScenarioOption {
  text: string;
  outcome: string;
  score: number;
}

interface ScenarioCardProps {
  scenario: string;
  context?: string;
  options: ScenarioOption[];
  onComplete?: (score: number) => void;
}

export default function ScenarioCard({ scenario, context, options, onComplete }: ScenarioCardProps) {
  const { saveAnswer, getAnswer } = useCourse();
  const key = hashKey('scenario', scenario);

  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const saved = getAnswer<{ selected: number }>(key);
    if (saved && saved.selected !== undefined) {
      setSelected(saved.selected);
    }
  }, [key, getAnswer]);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    saveAnswer(key, { selected: index });
    if (onComplete) onComplete(options[index].score);
  };

  return (
    <div className="my-8 p-6 rounded-xl border border-border/50 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
          <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="currentColor" />
        </svg>
        <span className="text-xs font-medium text-accent uppercase tracking-wider">Сценарий</span>
      </div>
      <p className="text-base font-medium mb-2">{scenario}</p>
      {context && (
        <p className="text-sm text-muted-foreground mb-4">{context}</p>
      )}
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-200
              ${selected === i ? 'border-accent bg-accent/5' : 'border-border/50'}
              ${selected !== null && selected !== i ? 'opacity-50' : ''}
              ${selected === null ? 'hover:border-accent/50 cursor-pointer' : 'cursor-default'}
              disabled:opacity-100`}
          >
            <span className="text-sm">{opt.text}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm">
              <p className="text-foreground">{options[selected].outcome}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
