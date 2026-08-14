// SQL dialect translation: the app writes SQLite-flavored SQL everywhere
// (strftime, INSERT OR IGNORE, ON CONFLICT, datetime(), date('now'), TEXT
// columns in DDL). These pure functions translate it to MySQL/PostgreSQL
// before the query hits the wire. Kept dependency-free so unit tests can
// exercise them without the worker thread.
'use strict';

// strftime('fmt', col) with one level of nested parens in col (e.g. COALESCE)
const STRFTIME_RE = /strftime\(\s*'([^']+)'\s*,\s*((?:[^()]|\([^()]*\))*)\)/gi;
const DATETIME_RE = /datetime\(([^)]+)\)/gi;
const DATE_NOW_RE = /date\(\s*'now'\s*\)/gi;

// ISO-8601 strings are stored as TEXT; engines need them normalized before
// date math. 'T' separator and trailing 'Z' are stripped for MySQL.
function mysqlDateExpr(x) {
  return 'CAST(REPLACE(REPLACE(' + x + ", 'T', ' '), 'Z', '') AS DATETIME)";
}

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
  // INSERT OR IGNORE -> INSERT IGNORE
  sql = sql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT IGNORE INTO');
  // strftime('%Y-%m', col) -> DATE_FORMAT on a normalized datetime
  sql = sql.replace(STRFTIME_RE, (m, fmt, col) => 'DATE_FORMAT(' + mysqlDateExpr(col) + ", '" + fmt + "')");
  // datetime(x) -> CAST(normalized AS DATETIME)
  sql = sql.replace(DATETIME_RE, (m, x) => mysqlDateExpr(x));
  // date('now') -> CURDATE()
  sql = sql.replace(DATE_NOW_RE, 'CURDATE()');
  // DDL: MySQL cannot index TEXT columns — keys/uniques become VARCHAR(191)
  sql = sql.replace(/CREATE TABLE IF NOT EXISTS/gi, 'CREATE TABLE IF NOT EXISTS');
  sql = sql.replace(/\bTEXT\s+PRIMARY KEY/gi, 'VARCHAR(191) PRIMARY KEY');
  sql = sql.replace(/\bTEXT\s+UNIQUE/gi, 'VARCHAR(191) UNIQUE');
  return sql;
}

// strftime format -> PostgreSQL to_char format
function pgFmt(fmt) {
  return String(fmt || '')
    .replace(/%Y/g, 'YYYY').replace(/%y/g, 'YY')
    .replace(/%m/g, 'MM').replace(/%d/g, 'DD')
    .replace(/%H/g, 'HH24').replace(/%M/g, 'MI').replace(/%S/g, 'SS')
    .replace(/%e/g, 'DD').replace(/%j/g, 'DDD');
}

function translatePg(sql) {
  let n = 0;
  let ignoreInsert = false;
  sql = sql.replace(/INSERT OR IGNORE INTO/gi, () => { ignoreInsert = true; return 'INSERT INTO'; });
  sql = sql.replace(/\?/g, () => '$' + (++n));
  sql = sql.replace(STRFTIME_RE, (m, fmt, col) => "to_char((" + col + ')::timestamptz, \'' + pgFmt(fmt) + '\')');
  sql = sql.replace(DATETIME_RE, (m, x) => '(' + x + ')::timestamptz');
  sql = sql.replace(DATE_NOW_RE, 'CURRENT_DATE');
  if (ignoreInsert) sql += ' ON CONFLICT DO NOTHING';
  return sql;
}

module.exports = { translateMysql, translatePg, pgFmt };
