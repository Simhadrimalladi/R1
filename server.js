import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';

const start = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`🚀 Preproute API running on port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`✅ CORS enabled for: ${env.CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();