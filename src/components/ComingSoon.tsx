'use client';

import { useCourse } from '@/context/CourseContext';

export default function ComingSoon({ title, note }: { title: string; note?: string }) {
  const { setView } = useCourse();
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">{note ?? 'Раздел в разработке — скоро будет.'}</p>
      <button
        onClick={() => setView('hub')}
        className="px-5 py-2.5 bg-accent text-white text-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
      >
        ← На главную
      </button>
    </div>
  );
}
