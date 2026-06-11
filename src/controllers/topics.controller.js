import Subject from '../models/Lookup.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getTopicsBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, 'Subject not found');
  }
  const data = subject.topics.map(topic => ({
    id: topic._id.toString(),
    name: topic.name,
    subject_id: subject._id.toString()
  }));
  res.json({ success: true, data });
});
