import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../utils/app-error';

export const createJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, type, skills_required, pay_amount, pay_period, duration, openings, location_address, latitude, longitude } = req.body;
    const employer_id = req.user?.id;

    if (!title || !pay_amount || !latitude || !longitude) {
      return next(new AppError('Missing required parameters', 400));
    }

    // Format Point for PostGIS: POINT(longitude latitude)
    const geoPoint = `POINT(${longitude} ${latitude})`;

    const { data, error } = await supabaseAdmin
      .from('job_posts')
      .insert({
        employer_id,
        title,
        description,
        type,
        skills_required,
        pay_amount,
        pay_period,
        duration,
        openings,
        location_address,
        location_geo: geoPoint
      })
      .select()
      .single();

    if (error) return next(new AppError(error.message, 400));

    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const getNearbyJobs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius_meters = 10000, limit = 10, page = 1 } = req.query;

    if (!lat || !lng) {
      return next(new AppError('Latitude and longitude are required parameters.', 400));
    }

    const offset = (Number(page) - 1) * Number(limit);

    // Dynamic clean RPC execution or raw SQL mapping via Supabase RPC endpoint for PostGIS execution
    // Selects jobs sorted by distance calculation using St_Distance
    const { data, error } = await supabaseAdmin.rpc('get_jobs_ordered_by_distance', {
      user_lat: parseFloat(lat as string),
      user_lng: parseFloat(lng as string),
      radius_m: parseFloat(radius_meters as string),
      row_limit: Number(limit),
      row_offset: offset
    });

    if (error) return next(new AppError(error.message, 400));

    res.status(200).json({ status: 'success', page: Number(page), results: data?.length || 0, data });
  } catch (err) {
    next(err);
  }
};