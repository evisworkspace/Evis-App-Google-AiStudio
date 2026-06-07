export async function createGoogleMeetEvent(
  accessToken: string,
  summary: string,
  description: string,
  startDateTime: string, // ISO format
  endDateTime: string, // ISO format
  attendees: { email: string }[] = []
) {
  let url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1";
  if (attendees.length > 0) {
    url += "&sendUpdates=all";
  }

  const event = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: attendees,
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Calendar fetch error:", errorBody);
    throw new Error(`Erro ao criar reunião: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function createGoogleTask(
  accessToken: string,
  title: string,
  notes: string,
  dueString?: string
) {
  const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

  const dateStr = (dueString || new Date().toISOString()).split("T")[0];

  const event = {
    summary: `TAREFA: ${title}`,
    description: notes,
    start: {
      date: dateStr,
    },
    end: {
      date: dateStr, 
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Task/Calendar fetch error:", errorBody);
    throw new Error(`Erro ao sincronizar tarefa: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function createGoogleDriveFolder(accessToken: string, folderName: string) {
  const url = "https://www.googleapis.com/drive/v3/files";
  const metadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Drive fetch error:", errorBody);
    throw new Error(`Erro ao criar pasta no Drive: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function syncToCalendar(
  accessToken: string,
  eventId: string, // you can pass task.id here optionally
  title: string,
  description: string,
  dateIsoString: string
) {
  const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
  const dateStr = dateIsoString.split("T")[0];

  const event = {
    summary: title,
    description,
    start: {
      date: dateStr,
    },
    end: {
      date: dateStr, 
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Calendar sync error:", errorBody);
    throw new Error(`Erro ao sincronizar com Google Calendar: ${response.statusText}`);
  }

  return await response.json();
}

export async function createGoogleSheet(accessToken: string, title: string, values: any[][]) {
  // 1. Create spreadsheet
  const createUrl = "https://sheets.googleapis.com/v4/spreadsheets";
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!createRes.ok) throw new Error("Erro ao criar planilha.");
  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // 2. Update values
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`;
  const updateRes = await fetch(updateUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: values,
    }),
  });

  if (!updateRes.ok) throw new Error("Erro ao preencher planilha.");

  return sheetData.spreadsheetUrl;
}

export async function sendGmail(accessToken: string, to: string, subject: string, bodyText: string) {
  const url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
  
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    bodyText
  ];
  
  const rawMessage = messageParts.join('\n');
  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gmail fetch error:", errorBody);
    throw new Error(`Erro ao enviar email: ${response.statusText}`);
  }

  return await response.json();
}
