export const MAX_POINTS_PER_QUESTION = 8
export const MIN_QUESTIONS_PER_CATEGORY = 2

export const CATEGORIES = [
  {
    key: 'interpretasi',
    label: 'Interpretasi',
    hint: 'Memahami makna dan gagasan pokok teks dengan kata-kata sendiri.',
  },
  {
    key: 'analisis',
    label: 'Analisis',
    hint: 'Menguraikan bagian, hubungan, dan struktur argumen dalam teks.',
  },
  {
    key: 'inferensi',
    label: 'Inferensi',
    hint: 'Menarik simpulan dari informasi tersirat dalam teks.',
  },
  {
    key: 'evaluasi',
    label: 'Evaluasi',
    hint: 'Menilai kualitas, kredibilitas, dan ketepatan isi teks.',
  },
  {
    key: 'refleksi',
    label: 'Refleksi',
    hint: 'Mengaitkan isi teks dengan pengalaman dan pandangan pribadi.',
  },
] as const

export type CategoryKey = (typeof CATEGORIES)[number]['key']

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as CategoryKey[]

export function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function keywordMatches(normalizedAnswer: string, tokens: string[], keyword: string) {
  const nk = normalize(keyword)
  if (!nk) return false
  if (nk.includes(' ')) {
    return ` ${normalizedAnswer} `.includes(` ${nk} `)
  }
  return tokens.some(
    (t) =>
      t === nk || (nk.length >= 4 && t.startsWith(nk) && t.length - nk.length <= 4),
  )
}

export function scoreAnswer(answerText: string, keywords: string[]) {
  const normalizedAnswer = normalize(answerText)
  const tokens = normalizedAnswer ? normalizedAnswer.split(' ') : []
  const unique = Array.from(new Set(keywords.map((k) => k.trim()).filter(Boolean)))
  const matched = unique.filter((k) => keywordMatches(normalizedAnswer, tokens, k))
  const points = unique.length
    ? Math.round(((MAX_POINTS_PER_QUESTION * matched.length) / unique.length) * 100) / 100
    : 0
  return { matched, points }
}



export function toScore(totalPoints: number, maxPoints: number) {
  if (!maxPoints) return 0
  return Math.round((totalPoints / maxPoints) * 1000) / 10
}

export function parseKeywords(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(/[,\n;]/)
        .map((k) => k.trim())
        .filter(Boolean),
    ),
  )
}
