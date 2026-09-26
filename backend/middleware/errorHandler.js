import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err, 'Unhandled Exception');
  
  const statusCode = err.statusCode || 500;
  
  const message = statusCode === 500 
    ? 'An internal server error occurred.' 
    : err.message;

  res.status(statusCode).json({ error: message });
};
