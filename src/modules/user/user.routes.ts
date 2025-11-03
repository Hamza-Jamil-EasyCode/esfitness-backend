import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, signin, forgotPassword, resetPassword, sendSocketData, verifyEmail, signup } from './user.controller';
import asyncHandler from '../../utils/async-handler';
import validateRequest from '../../middlewares/validate-request';
import {
    createUserSchema,
    updateUserSchema,
    getUserByIdSchema,
    deleteUserSchema,
    signinSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    socketDataSchema,
    verifyEmailSchema
} from './user.validation';
import authMiddleware from '../../middlewares/auth';
import authorizeRoles from '../../middlewares/authorize-roles';
import { UserRole } from './user.constants';

const router = Router();

router.get('/', authMiddleware, authorizeRoles([UserRole.ADMIN]), asyncHandler(getUsers));
router.get('/:id', authMiddleware, authorizeRoles([UserRole.ADMIN, UserRole.USER]), validateRequest(getUserByIdSchema), asyncHandler(getUserById));
router.post('/', authMiddleware, authorizeRoles([UserRole.ADMIN]), validateRequest(createUserSchema), asyncHandler(createUser));
router.put('/:id', authMiddleware, authorizeRoles([UserRole.ADMIN, UserRole.USER]), validateRequest(updateUserSchema), asyncHandler(updateUser));
router.delete('/:id', authMiddleware, authorizeRoles([UserRole.ADMIN, UserRole.USER]), validateRequest(deleteUserSchema), asyncHandler(deleteUser));
router.post('/socket-data', authMiddleware, validateRequest(socketDataSchema), asyncHandler(sendSocketData));

// Public routes remain unprotected
router.post('/signin', validateRequest(signinSchema), asyncHandler(signin));
router.post('/signup', validateRequest(createUserSchema), asyncHandler(signup)); //@TODO add email verification
router.post('/forgot-password', validateRequest(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password', validateRequest(resetPasswordSchema), asyncHandler(resetPassword));
router.get('/verify-email', validateRequest(verifyEmailSchema), asyncHandler(verifyEmail));

export default router;
