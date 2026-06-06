import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jobRoutes from './routes/job.routes';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rate-limiter.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Global API rate limiting
app.use('/api/', apiLimiter);

// Routing Mount points
app.use('/api/jobs', jobRoutes);

// Catch-all error orchestration middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Security hardened engine deployed cleanly on port ${PORT}`);
});