"use client";

import { useState, useEffect } from "react";

/**
 * 클라이언트 마운트 여부. 하이드레이션 후에만 true.
 * localStorage 등 클라이언트 전용 값에 의존하는 UI는 mounted 이후에만 렌더링해
 * 서버/클라이언트 불일치(React hydration error #423)를 방지합니다.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
