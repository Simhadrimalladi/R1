import { Router } from 'express';
import { getTopicsBySubject } from '../controllers/topics.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.get('/subject/:subjectId', auth, getTopicsBySubject);

export default router;
