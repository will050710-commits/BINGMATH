import type { MathTerm } from '@/types/clil';

export const MATH_TERMS_CATALOG: Record<string, MathTerm> = {
  set: {
    id: 'set',
    version: '1.0.0',
    en: 'Set',
    vi: 'Tập hợp',
    sense: 'set-theory-collection',
    domain: 'sets',
    aliases: {
      en: ['set', 'sets', 'a set'],
      vi: ['tập hợp', 'các tập hợp'],
    },
    definition: {
      en: 'A well-defined collection of distinct mathematical or real-world objects, usually denoted by a capital letter such as A or B.',
      vi: 'Một nhóm các đối tượng được xác định rõ ràng và phân biệt, thường được kí hiệu bằng chữ cái in hoa như A hoặc B.',
    },
    latex: 'A = \\{2;\\, 4;\\, 6\\}',
    illustrationKey: 'set-elements',
    sourceRefs: ['SGK-Toan-6-Ch1-Bai1', 'CLIL-Grade6-Sets-v1'],
    review: {
      status: 'reviewed',
      revision: '2026-10-30.1',
      reviewerRef: 'bingmath-clil-editorial',
    },
  },
  element: {
    id: 'element',
    version: '1.0.0',
    en: 'Element',
    vi: 'Phần tử',
    sense: 'set-member-object',
    domain: 'sets',
    aliases: {
      en: ['element', 'elements', 'member', 'members'],
      vi: ['phần tử', 'các phần tử'],
    },
    definition: {
      en: 'Each individual object that belongs to a set. If 4 is in set A, we say 4 is an element of A.',
      vi: 'Mỗi đối tượng riêng lẻ cấu thành nên một tập hợp. Nếu 4 nằm trong tập hợp A, ta nói 4 là một phần tử của A.',
    },
    latex: '4 \\in A',
    illustrationKey: 'set-elements',
    sourceRefs: ['SGK-Toan-6-Ch1-Bai1', 'CLIL-Grade6-Sets-v1'],
    review: {
      status: 'reviewed',
      revision: '2026-10-30.1',
      reviewerRef: 'bingmath-clil-editorial',
    },
  },
  'empty-set': {
    id: 'empty-set',
    version: '1.0.0',
    en: 'Empty set',
    vi: 'Tập hợp rỗng',
    sense: 'set-with-zero-elements',
    domain: 'sets',
    aliases: {
      en: ['empty set', 'null set'],
      vi: ['tập rỗng', 'tập hợp rỗng'],
    },
    definition: {
      en: 'The unique set that contains no elements at all, written as ∅ or { }.',
      vi: 'Tập hợp duy nhất không chứa bất kỳ phần tử nào, được kí hiệu là ∅ hoặc { }.',
    },
    latex: '\\varnothing = \\{\\ \\}',
    illustrationKey: 'empty-set',
    sourceRefs: ['SGK-Toan-6-Ch1-Bai1', 'CLIL-Grade6-Sets-v1'],
    review: {
      status: 'reviewed',
      revision: '2026-10-30.1',
      reviewerRef: 'bingmath-clil-editorial',
    },
  },
  membership: {
    id: 'membership',
    version: '1.0.0',
    en: 'Membership (∈ / ∉)',
    vi: 'Quan hệ thuộc và không thuộc (∈ / ∉)',
    sense: 'set-membership-relation',
    domain: 'sets',
    aliases: {
      en: ['membership', 'non-membership', 'belongs to', 'does not belong to'],
      vi: ['thuộc', 'không thuộc', 'kí hiệu thuộc'],
    },
    definition: {
      en: 'The symbol ∈ indicates that an element belongs to a set (x ∈ A), whereas ∉ indicates that it does not belong to the set (y ∉ A).',
      vi: 'Kí hiệu ∈ chỉ một phần tử thuộc tập hợp (x ∈ A), còn kí hiệu ∉ chỉ phần tử không thuộc tập hợp đó (y ∉ A).',
    },
    latex: '4 \\in A,\\quad 5 \\notin A',
    illustrationKey: 'membership',
    sourceRefs: ['SGK-Toan-6-Ch1-Bai1', 'CLIL-Grade6-Sets-v1'],
    review: {
      status: 'reviewed',
      revision: '2026-10-30.1',
      reviewerRef: 'bingmath-clil-editorial',
    },
  },
  'natural-numbers': {
    id: 'natural-numbers',
    version: '1.0.0',
    en: 'Natural numbers',
    vi: 'Số tự nhiên',
    sense: 'non-negative-integers-grade6-vn',
    domain: 'sets',
    aliases: {
      en: ['natural number', 'natural numbers'],
      vi: ['số tự nhiên', 'các số tự nhiên'],
    },
    definition: {
      en: 'In the Vietnamese Grade 6 curriculum, the set of natural numbers ℕ starts from 0: ℕ = {0; 1; 2; 3; ...}.',
      vi: 'Trong chương trình Toán 6 Việt Nam, tập hợp các số tự nhiên ℕ bắt đầu từ số 0: ℕ = {0; 1; 2; 3; ...}.',
    },
    latex: '\\mathbb{N} = \\{0;\\, 1;\\, 2;\\, 3;\\, \\dots\\}',
    sourceRefs: ['SGK-Toan-6-Ch1-Bai1', 'CLIL-Grade6-Sets-v1'],
    review: {
      status: 'reviewed',
      revision: '2026-10-30.1',
      reviewerRef: 'bingmath-clil-editorial',
    },
  },
  'characteristic-property': {
    id: 'characteristic-property',
    version: '1.0.0',
    en: 'Characteristic property',
    vi: 'Tính chất đặc trưng',
    sense: 'set-builder-defining-property',
    domain: 'sets',
    aliases: {
      en: ['characteristic property', 'defining property'],
      vi: ['tính chất đặc trưng'],
    },
    definition: {
      en: 'A rule or condition shared by all elements of a set and only those elements, used to describe a set concisely.',
      vi: 'Quy tắc hoặc điều kiện chung mà mọi phần tử của tập hợp đều thoả mãn, dùng để mô tả tập hợp một cách ngắn gọn.',
    },
    latex: 'B = \\{x \\in \\mathbb{N} \\mid x < 5\\}',
    sourceRefs: ['SGK-Toan-6-Ch1-Bai1', 'CLIL-Grade6-Sets-v1'],
    review: {
      status: 'reviewed',
      revision: '2026-10-30.1',
      reviewerRef: 'bingmath-clil-editorial',
    },
  },
};

export function getMathTerm(termId: string): MathTerm | null {
  return MATH_TERMS_CATALOG[termId] ?? null;
}

