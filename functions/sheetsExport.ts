import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TRACKLIST = [
  { id: 1,  title: "SAUCY",                   role: "Intro" },
  { id: 2,  title: "Wasabi",                  role: "Vibe" },
  { id: 3,  title: "Wet Wet (Toni Macaroni)", role: "Peak" },
  { id: 4,  title: "Aggressive",              role: "Peak" },
  { id: 5,  title: "POGO",                    role: "Transition" },
  { id: 6,  title: "Slo_Motion",              role: "Deep" },
  { id: 7,  title: "Late Night",              role: "Lead" },
  { id: 8,  title: "Jealousy",                role: "Mood" },
  { id: 9,  title: "Barry White",             role: "Outro" },
  { id: 10, title: "Show U Real",             role: "Vibe" },
  { id: 11, title: "1 on 1",                  role: "Mood" },
  { id: 12, title: "Dance On Me",             role: "Vibe" },
];

async function getOrCreateSpreadsheet(accessToken, base44) {
  // Check if we already have a stored spreadsheet ID
  const existing = await base44.asServiceRole.entities.AppMeta.filter({ key: 'sheets_spreadsheet_id' });
  if (existing.length > 0) {
    return { spreadsheetId: existing[0].value, isNew: false };
  }

  // Create a new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: 'SaadiQ - THE AFTER PARTY Analytics' },
      sheets: [
        { properties: { title: 'Tracklist', sheetId: 0 } },
        { properties: { title: 'Visitors', sheetId: 1 } },
      ]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create spreadsheet: ${err}`);
  }

  const sheet = await createRes.json();
  return { spreadsheetId: sheet.spreadsheetId, isNew: true };
}

async function writeTracklist(accessToken, spreadsheetId) {
  const rows = [
    ['#', 'Title', 'Role'],
    ...TRACKLIST.map(t => [t.id, t.title, t.role])
  ];
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tracklist!A1:C${rows.length}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: rows })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to write tracklist: ${err}`);
  }
}

async function appendVisitor(accessToken, spreadsheetId, visitorData) {
  // Ensure header row
  const headerRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Visitors!A1:F1?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [['Timestamp', 'User Agent', 'Language', 'Referrer', 'Screen', 'Timezone']] })
  });

  if (!headerRes.ok) {
    const err = await headerRes.text();
    throw new Error(`Failed to set header: ${err}`);
  }

  const row = [
    visitorData.timestamp,
    visitorData.userAgent,
    visitorData.language,
    visitorData.referrer,
    visitorData.screen,
    visitorData.timezone,
  ];

  const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Visitors!A:F:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] })
  });

  if (!appendRes.ok) {
    const err = await appendRes.text();
    throw new Error(`Failed to append visitor: ${err}`);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'logVisitor';

    if (action === 'setup') {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { spreadsheetId, isNew } = await getOrCreateSpreadsheet(accessToken, base44);

      if (isNew) {
        await writeTracklist(accessToken, spreadsheetId);
        await base44.asServiceRole.entities.AppMeta.create({ key: 'sheets_spreadsheet_id', value: spreadsheetId });
      }

      return Response.json({ success: true, spreadsheetId, url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` });
    }

    if (action === 'logVisitor') {
      const meta = await base44.asServiceRole.entities.AppMeta.filter({ key: 'sheets_spreadsheet_id' });
      if (!meta.length) {
        // Silently skip — spreadsheet not set up yet
        return Response.json({ success: true, skipped: true });
      }
      const spreadsheetId = meta[0].value;

      // Log only non-PII visitor data (no IP address collection)
      const visitorData = {
        timestamp: new Date().toISOString(),
        userAgent: body.userAgent || '',
        language: body.language || '',
        referrer: body.referrer || '',
        screen: body.screen || '',
        timezone: body.timezone || '',
      };

      await appendVisitor(accessToken, spreadsheetId, visitorData);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('sheetsExport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});