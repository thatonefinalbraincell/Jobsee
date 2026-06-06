import { Router } from 'express';
import { 
  applyToJob, 
  getStudentApplications, 
  getJobApplicants, 
  updateApplicationStatus 
} from '../controllers/application.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Student accessible lanes
router.post('/apply', requireAuth, requireRole('student'), applyToJob);
router.get('/student/my-applications', requireAuth, requireRole('student'), getStudentApplications);

// Employer accessible lanes
router.get('/employer/job/:jobId', requireAuth, requireRole('employer'), getJobApplicants);
router.patch('/status/:applicationId', requireAuth, requireRole('employer'), updateApplicationStatus);

export default router;