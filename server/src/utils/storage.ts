// Storage abstraction: media files live either on local disk (default) or in
// an S3-compatible object store (AWS S3, Alibaba OSS, Tencent COS, MinIO...).
// Configuration is read from the Setting table (managed in Settings > Storage):
//   storage_provider  = 'local' | 's3'
//   storage_endpoint  = S3-compatible endpoint (optional; AWS default region endpoint)
//   storage_bucket    = bucket name
//   storage_region    = region
//   storage_key       = access key id
//   storage_secret    = secret access key
//   storage_public_url= public URL prefix (bucket URL or CDN; optional — falls
//                       back to the provider's own endpoint/bucket URL)
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import db from './db';
import { uploadPath } from './paths';

interface StorageCfg {
  provider: 'local' | 's3';
  endpoint: string;
  bucket: string;
  region: string;
  key: string;
  secret: string;
  publicUrl: string;
}

let cached: { cfg: StorageCfg; at: number } | null = null;

export function getStorageConfig(): StorageCfg {
  const now = Date.now();
  if (cached && now - cached.at < 5000) return cached.cfg;
  const read = (k: string): string => {
    try { return (db.prepare('SELECT value FROM Setting WHERE key = ?').get(k) as any)?.value || ''; } catch { return ''; }
  };
  const cfg: StorageCfg = {
    provider: read('storage_provider') === 's3' ? 's3' : 'local',
    endpoint: read('storage_endpoint').trim(),
    bucket: read('storage_bucket').trim(),
    region: read('storage_region').trim() || 'us-east-1',
    key: read('storage_key').trim(),
    secret: read('storage_secret'),
    publicUrl: read('storage_public_url').trim(),
  };
  cached = { cfg, at: now };
  return cfg;
}

export function invalidateStorageConfig(): void { cached = null; }

function s3Client(cfg: StorageCfg): S3Client {
  const opts: any = { region: cfg.region, credentials: { accessKeyId: cfg.key, secretAccessKey: cfg.secret } };
  if (cfg.endpoint) {
    // S3-compatible providers (OSS/COS/MinIO) use custom endpoints; force
    // path-style addressing which these providers require
    opts.endpoint = cfg.endpoint;
    opts.forcePathStyle = true;
  }
  return new S3Client(opts);
}

function bucketUrl(cfg: StorageCfg): string {
  if (cfg.publicUrl) return cfg.publicUrl.replace(/\/+$/, '');
  if (cfg.endpoint) return cfg.endpoint.replace(/\/+$/, '') + '/' + cfg.bucket;
  return 'https://' + cfg.bucket + '.s3.' + cfg.region + '.amazonaws.com';
}

// Upload a file to the configured store. key is a path inside the bucket
// (e.g. '2026/08/abc123.png'). Returns the public URL to store in Media.url.
export async function storeFile(key: string, buffer: Buffer, mime: string): Promise<string> {
  const cfg = getStorageConfig();
  if (cfg.provider === 'local') {
    const filePath = uploadPath(key);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return '/uploads/' + key;
  }
  if (!cfg.bucket || !cfg.key || !cfg.secret) throw new Error('Object storage is not configured');
  await s3Client(cfg).send(new PutObjectCommand({ Bucket: cfg.bucket, Key: key, Body: buffer, ContentType: mime }));
  return bucketUrl(cfg) + '/' + key;
}

// Delete a remote object (no-op for local files — the caller deletes the disk file)
export async function deleteRemoteFile(key: string): Promise<void> {
  const cfg = getStorageConfig();
  if (cfg.provider !== 's3' || !cfg.bucket) return;
  try {
    await s3Client(cfg).send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
  } catch (e: any) { console.log('[Storage] delete failed for ' + key + ': ' + e.message); }
}

// Test the S3 connection: head the bucket (or a probe key) to validate
// credentials + endpoint before enabling the provider.
export async function testStorageConnection(): Promise<{ ok: boolean; error?: string }> {
  const cfg = getStorageConfig();
  if (cfg.provider !== 's3') return { ok: true, error: 'local' };
  if (!cfg.bucket || !cfg.key || !cfg.secret) return { ok: false, error: 'Missing bucket or credentials' };
  try {
    await s3Client(cfg).send(new HeadObjectCommand({ Bucket: cfg.bucket, Key: '.mortar-probe' }));
    return { ok: true };
  } catch (e: any) {
    // 404 on the probe key means the bucket is reachable but the key is absent
    if (e?.name === 'NotFound') return { ok: true };
    return { ok: false, error: e?.message || String(e) };
  }
}

// Extract the object key from a stored URL (for delete/migration)
export function keyFromUrl(url: string): string {
  const cfg = getStorageConfig();
  const base = bucketUrl(cfg);
  if (url.startsWith(base + '/')) return url.slice(base.length + 1);
  return url.replace(/^\/uploads\//, '');
}
