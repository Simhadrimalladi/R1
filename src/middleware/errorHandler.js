import { env } from '../config/env.js';

export function errorHandler(error, _req, res, _next) {
  // Always log the error so Vercel/server logs contain stack and message
  console.error(error);
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'Internal server error',
    details: error.details || null
  };
  // Include stack trace in non-production for easier debugging
  if (env.NODE_ENV !== 'production') payload.stack = error.stack;
  res.status(statusCode).json(payload);
}