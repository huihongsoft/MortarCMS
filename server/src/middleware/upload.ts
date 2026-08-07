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

// Extension allowlist
const allowedExt = /\.(jpe?g|png|gif|webp|svg|pdf|docx?|mp3|mp4|zip)$/i;
// MIME allowlist (exact prefix match, not substring)
const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'audio/mpeg', 'audio/mp3', 'video/mp4', 'application/zip', 'application/x-zip-compressed',
];

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const extOk = allowedExt.test(path.extname(file.originalname));
    const mimeOk = allowedMimes.some(m => file.mimetype.startsWith(m));
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});
