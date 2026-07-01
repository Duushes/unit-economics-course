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
import { getModule, EXAM_MODULE_INDEX } from '@/content';

const SCROLL_KEY = 'uecon-scroll-positions';

function CourseContent() {
  const { currentModule } = useCourse();

  useEffect(() => {
    try {
      const positions = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}');
      const saved = positions[currentModule];
      if (saved !== undefined && saved > 0) {
        window.scrollTo(0, saved);
        const timer = setTimeout(() => {
          if (window.scrollY < saved - 10) window.scrollTo(0, saved);
        }, 400);
        return () => clearTimeout(timer);
      } else {
        window.scrollTo(0, 0);
      }
    } catch {
      window.scrollTo(0, 0);
    }
  }, [currentModule]);

  let content: React.ReactNode;
  if (currentModule === 0) {
    content = <Landing />;
  } else if (currentModule === EXAM_MODULE_INDEX) {
    content = <ExamView />;
  } else {
    const m = getModule(currentModule);
    content = m ? <ModuleRenderer module={m} /> : <Landing />;
  }

  return (
    <>
      <ProgressBar />
      <Header />
      <main className="min-h-[calc(100vh-8rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentModule}
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
