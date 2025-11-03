import { Router } from 'express';
import { getPayments, getPaymentById, handleWebhook } from './payment.controller';
import asyncHandler from '../../utils/async-handler';
import validateRequest from '../../middlewares/validate-request';
import { getPaymentByIdSchema, webhookSchema } from './payment.validation';
import authMiddleware from '../../middlewares/auth';
import authorizeRoles from '../../middlewares/authorize-roles';
import { UserRole } from '../user/user.constants';

const router = Router();

// Webhook route (must be before auth middleware as Stripe webhooks don't use auth)
router.post('/webhook', validateRequest(webhookSchema), asyncHandler(handleWebhook));

// Protected routes require authentication
router.use(authMiddleware);

// Get payments (users get their own, admins get all)
router.get('/', authorizeRoles([UserRole.ADMIN, UserRole.USER]), asyncHandler(getPayments));

// Get specific payment by ID
router.get('/:id', authorizeRoles([UserRole.ADMIN, UserRole.USER]), validateRequest(getPaymentByIdSchema), asyncHandler(getPaymentById));

export default router;
