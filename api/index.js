import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

export default async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in Vercel function:', err);
    // Return a clear 500 response so the client (and Vercel logs) show the failure
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Database connection error' }));
    return;
  }
  return app(req, res);
};
