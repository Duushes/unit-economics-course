'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleWrapper from './ModuleWrapper';
import Confetti from './Confetti';
import { EXAM, EXAM_PASS_SCORE } from '@/content/exam';
import { useCourse } from '@/context/CourseContext';

export default function ExamView() {
  const { setExamScore } = useCourse();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = EXAM.reduce((acc, q) => {
    const sel = answers[q.id];
    return acc + (sel !== undefined && q.options[sel]?.correct ? 1 : 0);
  }, 0);
  const passed = score >= EXAM_PASS_SCORE;
  const allAnswered = Object.keys(answers).length === EXAM.length;

  const handleSelect = (qid: string, i: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: i }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setExamScore(score);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ModuleWrapper moduleIndex={9} title="Финальный экзамен" subtitle="15 вопросов по обеим парадигмам. Порог — 11 из 15.">
      <Confetti active={submitted && passed} />

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 rounded-2xl border p-6 text-center ${passed ? 'border-success/40 bg-success/5' : 'border-error/40 bg-error/5'}`}
          >
            <div className="text-4xl font-bold tabular-nums">{score} / {EXAM.length}</div>
            <p className={`mt-2 font-medium ${passed ? 'text-success' : 'text-error'}`}>
              {passed ? 'Поздравляем — курс пройден! Вы владеете обеими парадигмами юнит-экономики.' : `Чуть-чуть не хватило. Нужно ${EXAM_PASS_SCORE}+ из ${EXAM.length}.`}
            </p>
            {!passed && (
              <button
                onClick={handleRetry}
                className="mt-4 px-5 py-2 bg-accent text-white text-sm rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Пройти заново
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {EXAM.map((q) => {
          const sel = answers[q.id];
          return (
            <div key={q.id} className="rounded-xl border border-border/50 bg-card p-5">
              <p className="text-base font-medium mb-3">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  let cls = 'border-border/50';
                  if (submitted) {
                    if (opt.correct) cls = 'border-success bg-success/5';
                    else if (i === sel) cls = 'border-error bg-error/5';
                  } else if (i === sel) {
                    cls = 'border-accent bg-accent/5';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(q.id, i)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${cls} ${!submitted ? 'cursor-pointer hover:border-accent/50' : 'cursor-default'}`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {q.options.find((o) => o.correct)?.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="mt-6 px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allAnswered ? 'Завершить экзамен' : `Ответьте на все вопросы (${Object.keys(answers).length}/${EXAM.length})`}
        </button>
      )}
    </ModuleWrapper>
  );
}
