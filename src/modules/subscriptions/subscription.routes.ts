import { Router } from 'express';
import { getSubscriptions, getSubscriptionById, createSubscription, updateSubscription, cancelSubscription } from './subscription.controller';
import asyncHandler from '../../utils/async-handler';
import validateRequest from '../../middlewares/validate-request';
import { createSubscriptionSchema, updateSubscriptionSchema, getSubscriptionByIdSchema, cancelSubscriptionSchema } from './subscription.validation';
import authMiddleware from '../../middlewares/auth';
import authorizeRoles from '../../middlewares/authorize-roles';
import { UserRole } from '../user/user.constants';

const router = Router();

// All subscription routes require authentication
router.use(authMiddleware);

// Get subscriptions (users get their own, admins get all)
router.get('/', authorizeRoles([UserRole.ADMIN, UserRole.USER]), asyncHandler(getSubscriptions));

// Get specific subscription by ID
router.get('/:id', authorizeRoles([UserRole.ADMIN, UserRole.USER]), validateRequest(getSubscriptionByIdSchema), asyncHandler(getSubscriptionById));

// Create new subscription (users only for themselves)
router.post('/', authorizeRoles([UserRole.USER]), validateRequest(createSubscriptionSchema), asyncHandler(createSubscription));

// Update subscription
router.put('/:id', authorizeRoles([UserRole.ADMIN, UserRole.USER]), validateRequest(updateSubscriptionSchema), asyncHandler(updateSubscription));

// Cancel subscription
router.patch('/:id/cancel', authorizeRoles([UserRole.ADMIN, UserRole.USER]), validateRequest(cancelSubscriptionSchema), asyncHandler(cancelSubscription));

export default router;
