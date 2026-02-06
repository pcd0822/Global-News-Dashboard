/**
 * 기사 날짜를 "1 day ago" 형식으로 표시
 */
export function formatRelativeDate(dateStr: string | undefined | null): string {
  if (!dateStr || typeof dateStr !== "string") return "—";
  const s = dateStr.trim();

  if (/^\d{1,2}\s*(hour|hours|hr|h)\s*ago$/i.test(s)) return s;
  if (/^\d{1,2}\s*(day|days)\s*ago$/i.test(s)) return s;
  if (/^\d{1,2}\s*(week|weeks)\s*ago$/i.test(s)) return s;
  if (/^\d{1,2}\s*(month|months)\s*ago$/i.test(s)) return s;

  const iso = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const then = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
  }

  try {
    const then = new Date(s);
    if (!Number.isNaN(then.getTime())) {
      const now = new Date();
      const diffMs = now.getTime() - then.getTime();
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 30) return `${diffDays} days ago`;
      return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
    }
  } catch {
    // ignore
  }

  return s;
}
