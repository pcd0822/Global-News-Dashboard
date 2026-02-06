import { google } from "googleapis";
import type { ProcessedNewsRow } from "@/types";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getAuthClient() {
  const raw = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON;
  if (!raw) throw new Error("GOOGLE_SHEETS_CREDENTIALS_JSON is not set");
  const credentials = JSON.parse(raw) as { client_email?: string; private_key?: string };
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });
  return auth;
}

export async function appendNewsToSheet(rows: ProcessedNewsRow[]): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const values = rows.map((r) => [
    r.date,
    r.topic,
    r.titleOriginal,
    r.titleTranslated,
    r.link,
    r.summaryOriginal,
    r.summaryTranslated,
    r.sentiment,
    r.keywords,
    String(r.cohesion ?? ""),
  ]);

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTitle = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTitle}!A1:J1`,
  });
  const headerRow = (current.data.values ?? [])[0] ?? [];
  const hasHeader = headerRow.length > 0;
  const header = [
    "날짜",
    "주제",
    "제목(원문)",
    "제목(번역)",
    "링크",
    "요약(원문)",
    "요약(번역)",
    "감정상태",
    "키워드",
    "Cohesion",
  ];

  if (!hasHeader) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A1:J1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [header] },
    });
  } else if (headerRow.length < 10) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A1:J1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [header] },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetTitle}!A:J`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}

/** 해당 주제의 전체 행 조회 (키워드 코퍼스·Cohesion 계산용) */
export async function getAllRowsForTopic(topic: string): Promise<{ keywords: string }[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTitle = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTitle}!A:J`,
  });

  const rows = (res.data.values ?? []) as string[][];
  if (rows.length < 2) return [];

  const header = rows[0];
  const topicIdx = header.indexOf("주제");
  const keywordsIdx = header.indexOf("키워드");

  return rows.slice(1).filter((cells) => (cells[topicIdx] ?? "").includes(topic)).map((cells) => ({
    keywords: cells[keywordsIdx] ?? "",
  }));
}

/** 분석용: 해당 주제의 전체 행 (날짜, 감정, 키워드) */
export interface AnalyticsRow {
  date: string;
  sentiment: string;
  keywords: string;
}

export async function getRowsForAnalytics(topic: string): Promise<AnalyticsRow[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTitle = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTitle}!A:J`,
  });

  const rows = (res.data.values ?? []) as string[][];
  if (rows.length < 2) return [];

  const header = rows[0];
  const dateIdx = header.indexOf("날짜");
  const topicIdx = header.indexOf("주제");
  const sentimentIdx = header.indexOf("감정상태");
  const keywordsIdx = header.indexOf("키워드");

  return rows
    .slice(1)
    .filter((cells) => (cells[topicIdx] ?? "").includes(topic))
    .map((cells) => ({
      date: (cells[dateIdx] ?? "").slice(0, 10),
      sentiment: (cells[sentimentIdx] ?? "Neutral").trim(),
      keywords: cells[keywordsIdx] ?? "",
    }))
    .filter((r) => r.date);
}

export async function getPastNewsFromSheet(
  topic: string,
  dateStr: string
): Promise<ProcessedNewsRow[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTitle = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTitle}!A:J`,
  });

  const rows = (res.data.values ?? []) as string[][];
  if (rows.length < 2) return [];

  const [header, ...dataRows] = rows;
  const dateIdx = header.indexOf("날짜");
  const topicIdx = header.indexOf("주제");
  const titleOrigIdx = header.indexOf("제목(원문)");
  const titleTransIdx = header.indexOf("제목(번역)");
  const linkIdx = header.indexOf("링크");
  const sumOrigIdx = header.indexOf("요약(원문)");
  const sumTransIdx = header.indexOf("요약(번역)");
  const sentimentIdx = header.indexOf("감정상태");
  const keywordsIdx = header.indexOf("키워드");
  const cohesionIdx = header.indexOf("Cohesion");

  const toRow = (cells: string[]): ProcessedNewsRow => ({
    date: cells[dateIdx] ?? "",
    topic: cells[topicIdx] ?? "",
    titleOriginal: cells[titleOrigIdx] ?? "",
    titleTranslated: cells[titleTransIdx] ?? "",
    link: cells[linkIdx] ?? "",
    summaryOriginal: cells[sumOrigIdx] ?? "",
    summaryTranslated: cells[sumTransIdx] ?? "",
    sentiment: (cells[sentimentIdx] as ProcessedNewsRow["sentiment"]) ?? "Neutral",
    keywords: cells[keywordsIdx] ?? "",
    cohesion: cohesionIdx >= 0 && cells[cohesionIdx] ? Number(cells[cohesionIdx]) : undefined,
  });

  return dataRows
    .filter((cells) => (cells[dateIdx] ?? "").startsWith(dateStr) && (cells[topicIdx] ?? "").includes(topic))
    .map(toRow);
}
