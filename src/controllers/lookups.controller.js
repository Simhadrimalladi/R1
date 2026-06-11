import Subject from '../models/Lookup.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSubjects = asyncHandler(async (_req, res) => {
  const subjects = await Subject.find().sort({ name: 1 });
  res.json({ success: true, data: subjects });
});
