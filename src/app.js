import cors from 'cors';
import express from 'express';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS configuration - allow multiple origins
const allowedOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : ['*'];
app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && allowedOrigins[0] !== '*') {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
}));

// Logging
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (_req, res) => res.json({ success: true, message: 'API is healthy' }));

// Root route
app.get('/', (_req, res) => res.json({ 
  success: true, 
  message: 'Preproute API is running',
  version: '1.0.0',
  endpoints: {
    health: '/health',
    api: '/api',
    docs: 'https://github.com/your-repo'
  }
}));

// API routes
app.use('/api', routes);

// Serve React frontend in production (if same server)
const distPath = path.join(__dirname, '../../frontend/dist');
if (env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

export default app;