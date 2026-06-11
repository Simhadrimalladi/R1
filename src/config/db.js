import mongoose from 'mongoose';
import { env } from './env.js';

let cachedConnection = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  }

  if (cachedConnection) {
    try {
      await cachedConnection;
      console.log('Using cached MongoDB connection');
      return mongoose.connection;
    } catch (error) {
      console.error('Cached connection failed:', error);
      cachedConnection = null;
    }
  }

  mongoose.set('strictQuery', true);
  
  const options = {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority'
  };
  
  console.log('Connecting to MongoDB Atlas...');
  cachedConnection = mongoose.connect(env.MONGODB_URI, options);
  
  try {
    await cachedConnection;
    console.log(`✅ MongoDB connected successfully to: ${mongoose.connection.db.databaseName}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    cachedConnection = null;
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});