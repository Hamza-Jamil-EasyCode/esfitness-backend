import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/default';
import CustomError from '../utils/custom-error';

// Extend the Express Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new CustomError('Authorization token is missing or invalid', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwtSecret!) as JwtPayload;
        req.user = decoded as JwtPayload;
        next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return next(new CustomError('Invalid or expired token', 401));
    }
};

export default authMiddleware;
