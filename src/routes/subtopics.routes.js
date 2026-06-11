import { Router } from 'express';
import { getSubTopicsByTopic, getSubTopicsByMultiTopics } from '../controllers/subtopics.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.get('/topic/:topicId', auth, getSubTopicsByTopic);
router.post('/multi-topics', auth, getSubTopicsByMultiTopics);

export default router;
