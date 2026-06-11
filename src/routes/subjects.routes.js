import { Router } from 'express';
import { getSubjects } from '../controllers/subjects.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.get('/', auth, getSubjects);

export default router;
