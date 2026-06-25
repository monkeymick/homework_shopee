const pool = require("../config/db");

async function logSyncStatus(syncType, status, errorMessage = null) {
  try {
    const query = `INSERT INTO api_sync_logs (sync_type, status, error_message) VALUES (?, ?, ?)`;
    await pool.query(query, [syncType, status, errorMessage]);
  } catch (err) {
    console.error("Failed to write sync log to DB:", err);
  }
}

module.exports = { logSyncStatus };
