import db from './db';

// Field definitions for a content type, and the validation of the values that
// come back for them.
//
// Values live in PostMeta as strings (that is what the column is), so every type
// here is validated and then normalised to the single string form the rest of
// the app already reads. A definition is what makes a key typed; a key with no
// definition is still accepted as a plain string, because the editor has always
// allowed free-form key/value rows and silently dropping those would delete
// data people are already using.

export type FieldType = 'text' | 'textarea' | 'richtext' | 'number' | 'boolean' | 'date' | 'select' | 'media' | 'relation';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  default?: string;
  options?: string[];
  hint?: string;
}

export interface FieldGroup {
  id: string;
  typeSlug: string;
  name: string;
  fields: FieldDef[];
  menuOrder: number;
  siteId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const FIELD_TYPES: FieldType[] = ['text', 'textarea', 'richtext', 'number', 'boolean', 'date', 'select', 'media', 'relation'];

// A field key becomes a PostMeta key and is handed to themes, so it has to look
// like an identifier — and it may NOT start with an underscore. The underscore
// namespace belongs to the application (`_seo_*`, `_visual_css`,
// `_members_only`); a user field landing there could silently change how the
// post is published or gated.
const KEY_RE = /^[a-z][a-z0-9_]{0,40}$/;

export function isValidFieldKey(key: string): boolean {
  return KEY_RE.test(key) && !key.startsWith('_');
}

// Meta keys a client may write that are not user fields. Anything else starting
// with '_' is refused by the post/page routes: the underscore namespace is
// otherwise a way to forge or clear the flags the app itself acts on.
export const CLIENT_SYSTEM_META_KEYS = new Set([
  '_seo_title', '_seo_desc', '_seo_canonical', '_seo_og_image', '_seo_noindex', '_seo_primary_category', '_visual_css',
]);

export function loadFieldGroups(): FieldGroup[] {
  try {
    const rows = db.prepare('SELECT * FROM FieldGroup ORDER BY menuOrder ASC, name ASC').all() as any[];
    return rows.map(r => {
      let fields: FieldDef[] = [];
      try { fields = JSON.parse(r.fields || '[]'); } catch { fields = []; }
      return { ...r, fields: Array.isArray(fields) ? fields : [] };
    });
  } catch { return []; }
}

// Every field defined for a type, in group then field order. Definitions are
// matched per type slug, so a custom type's fields never leak onto posts.
export function fieldsForType(typeSlug: string): FieldDef[] {
  return loadFieldGroups()
    .filter(g => g.typeSlug === typeSlug)
    .flatMap(g => g.fields);
}

export function fieldKeysForType(typeSlug: string): Set<string> {
  return new Set(fieldsForType(typeSlug).map(f => f.key));
}

function asString(v: unknown): string {
  return v === undefined || v === null ? '' : String(v);
}

// Normalise one value to the string form its type stores. Shared by the request
// path and by the definition path, so a stored default can never be a value the
// same field would reject from a request.
function coerceField(def: FieldDef, v: string): { value: string } | { error: string } {
  switch (def.type) {
    case 'number': {
      const n = Number(v);
      if (!Number.isFinite(n)) return { error: def.label + ' 必须是数字' };
      return { value: String(n) };
    }
    case 'boolean':
      // Accept what a form or an API client is likely to send, store '1'/''.
      return { value: ['1', 'true', 'on', 'yes'].includes(v.toLowerCase()) ? '1' : '' };
    case 'date': {
      const t = Date.parse(v);
      if (!Number.isFinite(t)) return { error: def.label + ' 必须是有效日期' };
      return { value: new Date(t).toISOString() };
    }
    case 'select': {
      const opts = def.options || [];
      if (opts.length && !opts.includes(v)) return { error: def.label + ' 的值不在选项中' };
      return { value: v.slice(0, 200) };
    }
    default:
      return { value: v.slice(0, def.type === 'richtext' ? 200_000 : 20_000) };
  }
}

/**
 * Validate a `meta` payload against the fields defined for `typeSlug`.
 *
 * Returns the values to store (normalised strings) or the first error. Keys
 * starting with `_` are limited to the system allowlist; defined field keys are
 * coerced per type; everything else is kept as a plain string, which is what the
 * free-form key/value editor has always produced.
 */
export function validateMeta(
  typeSlug: string,
  meta: unknown,
  // Bulk edits set one key across many posts, so the required sweep must be
  // skippable there — otherwise a type with a required field would reject a
  // batch that never meant to touch it.
  opts: { checkRequired?: boolean } = {},
): { ok: true; values: Record<string, string> } | { ok: false; error: string } {
  if (meta === undefined || meta === null) return { ok: true, values: {} };
  if (typeof meta !== 'object' || Array.isArray(meta)) return { ok: false, error: 'meta 必须是对象' };
  const defs = new Map(fieldsForType(typeSlug).map(f => [f.key, f]));
  const values: Record<string, string> = {};

  for (const [key, raw] of Object.entries(meta as Record<string, unknown>)) {
    if (typeof key !== 'string' || !key.trim()) return { ok: false, error: 'meta 字段名不能为空' };
    if (key.startsWith('_')) {
      if (!CLIENT_SYSTEM_META_KEYS.has(key)) return { ok: false, error: '不允许写入系统字段: ' + key };
      values[key] = asString(raw).slice(0, 2000);
      continue;
    }
    const def = defs.get(key);
    if (!def) {
      // No definition: a free-form row. Capped so one field cannot bloat the row.
      values[key] = asString(raw).slice(0, 20000);
      continue;
    }
    const v = asString(raw).trim();
    if (v === '') {
      // An empty value means "cleared" — keep it as an empty string so the
      // writer deletes the row (see utils/postMeta).
      values[key] = '';
      continue;
    }
    const coerced = coerceField(def, v);
    if ('error' in coerced) return { ok: false, error: coerced.error };
    values[key] = coerced.value;
  }
  // A required field must be present and non-empty. Checked against the whole
  // definition list, not just the keys the payload happened to mention: a
  // payload that silently omits a required field is the case this exists for.
  // (A request that sends no `meta` at all is not managing fields — see
  // validateAndCoerceMeta — so this only applies once the caller opts in.)
  // A defined default fills in for a field the payload says nothing about. An
  // explicitly cleared field ('' in the payload) keeps its empty value — only
  // an absent key takes the default.
  for (const def of defs.values()) {
    if (values[def.key] === undefined && def.default !== undefined && def.default !== '') values[def.key] = def.default;
  }
  if (opts.checkRequired !== false) {
    for (const def of defs.values()) {
      if (def.required && !values[def.key]) return { ok: false, error: def.label + ' 为必填' };
    }
  }
  return { ok: true, values };
}

// Route helper: validate, or answer 400 and hand back null so the caller just
// returns. `meta === undefined` means the payload said nothing about fields,
// which is not the same as "clear them all" — an empty object means that.
export function validateAndCoerceMeta(
  typeSlug: string,
  meta: unknown,
  res: { status: (code: number) => { json: (body: unknown) => void } },
): Record<string, string> | null {
  if (meta === undefined) return {};
  const v = validateMeta(typeSlug, meta);
  if (!v.ok) { res.status(400).json({ error: v.error }); return null; }
  return v.values;
}

// Shape check for a definition list coming from the admin form: reject bad keys
// and duplicates here rather than storing a group the editor cannot render.
export function normalizeFieldDefs(input: unknown): { ok: true; fields: FieldDef[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: 'fields 必须是数组' };
  const out: FieldDef[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    const f = (raw || {}) as any;
    const key = String(f.key || '').trim();
    const label = String(f.label || '').trim() || key;
    const type = String(f.type || 'text') as FieldType;
    if (!isValidFieldKey(key)) return { ok: false, error: '字段名不合法（小写字母开头，不能以下划线开头）: ' + key };
    if (seen.has(key)) return { ok: false, error: '字段名重复: ' + key };
    if (!FIELD_TYPES.includes(type)) return { ok: false, error: '未知字段类型: ' + type };
    seen.add(key);
    // A default is normalised through the SAME coercion the field applies to a
    // submitted value, so a definition cannot store a default its own type
    // would reject — the admin sees the error here instead of a save-time 400
    // on every post that omits the field.
    let def: string | undefined;
    if (f.default !== undefined && String(f.default) !== '') {
      const coerced = coerceField({ key, label, type, options: type === 'select' ? (Array.isArray(f.options) ? f.options.map((o: any) => String(o)) : []) : undefined }, String(f.default).slice(0, 2000));
      if ('error' in coerced) return { ok: false, error: coerced.error };
      def = coerced.value;
    }
    out.push({
      key,
      label,
      type,
      required: !!f.required,
      default: def,
      options: type === 'select' ? (Array.isArray(f.options) ? f.options.map((o: any) => String(o).slice(0, 200)).filter(Boolean) : []) : undefined,
      hint: f.hint === undefined ? undefined : String(f.hint).slice(0, 300),
    });
  }
  return { ok: true, fields: out };
}
