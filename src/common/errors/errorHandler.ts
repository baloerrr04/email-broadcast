import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import HttpStatusCodes from '../constants/http-status-codes';
import { ErrorResponse } from '../types/errorTypes';

const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`);

  res.status(err.status || HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
    status: err.status || HttpStatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Internal Server Error'
  });
};

export default errorHandler;
