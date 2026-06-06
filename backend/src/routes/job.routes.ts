import { Router } from 'express';
import { createJob, getNearbyJobs } from '../controllers/job.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, requireRole('employer'), createJob);
router.get('/nearby', getNearbyJobs);

export default router;