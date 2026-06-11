import { Router } from 'express';
import { getSubjects } from '../controllers/lookups.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.get('/subjects', auth, getSubjects);
export default router;
