import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../utils/app-error';

/**
 * Submit a new job application
 * Role: Student
 */
export const applyToJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { job_id, cover_letter } = req.body;
    const student_id = req.user?.id;

    if (!job_id) {
      return next(new AppError('Job ID is required to apply.', 400));
    }

    // 1. Verify the targeted job post actually exists and is active
    const { data: job, error: jobError } = await supabaseAdmin
      .from('job_posts')
      .select('is_active')
      .eq('id', job_id)
      .single();

    if (jobError || !job || !job.is_active) {
      return next(new AppError('This job position is no longer accepting applications.', 404));
    }

    // 2. Submit application into database (Unique constraint handles duplicate prevention)
    const { data: application, error: appError } = await supabaseAdmin
      .from('job_applications')
      .insert({
        job_id,
        student_id,
        cover_letter,
        status: 'pending'
      })
      .select()
      .single();

    if (appError) {
      // PostgreSQL Unique Violation Code
      if (appError.code === '23505') {
        return next(new AppError('You have already applied to this position.', 400));
      }
      return next(new AppError(appError.message, 400));
    }

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully.',
      data: application
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all applications submitted by the logged-in student
 * Role: Student
 */
export const getStudentApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student_id = req.user?.id;

    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .select(`
        id,
        status,
        created_at,
        job_posts (
          id,
          title,
          type,
          pay_amount,
          pay_period,
          location_address,
          employer_profiles (
            company_name
          )
        )
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) return next(new AppError(error.message, 400));

    res.status(200).json({
      status: 'success',
      results: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all applicants for a specific job post owned by the employer
 * Role: Employer
 */
export const getJobApplicants = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const employer_id = req.user?.id;

    // 1. Double check that this job actually belongs to the requesting employer
    const { data: job, error: jobCheckError } = await supabaseAdmin
      .from('job_posts')
      .select('id')
      .eq('id', jobId)
      .eq('employer_id', employer_id)
      .single();

    if (jobCheckError || !job) {
      return next(new AppError('Access denied: Job posting not found or unauthorized.', 403));
    }

    // 2. Extract application and student profile details
    const { data: applications, error } = await supabaseAdmin
      .from('job_applications')
      .select(`
        id,
        status,
        cover_letter,
        created_at,
        student_profiles (
          id,
          college,
          department,
          skills,
          availability,
          resume_url,
          profiles (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) return next(new AppError(error.message, 400));

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: applications
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update application state (Accept / Reject / Reviewing)
 * Role: Employer
 */
export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // expected: 'reviewed' | 'accepted' | 'rejected'
    const employer_id = req.user?.id;

    if (!['reviewed', 'accepted', 'rejected'].includes(status)) {
      return next(new AppError('Invalid application status state targeted.', 400));
    }

    // 1. Find the application and make sure it maps back to a job owned by this employer
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('job_applications')
      .select('id, job_id, job_posts(employer_id)')
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return next(new AppError('Application record tracking reference not found.', 404));
    }

    // Safely parse nested relationship query output mapping
    const jobPostOwnerId = (application.job_posts as any)?.employer_id;
    if (jobPostOwnerId !== employer_id) {
      return next(new AppError('Forbidden: Access denied to modify this resource.', 403));
    }

    // 2. Perform safe atomic state transition update
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('job_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) return next(new AppError(updateError.message, 400));

    res.status(200).json({
      status: 'success',
      message: `Application shifted successfully to state: ${status}`,
      data: updatedApplication
    });
  } catch (err) {
    next(err);
  }
};