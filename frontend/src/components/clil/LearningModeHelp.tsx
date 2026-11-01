"use client";
import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Locale } from '@/types/clil';
import { fadeBlock, reducedInstant } from '@/lib/learningMotion';

type LearningModeHelpProps = {
  labelsLocale: Locale;
};

export default function LearningModeHelp({ labelsLocale }: LearningModeHelpProps) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isEn = labelsLocale === 'en';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={isEn ? 'How CLIL reading modes work' : 'Giải thích các chế độ đọc CLIL'}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ? {isEn ? 'Mode guide' : 'Hướng dẫn chế độ'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={fadeBlock}
            initial={prefersReducedMotion ? { opacity: 0 } : 'initial'}
            animate={prefersReducedMotion ? { opacity: 1 } : 'animate'}
            exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
            transition={prefersReducedMotion ? reducedInstant : { duration: 0.12 }}
            className="mt-2 max-w-md rounded-xl border border-line-strong bg-surface p-3.5 text-xs leading-5 text-ink shadow-lg"
          >
            <ul className="space-y-1.5">
              <li>
                <strong className="font-semibold text-ink">
                  {isEn ? 'English Immersion:' : 'English Immersion (Đắm chìm):'}
                </strong>{' '}
                {isEn
                  ? 'Reads in English; click or press Enter on underlined terms when you want a definition.'
                  : 'Đọc hoàn toàn bằng tiếng Anh; bấm hoặc nhấn Enter vào thuật ngữ gạch chân khi cần xem định nghĩa.'}
              </li>
              <li>
                <strong className="font-semibold text-ink">
                  {isEn ? 'CLIL Assisted:' : 'CLIL Assisted (Trợ giúp):'}
                </strong>{' '}
                {isEn
                  ? 'Hover, focus, or tap terms and VI phrase chips for instant bilingual scaffolding.'
                  : 'Rê chuột, focus hoặc chạm vào thuật ngữ và nút VI để xem trợ giúp song ngữ ngay tại chỗ.'}
              </li>
              <li>
                <strong className="font-semibold text-ink">
                  {isEn ? 'Side-by-Side:' : 'Side-by-Side (Song ngữ):'}
                </strong>{' '}
                {isEn
                  ? 'Displays aligned English and Vietnamese paragraphs together.'
                  : 'Hiển thị song song từng đoạn tiếng Anh và tiếng Việt tương ứng.'}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

