// Structured application logger (pino). JSON in production so a log shipper
// can parse it; pretty-ish level in development. Request logs are added by
// pino-http in index.ts, which also assigns each request an id.
import pino from 'pino';
import { config } from './config';

const level = process.env.LOG_LEVEL || (config.isProduction ? 'info' : 'debug');

export const logger = pino({
  level,
  base: undefined, // drop pid/hostname noise; add back if your platform wants them
  timestamp: pino.stdTimeFunctions.isoTime,
  // Never log credentials or session material.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'token',
      'apiKey',
    ],
    censor: '[redacted]',
  },
});
