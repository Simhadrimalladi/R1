import { Router } from 'express';
import { bulkCreateQuestions, fetchBulkQuestions } from '../controllers/questions.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.post('/bulk', auth, bulkCreateQuestions);
router.post('/fetchBulk', auth, fetchBulkQuestions);

export default router;
