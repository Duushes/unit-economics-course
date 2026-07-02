'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export interface DeckCard {
  id: string;
}

interface Props<T extends DeckCard> {
  cards: T[];
  renderCard: (card: T) => React.ReactNode;
  leftLabel: string;
  rightLabel: string;
  onSwipe: (card: T, dir: 'left' | 'right') => void;
  onDone?: () => void;
  doneNode?: React.ReactNode;
}

export default function SwipeDeck<T extends DeckCard>({
  cards,
  renderCard,
  leftLabel,
  rightLabel,
  onSwipe,
  onDone,
  doneNode,
}: Props<T>) {
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-11, 11]);
  const leftGlow = useTransform(x, [-120, -10], [1, 0]);
  const rightGlow = useTransform(x, [10, 120], [0, 1]);

  const current = cards[index];
  const next = cards[index + 1];

  const commit = (dir: 'left' | 'right') => {
    if (!current) return;
    onSwipe(current, dir);
    const ni = index + 1;
    setIndex(ni);
    x.set(0);
    if (ni >= cards.length) onDone?.();
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 110) commit('right');
    else if (info.offset.x < -110) commit('left');
    else animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
  };

  if (!current) {
    return (
      <div className="text-center py-12">
        {doneNode ?? <p className="text-muted-foreground">Колода пройдена 🎉</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center text-xs text-muted-foreground mb-3">
        {index + 1} / {cards.length}
      </div>

      <div className="relative h-[340px]">
        {next && (
          <div className="absolute inset-0 scale-[0.96] translate-y-2 opacity-60 pointer-events-none">
            <div className="h-full rounded-2xl border border-border bg-card p-6">{renderCard(next)}</div>
          </div>
        )}

        <motion.div
          key={current.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate }}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <div className="relative h-full rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden">
            <motion.div
              style={{ opacity: leftGlow }}
              className="absolute top-4 right-4 px-2 py-1 rounded-md border-2 border-error text-error text-xs font-bold rotate-12"
            >
              {leftLabel}
            </motion.div>
            <motion.div
              style={{ opacity: rightGlow }}
              className="absolute top-4 left-4 px-2 py-1 rounded-md border-2 border-success text-success text-xs font-bold -rotate-12"
            >
              {rightLabel}
            </motion.div>
            {renderCard(current)}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-4 mt-5">
        <button
          onClick={() => commit('left')}
          className="px-5 py-2.5 rounded-xl border border-error/40 text-error text-sm font-medium hover:bg-error/5 transition-colors cursor-pointer"
        >
          ← {leftLabel}
        </button>
        <button
          onClick={() => commit('right')}
          className="px-5 py-2.5 rounded-xl border border-success/40 text-success text-sm font-medium hover:bg-success/5 transition-colors cursor-pointer"
        >
          {rightLabel} →
        </button>
      </div>
    </div>
  );
}
