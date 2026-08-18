import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Extension allowlist with the MIME types each extension may claim. Both the
// extension AND a matching MIME type are required, so a file cannot smuggle
// content under a mismatched pair (e.g. an SVG uploaded as image/png).
const extMimeMap: Record<string, string[]> = {
  '.jpg': ['image/jpeg'], '.jpeg': ['image/jpeg'],
  '.png': ['image/png'], '.gif': ['image/gif'], '.webp': ['image/webp'],
  '.svg': ['image/svg+xml'],
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.mp3': ['audio/mpeg', 'audio/mp3'],
  '.mp4': ['video/mp4'],
  // octet-stream included: browsers disagree on the MIME they send for .zip
  // (macOS Chrome sends application/zip, some send application/octet-stream).
  // The zip content itself is validated by assertSafeArchive on restore.
  '.zip': ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = extMimeMap[path.extname(file.originalname).toLowerCase()];
    const mimeOk = allowedMimes?.some(m => file.mimetype.startsWith(m));
    if (mimeOk) {
      cb(null, true);
    } else {
      // Client error, not a server failure: the global handler must return 400
      const err = new Error('File type not allowed') as Error & { status: number };
      err.status = 400;
      cb(err);
    }
  },
});
