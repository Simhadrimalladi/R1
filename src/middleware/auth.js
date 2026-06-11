import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const auth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Missing access token');
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) throw new ApiError(401, 'Invalid access token');
    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Unauthorized'));
  }
};
