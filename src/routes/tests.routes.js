import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  addQuestion,
  createTest,
  deleteQuestion,
  deleteTest,
  getTestById,
  getTests,
  getTracking,
  publishTest,
  updateQuestion,
  updateTest
} from '../controllers/tests.controller.js';

const router = Router();
router.use(auth);
router.get('/', getTests);
router.post('/', createTest);
router.get('/tracking', getTracking);
router.get('/:id', getTestById);
router.put('/:id', updateTest);
router.delete('/:id', deleteTest);
router.post('/:id/questions', addQuestion);
router.put('/:id/questions/:questionId', updateQuestion);
router.delete('/:id/questions/:questionId', deleteQuestion);
router.post('/:id/publish', publishTest);
export default router;
