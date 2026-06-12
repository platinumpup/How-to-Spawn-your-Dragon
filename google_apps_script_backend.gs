/**
 * How to Spawn Your Dragon - Google Sheets backend
 * 2026 © PlatinumBoy
 */
const SHEET_NAME = "Dragon Logs";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["id", "timestamp", "x", "y", "relative_x", "relative_y", "result", "client_id"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const logs = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue;
    logs.push({
      id: row[0],
      ts: row[1],
      x: Number(row[2]),
      y: Number(row[3]),
      rx: Number(row[4]),
      ry: Number(row[5]),
      result: row[6],
      clientId: row[7]
    });
  }
  return json_({ ok: true, count: logs.length, logs: logs });
}

function doPost(e) {
  const p = e.parameter;
  const id = String(p.id || Utilities.getUuid());
  const timestamp = String(p.ts || new Date().toISOString());
  const x = Number(p.x), y = Number(p.y), rx = Number(p.rx), ry = Number(p.ry);
  const result = String(p.result || "").toUpperCase() === "YES" ? "YES" : "NO";
  const clientId = String(p.clientId || "");

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(rx) || !Number.isFinite(ry)) {
    return json_({ ok: false, error: "Invalid coordinates." });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const last = sheet.getLastRow();
    if (last > 1) {
      const ids = sheet.getRange(2, 1, last - 1, 1).getValues().flat();
      if (ids.includes(id)) return json_({ ok: true, duplicate: true, id: id });
    }
    sheet.appendRow([id, timestamp, x, y, rx, ry, result, clientId]);
    return json_({ ok: true, id: id });
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
