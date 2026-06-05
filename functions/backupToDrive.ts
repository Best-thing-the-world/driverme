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

const FILE_NAME_KEY = 'drive_backup_file_id';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authentication — no anonymous Drive writes
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Google Drive access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    const payload = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const favorites = Array.isArray(payload.favorites) ? payload.favorites : [];

    const backupData = {
      album: "THE AFTER PARTY",
      artist: "SaadiQ",
      backed_up_at: new Date().toISOString(),
      tracklist: TRACKLIST,
      user_favorites: favorites.map(id => TRACKLIST.find(t => t.id === id)).filter(Boolean),
    };

    const jsonContent = JSON.stringify(backupData, null, 2);
    const fileName = `SaadiQ_AfterParty_Backup_${new Date().toISOString().split('T')[0]}.json`;

    // Check if we have a stored file ID to update
    let existingFileId = null;
    try {
      const meta = await base44.asServiceRole.entities.AppMeta.filter({ key: FILE_NAME_KEY });
      if (meta && meta.length > 0) existingFileId = meta[0].value;
    } catch (_) {}

    let driveFileId;

    if (existingFileId) {
      const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: jsonContent,
      });

      if (updateRes.ok) {
        const data = await updateRes.json();
        driveFileId = data.id;
      } else {
        const err = await updateRes.text();
        console.error('Drive update error:', err);
        throw new Error('Failed to update Drive backup file');
      }
    }

    if (!existingFileId) {
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;
      const metadata = JSON.stringify({ name: fileName, mimeType: 'application/json' });

      const multipartBody =
        delimiter + 'Content-Type: application/json\r\n\r\n' +
        metadata +
        delimiter + 'Content-Type: application/json\r\n\r\n' +
        jsonContent +
        closeDelimiter;

      const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartBody,
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        console.error('Drive create error:', err);
        return Response.json({ error: 'Failed to create Drive file' }, { status: 500 });
      }

      const data = await createRes.json();
      driveFileId = data.id;

      try {
        await base44.asServiceRole.entities.AppMeta.create({ key: FILE_NAME_KEY, value: driveFileId });
      } catch (_) {}
    }

    return Response.json({ success: true, file_id: driveFileId, backed_up_at: backupData.backed_up_at });
  } catch (error) {
    console.error('Backup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});