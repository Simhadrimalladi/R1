import Subject from '../models/Lookup.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getSubTopicsByTopic = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const subject = await Subject.findOne({ 'topics._id': topicId });
  if (!subject) {
    throw new ApiError(404, 'Topic not found');
  }
  const topic = subject.topics.id(topicId) || subject.topics.find(t => t._id.toString() === topicId);
  const data = topic.subTopics.map(subTopic => ({
    id: subTopic._id.toString(),
    name: subTopic.name,
    topic_id: topic._id.toString()
  }));
  res.json({ success: true, data });
});

export const getSubTopicsByMultiTopics = asyncHandler(async (req, res) => {
  const { topicIds } = req.body;
  if (!Array.isArray(topicIds) || topicIds.length === 0) {
    return res.json({ success: true, data: [] });
  }
  const subjects = await Subject.find({ 'topics._id': { $in: topicIds } });
  const data = [];
  
  // Keep track of added subtopic IDs to prevent duplicates
  const seenSubTopics = new Set();

  for (const subject of subjects) {
    for (const topic of subject.topics) {
      if (topicIds.includes(topic._id.toString())) {
        for (const subTopic of topic.subTopics) {
          const subTopicId = subTopic._id.toString();
          if (!seenSubTopics.has(subTopicId)) {
            seenSubTopics.add(subTopicId);
            data.push({
              id: subTopicId,
              name: subTopic.name,
              topic_id: topic._id.toString()
                });
          }
        }
      }
    }
  }
  res.json({ success: true, data });
});
