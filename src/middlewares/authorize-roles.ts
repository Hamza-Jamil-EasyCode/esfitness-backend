import { Request, Response, NextFunction } from 'express';
import CustomError from '../utils/custom-error';

const authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as any;
        if (user && allowedRoles.includes(user.role)) {
            return next();
        }
        return next(new CustomError('You are not authorized', 401));
    };
};

export default authorizeRoles;
