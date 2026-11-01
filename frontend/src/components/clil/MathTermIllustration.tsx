"use client";
import React from 'react';
import type { IllustrationKey, Locale } from '@/types/clil';

type MathTermIllustrationProps = {
  illustrationKey?: IllustrationKey;
  locale?: Locale;
};

export default function MathTermIllustration({
  illustrationKey,
  locale = 'vi',
}: MathTermIllustrationProps) {
  if (!illustrationKey) return null;

  const isEn = locale === 'en';

  if (illustrationKey === 'set-elements') {
    const caption = isEn
      ? 'Set A containing elements 2, 4, and 6'
      : 'Tập hợp A chứa các phần tử 2, 4 và 6';
    return (
      <figure className="mt-2.5 flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-ink">
        <svg
          width="112"
          height="76"
          viewBox="0 0 112 76"
          className="max-w-full shrink-0 text-ink"
          role="img"
          aria-label={caption}
        >
          <ellipse
            cx="56"
            cy="40"
            rx="46"
            ry="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <text x="14" y="18" fontSize="11" fontWeight="700" fill="currentColor">
            A
          </text>
          <circle cx="34" cy="38" r="3" fill="#d97757" />
          <text x="29" y="53" fontSize="11" fill="currentColor">
            2
          </text>
          <circle cx="56" cy="34" r="3" fill="#d97757" />
          <text x="52" y="49" fontSize="11" fill="currentColor">
            4
          </text>
          <circle cx="78" cy="40" r="3" fill="#d97757" />
          <text x="74" y="55" fontSize="11" fill="currentColor">
            6
          </text>
        </svg>
        <figcaption className="text-xs leading-5 text-muted">
          {caption}
        </figcaption>
      </figure>
    );
  }

  if (illustrationKey === 'membership') {
    const caption = isEn
      ? '4 belongs to A (4 ∈ A); 5 is outside A (5 ∉ A)'
      : '4 thuộc A (4 ∈ A); 5 nằm ngoài A (5 ∉ A)';
    return (
      <figure className="mt-2.5 flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-ink">
        <svg
          width="112"
          height="76"
          viewBox="0 0 112 76"
          className="max-w-full shrink-0 text-ink"
          role="img"
          aria-label={caption}
        >
          <ellipse
            cx="44"
            cy="40"
            rx="34"
            ry="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <text x="12" y="18" fontSize="11" fontWeight="700" fill="currentColor">
            A
          </text>
          <circle cx="42" cy="38" r="3.5" fill="#7f8f6f" />
          <text x="30" y="54" fontSize="10.5" fill="currentColor">
            4 ∈ A
          </text>
          <circle cx="94" cy="36" r="3.5" fill="#d97757" />
          <text x="80" y="54" fontSize="10.5" fill="currentColor">
            5 ∉ A
          </text>
        </svg>
        <figcaption className="text-xs leading-5 text-muted">
          {caption}
        </figcaption>
      </figure>
    );
  }

  if (illustrationKey === 'empty-set') {
    const caption = isEn
      ? 'Empty set ∅ contains 0 elements inside its boundary'
      : 'Tập hợp rỗng ∅ không có phần tử nào bên trong';
    return (
      <figure className="mt-2.5 flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-ink">
        <svg
          width="112"
          height="76"
          viewBox="0 0 112 76"
          className="max-w-full shrink-0 text-ink"
          role="img"
          aria-label={caption}
        >
          <ellipse
            cx="56"
            cy="38"
            rx="38"
            ry="23"
            fill="none"
            stroke="currentColor"
            strokeDasharray="4 3"
            strokeWidth="1.75"
          />
          <text x="48" y="43" fontSize="16" fontWeight="700" fill="#d97757">
            ∅
          </text>
        </svg>
        <figcaption className="text-xs leading-5 text-muted">
          {caption}
        </figcaption>
      </figure>
    );
  }

  return null;
}

