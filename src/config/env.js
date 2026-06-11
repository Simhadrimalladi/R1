import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://Preproute:ramya123@cluster0.fxxkf4u.mongodb.net/preproute_test_management?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || 'production-super-secret-jwt-key-change-this',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://preproute-frontend-drab.vercel.app'
};