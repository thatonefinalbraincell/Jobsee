import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../utils/app-error';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: 'student' | 'employer' | 'admin';
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Unauthorized: Missing token', 401));
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return next(new AppError('Unauthorized: Invalid token', 401));
    }

    // Pull role verified from metadata / profile mapping table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'student',
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (role: 'student' | 'employer' | 'admin') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return next(new AppError('Forbidden: Access denied', 403));
    }
    next();
  };
};