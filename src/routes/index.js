import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import lookupRoutes from './lookups.routes.js';
import testRoutes from './tests.routes.js';
import subjectsRoutes from './subjects.routes.js';
import topicsRoutes from './topics.routes.js';
import subTopicsRoutes from './subtopics.routes.js';
import questionsRoutes from './questions.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'Preproute API is healthy' }));
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/lookups', lookupRoutes);
router.use('/tests', testRoutes);
router.use('/subjects', subjectsRoutes);
router.use('/topics', topicsRoutes);
router.use('/sub-topics', subTopicsRoutes);
router.use('/questions', questionsRoutes);

export default router;