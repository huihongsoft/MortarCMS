// DB worker: runs async MySQL/PostgreSQL drivers on a dedicated thread so the
// main thread can block (Atomics.wait) and keep the synchronous db interface.
const { parentPort } = require('worker_threads');

let client = null;
let driver = null;

// --- SQL dialect translation (MySQL) ---
function translateMysql(sql) {
  // SQLite upsert -> MySQL upsert
  sql = sql.replace(/ON CONFLICT\(([^)]+)\) DO UPDATE SET ([^;]*?)(?=\s*;|$)/g, (m, cols, setPart) => {
    const updates = setPart.split(',').map(s => {
      const mm = s.match(/(\w+)\s*=\s*excluded\.(\w+)/);
      if (mm) return mm[1] + ' = VALUES(' + mm[2] + ')';
      return s.trim();
    }).join(', ');
    return 'ON DUPLICATE KEY UPDATE ' + updates;
  });
  return sql;
}

// --- PostgreSQL: ? -> $n placeholders ---
function translatePg(sql) {
  let n = 0;
  return sql.replace(/\?/g, () => '$' + (++n));
}

async function init(conn) {
  driver = conn.driver; // 'mysql' | 'postgres'
  if (driver === 'mysql') {
    const mysql = require('mysql2/promise');
    const base = { host: conn.host, port: conn.port, user: conn.user, password: conn.password, connectTimeout: 5000 };
    // ensure database exists
    const bare = await mysql.createConnection(base);
    await bare.query('CREATE DATABASE IF NOT EXISTS `' + conn.database + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await bare.end();
    client = await mysql.createPool({ ...base, database: conn.database, waitForConnections: true, connectionLimit: 1 });
    await client.query('SET time_zone = "+00:00"');
  } else {
    const { Pool } = require('pg');
    client = new Pool({ host: conn.host, port: conn.port, user: conn.user, password: conn.password, database: conn.database, max: 1, connectionTimeoutMillis: 5000 });
  }
  return { ok: true };
}

async function execSql(sql) {
  if (driver === 'mysql') {
    await client.query(translateMysql(sql));
  } else {
    await client.query(translatePg(sql));
  }
  return { ok: true };
}

async function run(sql, args) {
  const t = driver === 'mysql' ? translateMysql(sql) : translatePg(sql);
  const [res] = await client.query(t, args);
  return { ok: true, changes: driver === 'mysql' ? (res.affectedRows || 0) : (res.rowCount || 0), lastInsertRowid: driver === 'mysql' ? (res.insertId || 0) : 0 };
}

async function get(sql, args) {
  const t = driver === 'mysql' ? translateMysql(sql) : translatePg(sql);
  const [rows] = await client.query(t, args);
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { ok: true, row: row || null };
}

async function all(sql, args) {
  const t = driver === 'mysql' ? translateMysql(sql) : translatePg(sql);
  const [rows] = await client.query(t, args);
  return { ok: true, rows: Array.isArray(rows) ? rows : [] };
}

async function closeDb() {
  try { await client.end(); } catch {}
  return { ok: true };
}

parentPort.on('message', async (msg) => {
  try {
    let result;
    switch (msg.op) {
      case 'init': result = await init(msg.conn); break;
      case 'exec': result = await execSql(msg.sql); break;
      case 'run': result = await run(msg.sql, msg.args); break;
      case 'get': result = await get(msg.sql, msg.args); break;
      case 'all': result = await all(msg.sql, msg.args); break;
      case 'close': result = await closeDb(); break;
      default: result = { ok: false, error: 'unknown op' };
    }
    parentPort.postMessage({ id: msg.id, result });
  } catch (e) {
    parentPort.postMessage({ id: msg.id, result: { ok: false, error: e.message } });
  }
});
