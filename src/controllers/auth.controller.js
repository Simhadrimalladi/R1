import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema } from '../utils/validators.js';

const signToken = (user) => jwt.sign(
  { sub: user._id, username: user.username, role: user.role }, 
  env.JWT_SECRET, 
  { expiresIn: env.JWT_EXPIRES_IN }
);

export const login = asyncHandler(async (req, res) => {
  console.log('🔍 Login request body:', JSON.stringify(req.body));
  
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid login payload', parsed.error.flatten());
  }
  
  const { username, userId, password } = parsed.data;
  const loginIdentifier = username || userId;
  console.log('🔍 Login identifier:', loginIdentifier);
  
  // Find user
  const user = await User.findOne({ username: loginIdentifier, isActive: true });
  console.log('🔍 User found:', user ? `yes (${user.username})` : 'no');
  
  if (!user) {
    // For testing - create a temporary admin user if none exists
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📝 No users found, creating default admin user...');
      const hashedPassword = await User.hashPassword('admin123');
      const defaultUser = await User.create({
        username: 'admin',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true
      });
      console.log('✅ Default admin user created: admin / admin123');
      
      const token = signToken(defaultUser);
      return res.json({
        success: true,
        data: {
          token,
          user: { 
            id: defaultUser._id, 
            username: defaultUser.username, 
            name: defaultUser.name, 
            role: defaultUser.role, 
            avatar: defaultUser.avatar 
          }
        }
      });
    }
    throw new ApiError(401, 'Invalid username or password');
  }
  
  const passwordMatch = await user.comparePassword(password);
  console.log('🔍 Password match:', passwordMatch);
  
  if (!passwordMatch) {
    throw new ApiError(401, 'Invalid username or password');
  }
  
  const token = signToken(user);
  res.json({
    success: true,
    data: {
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        name: user.name, 
        role: user.role, 
        avatar: user.avatar 
      }
    }
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});