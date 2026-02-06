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
  ]);

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTitle = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTitle}!A1:I1`,
  });
  const hasHeader = (current.data.values?.length ?? 0) > 0;
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
  ];

  if (!hasHeader) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A1:I1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [header] },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetTitle}!A:I`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
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
    range: `${sheetTitle}!A:I`,
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
  });

  return dataRows
    .filter((cells) => (cells[dateIdx] ?? "").startsWith(dateStr) && (cells[topicIdx] ?? "").includes(topic))
    .map(toRow);
}
