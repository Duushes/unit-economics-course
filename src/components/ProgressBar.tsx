'use client';

import { motion } from 'framer-motion';
import { useCourse } from '@/context/CourseContext';

export default function ProgressBar() {
  const { progress } = useCourse();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/50">
      <motion.div
        className="h-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}
