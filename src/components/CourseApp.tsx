'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CourseProvider, useCourse } from '@/context/CourseContext';
import ProgressBar from './ProgressBar';
import Header from './Header';
import Footer from './Footer';
import Landing from './Landing';
import ModuleRenderer from './ModuleRenderer';
import ExamView from './ExamView';
import Hub from './Hub';
import DiagnosticView from './DiagnosticView';
import TrainerView from './TrainerView';
import TinderView from './TinderView';
import StatsView from './StatsView';
import CheatsheetView from './CheatsheetView';
import { getModule, EXAM_MODULE_INDEX } from '@/content';

const SCROLL_KEY = 'uecon-scroll-positions';

function CourseContent() {
  const { view, currentModule } = useCourse();

  useEffect(() => {
    if (view !== 'course') {
      window.scrollTo(0, 0);
      return;
    }
    try {
      const positions = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}');
      const saved = positions[currentModule];
      if (saved !== undefined && saved > 0) {
        window.scrollTo(0, saved);
        const t = setTimeout(() => {
          if (window.scrollY < saved - 10) window.scrollTo(0, saved);
        }, 400);
        return () => clearTimeout(t);
      }
      window.scrollTo(0, 0);
    } catch {
      window.scrollTo(0, 0);
    }
  }, [view, currentModule]);

  let content: React.ReactNode;
  let key: string = view;

  if (view === 'hub') {
    content = <Hub />;
  } else if (view === 'course') {
    if (currentModule === 0) content = <Landing />;
    else if (currentModule === EXAM_MODULE_INDEX) content = <ExamView />;
    else {
      const m = getModule(currentModule);
      content = m ? <ModuleRenderer module={m} /> : <Landing />;
    }
    key = `course-${currentModule}`;
  } else if (view === 'diagnostic') {
    content = <DiagnosticView />;
  } else if (view === 'trainer') {
    content = <TrainerView />;
  } else if (view === 'tinder') {
    content = <TinderView />;
  } else if (view === 'stats') {
    content = <StatsView />;
  } else if (view === 'cheatsheet') {
    content = <CheatsheetView />;
  }

  return (
    <>
      {view === 'course' && <ProgressBar />}
      <Header />
      <main className="min-h-[calc(100vh-8rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}

export default function CourseApp() {
  return (
    <CourseProvider>
      <CourseContent />
    </CourseProvider>
  );
}
