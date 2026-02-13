import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many requests. Limit: 100 requests per minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createProjectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 projects per hour
  message: {
    success: false,
    error: 'Too many projects created. Try again later.'
  }
});
