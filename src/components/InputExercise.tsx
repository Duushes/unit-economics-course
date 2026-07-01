'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse } from '@/context/CourseContext';

function hashKey(prefix: string, text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  }
  return `${prefix}-${(h >>> 0).toString(36)}`;
}

interface InputExerciseProps {
  prompt: string;
  placeholder?: string;
  hint?: string;
  validate?: (value: string) => boolean;
  successMessage?: string;
  exampleAnswer?: string;
  onComplete?: () => void;
}

export default function InputExercise({
  prompt,
  placeholder = 'Введите ответ...',
  hint,
  validate,
  successMessage = 'Отличный ответ!',
  exampleAnswer,
  onComplete,
}: InputExerciseProps) {
  const { saveAnswer, getAnswer } = useCourse();
  const key = hashKey('input', prompt);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = getAnswer<{ value: string; submitted: boolean }>(key);
    if (saved) {
      if (saved.value !== undefined) setValue(saved.value);
      if (saved.submitted) setSubmitted(true);
    }
  }, [key, getAnswer]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveAnswer(key, { value: newValue, submitted: false });
    }, 500);
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    setSubmitted(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    saveAnswer(key, { value, submitted: true });
    if (onComplete) onComplete();
  };

  const isValid = validate ? validate(value) : value.trim().length > 0;

  return (
    <div className="my-8">
      <p className="text-base font-medium mb-3">{prompt}</p>
      {hint && <p className="text-sm text-muted-foreground mb-3">{hint}</p>}
      <div className="flex flex-col gap-3">
        <textarea
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={submitted}
          rows={3}
          className="w-full p-4 rounded-lg border border-border/50 bg-card text-sm resize-none
            focus:outline-none focus:border-accent/50 transition-colors
            disabled:opacity-70"
        />
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="self-start px-4 py-2 bg-accent text-white text-sm rounded-lg
              hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Отправить
          </button>
        )}
      </div>
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 p-4 rounded-lg bg-success/10 text-sm"
          >
            <p className="text-success font-medium">{successMessage}</p>
            {exampleAnswer && (
              <p className="text-muted-foreground mt-2">
                <span className="font-medium">Пример ответа:</span> {exampleAnswer}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
