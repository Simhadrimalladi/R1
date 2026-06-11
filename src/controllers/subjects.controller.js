import Subject from '../models/Lookup.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({});
  const data = subjects.map(subject => ({
    id: subject._id.toString(),
    name: subject.name
  }));
  res.json({ success: true, data });
});
