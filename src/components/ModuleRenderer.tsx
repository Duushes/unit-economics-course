'use client';

import React from 'react';
import ModuleWrapper from './ModuleWrapper';
import Quiz from './Quiz';
import DragDrop from './DragDrop';
import InputExercise from './InputExercise';
import ScenarioCard from './ScenarioCard';
import UnitEconCalculator from './calculator/UnitEconCalculator';
import type { ContentBlock, Module } from '@/content/types';

// --- мини-разметка: **жирный**, `код` ---
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      nodes.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    } else {
      nodes.push(
        <code key={k++} className="px-1 py-0.5 rounded bg-muted text-[0.85em] font-mono">
          {tok.slice(1, -1)}
        </code>
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderText(md: string) {
  const lines = md.split('\n').filter((l) => l.trim().length > 0);
  return lines.map((line, i) => {
    if (line.trim().startsWith('- ')) {
      return (
        <div key={i} className="flex gap-2 my-1">
          <span className="text-accent mt-0.5">•</span>
          <span className="flex-1">{renderInline(line.trim().slice(2))}</span>
        </div>
      );
    }
    return (
      <p key={i} className="my-3 text-[15px] leading-relaxed text-foreground/90">
        {renderInline(line)}
      </p>
    );
  });
}

const CASE_META: Record<string, { label: string; cls: string }> = {
  rovers: { label: 'Роверы · capacity', cls: 'bg-accent/10 text-accent border-accent/30' },
  raas: { label: 'RaaS · acquisition', cls: 'bg-warning/10 text-warning border-warning/30' },
};

const CALLOUT_META: Record<string, { cls: string; label?: string }> = {
  tip: { cls: 'bg-accent/5 border-accent/30', label: 'Подсказка' },
  warn: { cls: 'bg-error/5 border-error/30', label: 'Осторожно' },
  illustrative: { cls: 'bg-muted/50 border-border', label: 'Цифры иллюстративные' },
  info: { cls: 'bg-muted/40 border-border', label: undefined },
};

function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'text':
      return <div>{renderText(block.md)}</div>;

    case 'heading':
      return <h3 className="text-lg font-semibold mt-8 mb-2">{block.text}</h3>;

    case 'formula':
      return (
        <div className="my-5">
          <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 text-sm font-mono whitespace-pre-wrap">
            {block.expr}
          </pre>
          {block.caption && <p className="text-xs text-muted-foreground mt-1.5">{block.caption}</p>}
        </div>
      );

    case 'table':
      return (
        <div className="my-5 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left font-semibold p-2 text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/40">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-2 align-top">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && <p className="text-xs text-muted-foreground mt-1.5">{block.caption}</p>}
        </div>
      );

    case 'callout': {
      const meta = CALLOUT_META[block.tone];
      return (
        <div className={`my-5 rounded-xl border p-4 ${meta.cls}`}>
          {meta.label && (
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              {meta.label}
            </div>
          )}
          <div className="text-sm">{renderText(block.md)}</div>
        </div>
      );
    }

    case 'case': {
      const meta = CASE_META[block.tag];
      return (
        <div className="my-5 rounded-xl border border-border bg-card p-4">
          <div className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border mb-2 ${meta.cls}`}>
            {meta.label}
          </div>
          {block.title && <div className="font-semibold mb-1">{block.title}</div>}
          <div className="text-sm">{renderText(block.md)}</div>
        </div>
      );
    }

    case 'calc':
      return <UnitEconCalculator mode={block.mode} preset={block.presetId} title={block.title} />;

    case 'quiz':
      return <Quiz question={block.question} options={block.options} />;

    case 'dragdrop':
      return <DragDrop instruction={block.instruction} items={block.items} zones={block.zones} />;

    case 'input': {
      const ans = block.answer;
      const tol = block.tolerance ?? 0;
      const validate =
        ans !== undefined
          ? (s: string) => {
              const n = parseFloat(s.replace(',', '.').replace(/[^\d.\-]/g, ''));
              return Number.isFinite(n) && Math.abs(n - ans) <= tol;
            }
          : undefined;
      return (
        <InputExercise
          prompt={block.prompt}
          hint={block.hint}
          validate={validate}
          successMessage={block.successMessage}
          exampleAnswer={block.exampleAnswer}
        />
      );
    }

    case 'scenario':
      return <ScenarioCard scenario={block.scenario} context={block.context} options={block.options} />;

    default:
      return null;
  }
}

export default function ModuleRenderer({ module }: { module: Module }) {
  return (
    <ModuleWrapper
      moduleIndex={module.index}
      title={module.title}
      subtitle={module.subtitle}
      readingList={module.readingList}
    >
      {/* Цель и результаты модуля */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-accent mb-1">Цель модуля</div>
        <p className="text-sm mb-3">{module.goal}</p>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
          После модуля вы сможете
        </div>
        <ul className="space-y-1">
          {module.outcomes.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-success mt-0.5">✓</span>
              <span className="flex-1">{o}</span>
            </li>
          ))}
        </ul>
      </div>

      {module.lessons.map((lesson) => (
        <section key={lesson.id} className="mb-10">
          <h2 className="text-xl font-bold mb-1 pb-2 border-b border-border/50">{lesson.title}</h2>
          {lesson.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}
    </ModuleWrapper>
  );
}
