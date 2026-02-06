/**
 * 누적 키워드 코퍼스 대비 기사 키워드의 밀집도(Cohesion) 계산. 0~1.
 */
function normalizeKeyword(k: string): string {
  return k.trim().toLowerCase().replace(/\s+/g, "_");
}

export function buildKeywordCorpus(rows: { keywords: string }[]): Map<string, number> {
  const corpus = new Map<string, number>();
  for (const row of rows) {
    const parts = (row.keywords || "").split(/[,،、]/).map((s) => normalizeKeyword(s)).filter(Boolean);
    for (const p of parts) {
      corpus.set(p, (corpus.get(p) ?? 0) + 1);
    }
  }
  return corpus;
}

/** 기사 키워드 배열과 코퍼스로 Cohesion (0~1) 계산. 높을수록 누적 키워드와 밀집. */
export function computeCohesion(articleKeywords: string[], corpus: Map<string, number>): number {
  if (articleKeywords.length === 0) return 0;
  const maxFreq = Math.max(...corpus.values(), 1);
  const scores = articleKeywords.map((k) => {
    const n = normalizeKeyword(k);
    return (corpus.get(n) ?? 0) / maxFreq;
  });
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.min(1, Math.round(avg * 100) / 100);
}
