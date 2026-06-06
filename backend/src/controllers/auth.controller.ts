import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../utils/app-error';

/**
 * Register a new user (Student or Employer)
 * Route: POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, full_name, role, company_name, college, department } = req.body;

    // 1. Core input validation
    if (!email || !password || !full_name || !role) {
      return next(new AppError('Missing required registration parameters.', 400));
    }

    if (!['student', 'employer'].includes(role)) {
      return next(new AppError('Invalid user role specified.', 400));
    }

    // 2. Sign up user inside Supabase Auth Go-layer
    // Passing full_name and role inside user_metadata triggers public.handle_new_user() SQL trigger automatically.
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role
        }
      }
    });

    if (authError || !authData.user) {
      return next(new AppError(authError?.message || 'Authentication signup failed.', 400));
    }

    const userId = authData.user.id;

    // 3. Populate sub-profile entities depending on the targeted role
    if (role === 'employer') {
      if (!company_name) {
        return next(new AppError('Company name is required for employer registration.', 400));
      }
      const { error: empError } = await supabaseAdmin
        .from('employer_profiles')
        .insert({
          id: userId,
          company_name,
          description: ''
        });

      if (empError) return next(new AppError(empError.message, 500));

    } else if (role === 'student') {
      if (!college || !department) {
        return next(new AppError('College and Department details are required for students.', 400));
      }
      const { error: studentError } = await supabaseAdmin
        .from('student_profiles')
        .insert({
          id: userId,
          college,
          department,
          skills: [],
          availability: { days: [], hours: "" }
        });

      if (studentError) return next(new AppError(studentError.message, 500));
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please verify your email if required.',
      data: {
        userId,
        email,
        role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Authenticate User & Return Session Context
 * Route: POST /api/auth/login
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both an email and password.', 400));
    }

    // Authenticate credentials using Supabase Auth Engine
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      return next(new AppError('Invalid login credentials provided.', 401));
    }

    // Fetch the customized profile role verification metadata payload mapping
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return next(new AppError('User profile context matching entity not found.', 404));
    }

    // Return access token details cleanly to client-side collector
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      token: data.session.access_token,
      expiresIn: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        role: profile.role
      }
    });
  } catch (err) {
    next(err);
  }
};