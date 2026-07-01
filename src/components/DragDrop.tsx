'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse } from '@/context/CourseContext';

function hashKey(prefix: string, text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  }
  return `${prefix}-${(h >>> 0).toString(36)}`;
}

interface DragItem {
  id: string;
  text: string;
}

interface DropZone {
  id: string;
  label: string;
  acceptIds: string[];
}

interface DragDropProps {
  instruction: string;
  items: DragItem[];
  zones: DropZone[];
  onComplete?: () => void;
}

export default function DragDrop({ instruction, items, zones, onComplete }: DragDropProps) {
  const { saveAnswer, getAnswer } = useCourse();
  const key = hashKey('dragdrop', instruction);

  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  useEffect(() => {
    const saved = getAnswer<{ placed: Record<string, string>; checked: boolean; allCorrect: boolean }>(key);
    if (saved) {
      if (saved.placed) setPlaced(saved.placed);
      if (saved.checked) {
        setChecked(true);
        setAllCorrect(saved.allCorrect ?? false);
      }
    }
  }, [key, getAnswer]);

  const unplacedItems = items.filter(item => !Object.values(placed).includes(item.id));

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDrop = useCallback((zoneId: string) => {
    if (!draggedItem) return;
    setPlaced(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (next[key] === draggedItem) delete next[key];
      });
      next[zoneId] = draggedItem;
      saveAnswer(key, { placed: next, checked: false, allCorrect: false });
      return next;
    });
    setDraggedItem(null);
    setChecked(false);
  }, [draggedItem, key, saveAnswer]);

  const handleRemove = (zoneId: string) => {
    if (checked) return;
    setPlaced(prev => {
      const next = { ...prev };
      delete next[zoneId];
      saveAnswer(key, { placed: next, checked: false, allCorrect: false });
      return next;
    });
  };

  const handleCheck = () => {
    setChecked(true);
    const correct = zones.every(zone => {
      const placedItem = placed[zone.id];
      return placedItem && zone.acceptIds.includes(placedItem);
    });
    setAllCorrect(correct);
    saveAnswer(key, { placed, checked: true, allCorrect: correct });
    if (correct && onComplete) onComplete();
  };

  const handleClickPlace = (itemId: string) => {
    if (checked) return;
    const emptyZone = zones.find(z => !placed[z.id]);
    if (emptyZone) {
      const next = { ...placed, [emptyZone.id]: itemId };
      setPlaced(next);
      setChecked(false);
      saveAnswer(key, { placed: next, checked: false, allCorrect: false });
    }
  };

  return (
    <div className="my-8">
      <p className="text-base font-medium mb-4">{instruction}</p>

      <div className="flex flex-wrap gap-2 mb-6 min-h-[44px]">
        {unplacedItems.map(item => (
          <motion.button
            key={item.id}
            layout
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onClick={() => handleClickPlace(item.id)}
            className="px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-md border border-accent/20
              cursor-grab active:cursor-grabbing hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.text}
          </motion.button>
        ))}
      </div>

      <div className="space-y-3">
        {zones.map(zone => {
          const placedItem = items.find(i => i.id === placed[zone.id]);
          const isCorrectPlacement = checked && placedItem && zone.acceptIds.includes(placedItem.id);
          const isWrongPlacement = checked && placedItem && !zone.acceptIds.includes(placedItem.id);

          return (
            <div
              key={zone.id}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(zone.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-all duration-200
                ${!placedItem ? 'border-border/50 bg-muted/30' : ''}
                ${isCorrectPlacement ? 'border-success bg-success/5' : ''}
                ${isWrongPlacement ? 'border-error bg-error/5' : ''}
                ${placedItem && !checked ? 'border-accent/30 bg-accent/5' : ''}
              `}
            >
              <span className="text-sm text-muted-foreground min-w-[120px]">{zone.label}</span>
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {placedItem ? (
                    <motion.button
                      key={placedItem.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => handleRemove(zone.id)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors
                        ${checked ? 'cursor-default' : 'cursor-pointer hover:opacity-70'}
                        ${isCorrectPlacement ? 'bg-success/20 text-success' : ''}
                        ${isWrongPlacement ? 'bg-error/20 text-error' : ''}
                        ${!checked ? 'bg-accent/10 text-accent' : ''}
                      `}
                    >
                      {placedItem.text}
                    </motion.button>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">Перетащите сюда</span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {!checked && Object.keys(placed).length === zones.length && (
          <button
            onClick={handleCheck}
            className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Проверить
          </button>
        )}
        {checked && !allCorrect && (
          <button
            onClick={() => {
              setPlaced({});
              setChecked(false);
              setAllCorrect(false);
              saveAnswer(key, { placed: {}, checked: false, allCorrect: false });
            }}
            className="px-4 py-2 bg-muted text-foreground text-sm rounded-lg hover:bg-card-hover transition-colors cursor-pointer"
          >
            Попробовать снова
          </button>
        )}
        {checked && (
          <span className={`text-sm ${allCorrect ? 'text-success' : 'text-error'}`}>
            {allCorrect ? 'Отлично! Все верно.' : 'Есть ошибки. Попробуйте ещё раз.'}
          </span>
        )}
      </div>
    </div>
  );
}
