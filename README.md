# Global News Dashboard

매일 아침 설정한 주제에 대해 **화제성·검색량이 높은** 전 세계 뉴스를 수집하고, 대시보드로 요약하며 구글 스프레드시트에 아카이빙하는 웹 앱입니다.

## Tech Stack

- **Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS, Framer Motion
- **DB:** Google Sheets API
- **External:** SerpApi(뉴스 검색), OpenAI(요약/번역/감정/키워드)
- **State:** Zustand

## 환경 변수 (넷리파이 배포 시 동일 키 사용)

`.env.example`을 참고해 `.env.local`을 만들고, 넷리파이에서는 **Site settings → Environment variables**에 아래 변수를 설정하세요.

| 변수명 | 설명 |
|--------|------|
| `SERPAPI_API_KEY` | [SerpApi](https://serpapi.com/) 키 (뉴스 검색) |
| `OPENAI_API_KEY` | OpenAI API 키 (요약, 번역, 감정, 키워드) |
| `GOOGLE_SHEETS_CREDENTIALS_JSON` | Google 서비스 계정 JSON 전체 문자열 |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | 아카이빙할 스프레드시트 ID (URL의 `/d/.../` 부분) |

## 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## 기능 요약

1. **설정:** 관심 주제(키워드), 매일 수집 뉴스 개수(N) 저장 (로컬 저장소 유지)
2. **Today's Headlines:** SerpApi로 관련도/인기 우선 뉴스 수집 → 팝업북 스타일 카드 + 클릭 시 상세 모달
3. **상세 모달:** 원문/한국어 번역 토글, 옵시디언·노션용 마크다운 복사
4. **처리 및 아카이빙:** OpenAI로 3줄 요약·감정·키워드 처리 후 Google Sheets에 행 추가
5. **트렌드 분석:** 감정 파이 차트, 키워드 워드클라우드
6. **Review:** 1년 전/2년 전/3년 전 오늘 스프레드시트 데이터 조회

## 스프레드시트 설정

1. Google Cloud Console에서 서비스 계정 생성 후 JSON 키 다운로드
2. 해당 스프레드시트를 서비스 계정 이메일과 **공유**(편집 권한)
3. `GOOGLE_SHEETS_CREDENTIALS_JSON`에 JSON 내용을 한 줄 문자열로 넣기 (넷리파이에서는 줄바꿈을 `\n`으로 이스케이프)
