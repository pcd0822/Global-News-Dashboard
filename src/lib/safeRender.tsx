/**
 * React는 객체를 자식으로 렌더할 수 없음 (오류 #31).
 * API/캐시에서 객체가 들어와도 크래시하지 않도록 원시값만 렌더.
 */
export function safeText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
}
