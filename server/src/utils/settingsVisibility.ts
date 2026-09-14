// Which setting keys may not leave the server through a generic settings
// response. Shared by GET /api/settings and GET /api/sites/current so the two
// cannot drift apart and leak a credential through the other endpoint.

// Credentials / system state: never returned by a generic settings GET, even to
// admins (dedicated endpoints exist: /ai/settings, /api/db/*).
const CRED_KEYS = new Set(['ai_providers', 'ai_bindings', 'installed', 'active_plugins', 'storage_secret']);
const CRED_PREFIXES = ['jwt_', 'market_', 'db_'];

// Extra keys hidden from everyone below admin (admin-only configuration the
// admin UI still needs to read and round-trip).
// widgets_* holds admin-authored custom HTML — never expose it anonymously.
// storage_* is the S3 configuration (endpoint/bucket/access key id/…); only the
// server-side storage helper needs it, and none of it belongs to an anonymous
// visitor. storage_secret itself is hidden from everyone via CRED_KEYS above.
const ADMIN_KEYS = new Set(['admin_email']);
const ADMIN_PREFIXES = ['smtp_', 'custom_templates', 'maintenance_', 'ai_', 'widgets_', 'storage_'];

export function isHiddenSettingKey(key: string, isAdmin: boolean): boolean {
  return CRED_PREFIXES.some(p => key.startsWith(p)) || CRED_KEYS.has(key)
    || (!isAdmin && (ADMIN_PREFIXES.some(p => key.startsWith(p)) || ADMIN_KEYS.has(key)));
}
