import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";

import { getTags } from "../constants/index.js";
import dayjs from "dayjs";

export const writeDataToSheets = async (
  question: string,
  author: string,
  thread: any
) => {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/spreadsheets",
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY?.split("\\n").join("\n"),
    },
  });

  const service = google.sheets({ version: "v4", auth });

  let closedOn = "";
  let resolutionTime: any = "";

  const tags = thread.appliedTags.map((tag: any) => getTags(tag));

  if (tags.includes("Resolved")) {
    const lastMessage = await thread.messages.fetch({ limit: 1 });
    const lastMessageAt = dayjs(lastMessage.first().createdTimestamp);
    const startDate = dayjs(thread.createdTimestamp);

    closedOn = lastMessageAt.format("DD/MM/YYYY HH:mm:ss");

    resolutionTime = lastMessageAt.diff(startDate, "minutes");
  }

  let values = [
    [
      thread.id,
      dayjs(thread.createdTimestamp).format("DD/MM/YYYY HH:mm:ss"),
      author,
      thread.name,
      question,
      tags.join(","),
      "",
      "",
      closedOn,
      resolutionTime,
    ],
  ];

  const requestBody = {
    values,
  };
  try {
    const result = await service.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID || "",
      range: "A:K",
      valueInputOption: "RAW",
      requestBody,
    });
    console.log("%d cells updated.", result.data.updates?.updatedCells);
    return result;
  } catch (err) {
    console.log(err);
  }
};

export async function updateRow(thread: any, updates: { [key: string]: any }) {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/spreadsheets",
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY?.split("\\n").join("\n"),
    },
  });

  const service = google.sheets({ version: "v4", auth });

  const { data } = await service.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "A:K",
  });

  const row = data.values?.find((row) => row[0] === thread.id);
  const rowIndex = data.values?.findIndex((row) => row[0] === thread.id);

  if (!row || !rowIndex) {
    const firstMessage = await thread.fetchStarterMessage();
    const message = firstMessage?.content || "";
    const author = firstMessage?.author.username || "";

    await writeDataToSheets(message, author, thread);
    return;
  }

  // Get the headers from the first row
  const headers = data.values?.[0];

  // Create an array to hold the new values for the row
  const newRow = [...row];

  // Iterate over the updates and apply them to the newRow array
  for (const [key, value] of Object.entries(updates)) {
    const columnIndex = headers?.indexOf(key);
    if (columnIndex === -1 || !columnIndex) {
      return;
    }
    newRow[columnIndex] = value;
  }

  //   Update the row in the sheet
  await service.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `A${rowIndex + 1}:K${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [newRow],
    },
  });
}
