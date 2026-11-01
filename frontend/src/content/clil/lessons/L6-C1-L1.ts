import type { ClilLessonManifest, Review } from '@/types/clil';

const REVIEWED: Review = {
  status: 'reviewed',
  revision: '2026-10-30.1',
  reviewerRef: 'bingmath-clil-editorial',
};

export const L6_C1_L1_MANIFEST: ClilLessonManifest = {
  lessonId: 'L6-C1-L1',
  contentVersion: '2026-10-30.v1',
  chapterSegmentId: 'meta.chapter',
  titleSegmentId: 'meta.title',
  objectiveSegmentIds: ['obj.1', 'obj.2'],
  navItems: [
    { id: 'w', icon: '🚀', segmentId: 'nav.w' },
    { id: 'k1', icon: '📖', segmentId: 'nav.k1' },
    { id: 'k2', icon: '📖', segmentId: 'nav.k2' },
    { id: 'k3', icon: '📖', segmentId: 'nav.k3' },
    { id: 'miniGame', icon: '🎮', segmentId: 'nav.miniGame' },
    { id: 'trans', icon: '🌐', segmentId: 'nav.trans' },
  ],
  sections: [
    {
      id: 'w',
      icon: '🚀',
      headingSegmentId: 'sec.w.heading',
      bodySegmentIds: ['sec.w.body'],
      calloutTitleSegmentId: 'sec.w.callout.title',
      calloutSegmentId: 'sec.w.callout.body',
    },
    {
      id: 'k1',
      icon: '📖',
      headingSegmentId: 'sec.k1.heading',
      bodySegmentIds: ['sec.k1.body'],
    },
    {
      id: 'k2',
      icon: '📖',
      headingSegmentId: 'sec.k2.heading',
      bodySegmentIds: ['sec.k2.body'],
    },
    {
      id: 'k3',
      icon: '📖',
      headingSegmentId: 'sec.k3.heading',
      bodySegmentIds: ['sec.k3.body'],
    },
  ],
  termIds: [
    'set',
    'element',
    'empty-set',
    'membership',
    'natural-numbers',
    'characteristic-property',
  ],
  questions: [
    {
      questionId: 'mc-1',
      questionVersion: '2026-10-30.v1',
      kind: 'mc',
      promptSegmentId: 'q.mc1.prompt',
      options: [
        { optionId: 'opt-0', segmentId: 'q.mc1.opt0' },
        { optionId: 'opt-1', segmentId: 'q.mc1.opt1' },
        { optionId: 'opt-2', segmentId: 'q.mc1.opt2' },
        { optionId: 'opt-3', segmentId: 'q.mc1.opt3' },
      ],
      feedbackSegmentIds: ['q.mc1.ex'],
    },
    {
      questionId: 'mc-2',
      questionVersion: '2026-10-30.v1',
      kind: 'mc',
      promptSegmentId: 'q.mc2.prompt',
      options: [
        { optionId: 'opt-0', segmentId: 'q.mc2.opt0' },
        { optionId: 'opt-1', segmentId: 'q.mc2.opt1' },
        { optionId: 'opt-2', segmentId: 'q.mc2.opt2' },
        { optionId: 'opt-3', segmentId: 'q.mc2.opt3' },
      ],
      feedbackSegmentIds: ['q.mc2.ex'],
    },
    {
      questionId: 'tf-1',
      questionVersion: '2026-10-30.v1',
      kind: 'tf',
      promptSegmentId: 'q.tf1.prompt',
      feedbackSegmentIds: ['q.tf1.ex'],
    },
    {
      questionId: 'f1',
      questionVersion: '2026-10-30.v1',
      kind: 'fill',
      promptSegmentId: 'q.f1.prompt',
      hintSegmentId: 'q.f1.hint',
    },
  ],
  segments: {
    'meta.chapter': {
      id: 'meta.chapter',
      role: 'title',
      en: [{ kind: 'text', text: 'Chapter 1 · Grade 6' }],
      vi: [{ kind: 'text', text: 'Chương 1 · Lớp 6' }],
      review: REVIEWED,
    },
    'meta.title': {
      id: 'meta.title',
      role: 'title',
      en: [
        { kind: 'text', text: 'Lesson 1: Introduction to ' },
        { kind: 'term', termId: 'set', surface: 'Sets' },
      ],
      vi: [
        { kind: 'text', text: 'Bài 1: ' },
        { kind: 'term', termId: 'set', surface: 'Tập Hợp' },
      ],
      review: REVIEWED,
    },
    'obj.1': {
      id: 'obj.1',
      role: 'objective',
      en: [
        {
          kind: 'phrase',
          phraseId: 'obj1-p1',
          children: [
            { kind: 'text', text: 'Understand the core concept of a ' },
            { kind: 'term', termId: 'set', surface: 'set' },
            { kind: 'text', text: ' and its ' },
            { kind: 'term', termId: 'element', surface: 'elements' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'obj1-p1',
          children: [
            { kind: 'text', text: 'Hiểu khái niệm trọng tâm về ' },
            { kind: 'term', termId: 'set', surface: 'tập hợp' },
            { kind: 'text', text: ' và các ' },
            { kind: 'term', termId: 'element', surface: 'phần tử' },
            { kind: 'text', text: ' của tập hợp.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'obj.2': {
      id: 'obj.2',
      role: 'objective',
      en: [
        {
          kind: 'phrase',
          phraseId: 'obj2-p1',
          children: [
            { kind: 'text', text: 'Practice interactive exercises using ' },
            { kind: 'term', termId: 'membership', surface: 'membership' },
            { kind: 'text', text: ' notation.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'obj2-p1',
          children: [
            { kind: 'text', text: 'Luyện tập bài tập tương tác với kí hiệu ' },
            { kind: 'term', termId: 'membership', surface: 'thuộc và không thuộc' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'nav.w': {
      id: 'nav.w',
      role: 'title',
      en: [{ kind: 'text', text: 'Warm-up' }],
      vi: [{ kind: 'text', text: 'Khởi động' }],
      review: REVIEWED,
    },
    'nav.k1': {
      id: 'nav.k1',
      role: 'title',
      en: [{ kind: 'text', text: '1. Concept' }],
      vi: [{ kind: 'text', text: '1. Khái niệm' }],
      review: REVIEWED,
    },
    'nav.k2': {
      id: 'nav.k2',
      role: 'title',
      en: [{ kind: 'text', text: '2. Details' }],
      vi: [{ kind: 'text', text: '2. Chi tiết' }],
      review: REVIEWED,
    },
    'nav.k3': {
      id: 'nav.k3',
      role: 'title',
      en: [{ kind: 'text', text: '3. Applications' }],
      vi: [{ kind: 'text', text: '3. Ứng dụng' }],
      review: REVIEWED,
    },
    'nav.miniGame': {
      id: 'nav.miniGame',
      role: 'title',
      en: [{ kind: 'text', text: 'Practice' }],
      vi: [{ kind: 'text', text: 'Luyện tập' }],
      review: REVIEWED,
    },
    'nav.trans': {
      id: 'nav.trans',
      role: 'title',
      en: [{ kind: 'text', text: 'Glossary' }],
      vi: [{ kind: 'text', text: 'Từ điển' }],
      review: REVIEWED,
    },
    'sec.w.heading': {
      id: 'sec.w.heading',
      role: 'title',
      en: [{ kind: 'text', text: 'Warm-Up' }],
      vi: [{ kind: 'text', text: 'Khởi động' }],
      review: REVIEWED,
    },
    'sec.w.body': {
      id: 'sec.w.body',
      role: 'theory',
      en: [
        {
          kind: 'phrase',
          phraseId: 'w-p1',
          children: [
            { kind: 'text', text: 'When you place school items on the table: pens, books, rulers, they form a ' },
            { kind: 'term', termId: 'set', surface: 'set' },
            { kind: 'text', text: '. ' },
          ],
        },
        {
          kind: 'phrase',
          phraseId: 'w-p2',
          children: [
            { kind: 'text', text: 'What is a ' },
            { kind: 'term', termId: 'set', surface: 'set' },
            { kind: 'text', text: "? Let's find out!" },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'w-p1',
          children: [
            { kind: 'text', text: 'Khi bạn xếp các đồ dùng học tập lên bàn: bút, sách, thước, chúng tạo thành một ' },
            { kind: 'term', termId: 'set', surface: 'tập hợp' },
            { kind: 'text', text: '. ' },
          ],
        },
        {
          kind: 'phrase',
          phraseId: 'w-p2',
          children: [
            { kind: 'term', termId: 'set', surface: 'Tập hợp' },
            { kind: 'text', text: ' là gì? Hãy cùng khám phá!' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'sec.w.callout.title': {
      id: 'sec.w.callout.title',
      role: 'title',
      en: [{ kind: 'text', text: 'Think about it' }],
      vi: [{ kind: 'text', text: 'Hãy suy nghĩ' }],
      review: REVIEWED,
    },
    'sec.w.callout.body': {
      id: 'sec.w.callout.body',
      role: 'theory',
      en: [
        {
          kind: 'phrase',
          phraseId: 'w-c1',
          children: [
            { kind: 'text', text: 'Is a group of students taller than 1.50m a ' },
            { kind: 'term', termId: 'set', surface: 'set' },
            { kind: 'text', text: '?' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'w-c1',
          children: [
            { kind: 'text', text: 'Một nhóm các học sinh cao trên 1m50 có phải là một ' },
            { kind: 'term', termId: 'set', surface: 'tập hợp' },
            { kind: 'text', text: ' không?' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'sec.k1.heading': {
      id: 'sec.k1.heading',
      role: 'title',
      en: [
        { kind: 'text', text: '1. Definition of a ' },
        { kind: 'term', termId: 'set', surface: 'Set' },
      ],
      vi: [
        { kind: 'text', text: '1. Khái niệm ' },
        { kind: 'term', termId: 'set', surface: 'tập hợp' },
      ],
      review: REVIEWED,
    },
    'sec.k1.body': {
      id: 'sec.k1.body',
      role: 'theory',
      en: [
        {
          kind: 'phrase',
          phraseId: 'k1-p1',
          children: [
            { kind: 'text', text: 'A ' },
            { kind: 'term', termId: 'set', surface: 'set' },
            { kind: 'text', text: ' is a well-defined collection of objects. ' },
          ],
        },
        {
          kind: 'phrase',
          phraseId: 'k1-p2',
          children: [
            { kind: 'text', text: 'Each object is called an ' },
            { kind: 'term', termId: 'element', surface: 'element' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'k1-p1',
          children: [
            { kind: 'term', termId: 'set', surface: 'Tập hợp' },
            { kind: 'text', text: ' là nhóm các đối tượng được xác định rõ ràng. ' },
          ],
        },
        {
          kind: 'phrase',
          phraseId: 'k1-p2',
          children: [
            { kind: 'text', text: 'Mỗi đối tượng là một ' },
            { kind: 'term', termId: 'element', surface: 'phần tử' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'sec.k2.heading': {
      id: 'sec.k2.heading',
      role: 'title',
      en: [
        { kind: 'text', text: '2. ' },
        { kind: 'term', termId: 'membership', surface: 'Membership' },
        { kind: 'text', text: ' Symbols' },
      ],
      vi: [
        { kind: 'text', text: '2. Kí hiệu ' },
        { kind: 'term', termId: 'membership', surface: 'thuộc và không thuộc' },
      ],
      review: REVIEWED,
    },
    'sec.k2.body': {
      id: 'sec.k2.body',
      role: 'theory',
      en: [
        {
          kind: 'phrase',
          phraseId: 'k2-p1',
          children: [
            { kind: 'text', text: 'The symbol ' },
            { kind: 'math', latex: '\\in' },
            { kind: 'text', text: ' denotes ' },
            { kind: 'term', termId: 'membership', surface: 'membership' },
            { kind: 'text', text: ' (an ' },
            { kind: 'term', termId: 'element', surface: 'element' },
            { kind: 'text', text: ' belongs to a ' },
            { kind: 'term', termId: 'set', surface: 'set' },
            { kind: 'text', text: '). ' },
          ],
        },
        {
          kind: 'phrase',
          phraseId: 'k2-p2',
          children: [
            { kind: 'text', text: 'The symbol ' },
            { kind: 'math', latex: '\\notin' },
            { kind: 'text', text: ' denotes non-membership.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'k2-p1',
          children: [
            { kind: 'text', text: 'Kí hiệu ' },
            { kind: 'math', latex: '\\in' },
            { kind: 'text', text: ' chỉ ' },
            { kind: 'term', termId: 'element', surface: 'phần tử' },
            { kind: 'text', text: ' ' },
            { kind: 'term', termId: 'membership', surface: 'thuộc' },
            { kind: 'text', text: ' ' },
            { kind: 'term', termId: 'set', surface: 'tập hợp' },
            { kind: 'text', text: '. ' },
          ],
        },
        {
          kind: 'phrase',
          phraseId: 'k2-p2',
          children: [
            { kind: 'text', text: 'Kí hiệu ' },
            { kind: 'math', latex: '\\notin' },
            { kind: 'text', text: ' chỉ phần tử không thuộc tập hợp.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'sec.k3.heading': {
      id: 'sec.k3.heading',
      role: 'title',
      en: [
        { kind: 'text', text: '3. Describing a ' },
        { kind: 'term', termId: 'set', surface: 'Set' },
      ],
      vi: [
        { kind: 'text', text: '3. Cách mô tả ' },
        { kind: 'term', termId: 'set', surface: 'tập hợp' },
      ],
      review: REVIEWED,
    },
    'sec.k3.body': {
      id: 'sec.k3.body',
      role: 'theory',
      en: [
        {
          kind: 'phrase',
          phraseId: 'k3-p1',
          children: [
            { kind: 'text', text: 'Two ways: listing the ' },
            { kind: 'term', termId: 'element', surface: 'elements' },
            { kind: 'text', text: ' or specifying the ' },
            { kind: 'term', termId: 'characteristic-property', surface: 'characteristic property' },
            { kind: 'text', text: ' of the elements.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'k3-p1',
          children: [
            { kind: 'text', text: 'Có hai cách: liệt kê các ' },
            { kind: 'term', termId: 'element', surface: 'phần tử' },
            { kind: 'text', text: ' hoặc chỉ ra ' },
            { kind: 'term', termId: 'characteristic-property', surface: 'tính chất đặc trưng' },
            { kind: 'text', text: ' của các phần tử.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'sec.trans.heading': {
      id: 'sec.trans.heading',
      role: 'title',
      en: [{ kind: 'text', text: 'Math Glossary' }],
      vi: [{ kind: 'text', text: 'Từ điển Toán học' }],
      review: REVIEWED,
    },
    'q.mc1.prompt': {
      id: 'q.mc1.prompt',
      role: 'prompt',
      en: [
        {
          kind: 'phrase',
          phraseId: 'mc1-p1',
          children: [
            { kind: 'text', text: 'Let ' },
            { kind: 'math', latex: 'A = \\{2;\\, 4;\\, 6\\}' },
            { kind: 'text', text: '. Which statement is TRUE?' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'mc1-p1',
          children: [
            { kind: 'text', text: 'Cho ' },
            { kind: 'math', latex: 'A = \\{2;\\, 4;\\, 6\\}' },
            { kind: 'text', text: '. Phát biểu nào ĐÚNG?' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'q.mc1.opt0': {
      id: 'q.mc1.opt0',
      role: 'option',
      en: [{ kind: 'math', latex: '2 \\notin A' }],
      vi: [{ kind: 'math', latex: '2 \\notin A' }],
      review: REVIEWED,
    },
    'q.mc1.opt1': {
      id: 'q.mc1.opt1',
      role: 'option',
      en: [{ kind: 'math', latex: '5 \\in A' }],
      vi: [{ kind: 'math', latex: '5 \\in A' }],
      review: REVIEWED,
    },
    'q.mc1.opt2': {
      id: 'q.mc1.opt2',
      role: 'option',
      en: [{ kind: 'math', latex: '4 \\in A' }],
      vi: [{ kind: 'math', latex: '4 \\in A' }],
      review: REVIEWED,
    },
    'q.mc1.opt3': {
      id: 'q.mc1.opt3',
      role: 'option',
      en: [
        { kind: 'math', latex: 'A' },
        { kind: 'text', text: ' has 2 ' },
        { kind: 'term', termId: 'element', surface: 'elements' },
      ],
      vi: [
        { kind: 'math', latex: 'A' },
        { kind: 'text', text: ' có 2 ' },
        { kind: 'term', termId: 'element', surface: 'phần tử' },
      ],
      review: REVIEWED,
    },
    'q.mc1.ex': {
      id: 'q.mc1.ex',
      role: 'feedback',
      en: [
        {
          kind: 'phrase',
          phraseId: 'mc1-ex1',
          children: [
            { kind: 'text', text: '4 is an ' },
            { kind: 'term', termId: 'element', surface: 'element' },
            { kind: 'text', text: ' in ' },
            { kind: 'term', termId: 'set', surface: 'set' },
            { kind: 'text', text: ' ' },
            { kind: 'math', latex: 'A' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'mc1-ex1',
          children: [
            { kind: 'text', text: '4 là ' },
            { kind: 'term', termId: 'element', surface: 'phần tử' },
            { kind: 'text', text: ' nằm trong ' },
            { kind: 'term', termId: 'set', surface: 'tập hợp' },
            { kind: 'text', text: ' ' },
            { kind: 'math', latex: 'A' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'q.mc2.prompt': {
      id: 'q.mc2.prompt',
      role: 'prompt',
      en: [
        {
          kind: 'phrase',
          phraseId: 'mc2-p1',
          children: [
            { kind: 'term', termId: 'set', surface: 'Set' },
            { kind: 'text', text: ' ' },
            { kind: 'math', latex: 'B' },
            { kind: 'text', text: ' of ' },
            { kind: 'term', termId: 'natural-numbers', surface: 'natural numbers' },
            { kind: 'text', text: ' less than 5 is:' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'mc2-p1',
          children: [
            { kind: 'term', termId: 'set', surface: 'Tập hợp' },
            { kind: 'text', text: ' ' },
            { kind: 'math', latex: 'B' },
            { kind: 'text', text: ' các ' },
            { kind: 'term', termId: 'natural-numbers', surface: 'số tự nhiên' },
            { kind: 'text', text: ' nhỏ hơn 5 là:' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'q.mc2.opt0': {
      id: 'q.mc2.opt0',
      role: 'option',
      en: [{ kind: 'math', latex: '\\{1;\\, 2;\\, 3;\\, 4\\}' }],
      vi: [{ kind: 'math', latex: '\\{1;\\, 2;\\, 3;\\, 4\\}' }],
      review: REVIEWED,
    },
    'q.mc2.opt1': {
      id: 'q.mc2.opt1',
      role: 'option',
      en: [{ kind: 'math', latex: '\\{0;\\, 1;\\, 2;\\, 3;\\, 4\\}' }],
      vi: [{ kind: 'math', latex: '\\{0;\\, 1;\\, 2;\\, 3;\\, 4\\}' }],
      review: REVIEWED,
    },
    'q.mc2.opt2': {
      id: 'q.mc2.opt2',
      role: 'option',
      en: [{ kind: 'math', latex: '\\{0;\\, 1;\\, 2;\\, 3;\\, 4;\\, 5\\}' }],
      vi: [{ kind: 'math', latex: '\\{0;\\, 1;\\, 2;\\, 3;\\, 4;\\, 5\\}' }],
      review: REVIEWED,
    },
    'q.mc2.opt3': {
      id: 'q.mc2.opt3',
      role: 'option',
      en: [{ kind: 'math', latex: '\\{1;\\, 2;\\, 3;\\, 4;\\, 5\\}' }],
      vi: [{ kind: 'math', latex: '\\{1;\\, 2;\\, 3;\\, 4;\\, 5\\}' }],
      review: REVIEWED,
    },
    'q.mc2.ex': {
      id: 'q.mc2.ex',
      role: 'feedback',
      en: [
        {
          kind: 'phrase',
          phraseId: 'mc2-ex1',
          children: [
            { kind: 'term', termId: 'natural-numbers', surface: 'Natural numbers' },
            { kind: 'text', text: ' start from 0.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'mc2-ex1',
          children: [
            { kind: 'term', termId: 'natural-numbers', surface: 'Số tự nhiên' },
            { kind: 'text', text: ' bắt đầu từ 0.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'q.tf1.prompt': {
      id: 'q.tf1.prompt',
      role: 'prompt',
      en: [
        {
          kind: 'phrase',
          phraseId: 'tf1-p1',
          children: [
            { kind: 'text', text: 'Every ' },
            { kind: 'term', termId: 'set', surface: 'set' },
            { kind: 'text', text: ' has at least 1 ' },
            { kind: 'term', termId: 'element', surface: 'element' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'tf1-p1',
          children: [
            { kind: 'text', text: 'Mọi ' },
            { kind: 'term', termId: 'set', surface: 'tập hợp' },
            { kind: 'text', text: ' đều có ít nhất 1 ' },
            { kind: 'term', termId: 'element', surface: 'phần tử' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'q.tf1.ex': {
      id: 'q.tf1.ex',
      role: 'feedback',
      en: [
        {
          kind: 'phrase',
          phraseId: 'tf1-ex1',
          children: [
            { kind: 'text', text: 'FALSE — The ' },
            { kind: 'term', termId: 'empty-set', surface: 'empty set' },
            { kind: 'text', text: ' ' },
            { kind: 'math', latex: '\\varnothing = \\{\\ \\}' },
            { kind: 'text', text: ' has no ' },
            { kind: 'term', termId: 'element', surface: 'elements' },
            { kind: 'text', text: '.' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'tf1-ex1',
          children: [
            { kind: 'text', text: 'SAI — ' },
            { kind: 'term', termId: 'empty-set', surface: 'Tập rỗng' },
            { kind: 'text', text: ' ' },
            { kind: 'math', latex: '\\varnothing = \\{\\ \\}' },
            { kind: 'text', text: ' không có ' },
            { kind: 'term', termId: 'element', surface: 'phần tử' },
            { kind: 'text', text: ' nào.' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'q.f1.prompt': {
      id: 'q.f1.prompt',
      role: 'prompt',
      en: [
        {
          kind: 'phrase',
          phraseId: 'f1-p1',
          children: [
            { kind: 'text', text: 'The ' },
            { kind: 'term', termId: 'empty-set', surface: 'empty set' },
            { kind: 'text', text: ' is symbolized by ___' },
          ],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'f1-p1',
          children: [
            { kind: 'term', termId: 'empty-set', surface: 'Tập rỗng' },
            { kind: 'text', text: ' kí hiệu là ___' },
          ],
        },
      ],
      review: REVIEWED,
    },
    'q.f1.hint': {
      id: 'q.f1.hint',
      role: 'feedback',
      en: [
        {
          kind: 'phrase',
          phraseId: 'f1-h1',
          children: [{ kind: 'text', text: 'Circle with a diagonal slash (∅)' }],
        },
      ],
      vi: [
        {
          kind: 'phrase',
          phraseId: 'f1-h1',
          children: [{ kind: 'text', text: 'Kí hiệu tròn gạch chéo (∅)' }],
        },
      ],
      review: REVIEWED,
    },
  },
};
