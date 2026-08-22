import path from 'path';

// Uploads directory — the real site uses server/uploads, tests override it
// with UPLOADS_DIR so scratch instances never touch real media files.
export const UPLOADS_DIR: string = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
export const uploadPath = (...parts: string[]): string => path.join(UPLOADS_DIR, ...parts);
