import { Router } from 'express';
import { getPlans, getPlanById, createPlan, updatePlan, deletePlan, seedPlans } from './plan.controller';
import asyncHandler from '../../utils/async-handler';
import validateRequest from '../../middlewares/validate-request';
import { createPlanSchema, updatePlanSchema, getPlanByIdSchema, deletePlanSchema } from './plan.validation';
import authMiddleware from '../../middlewares/auth';
import authorizeRoles from '../../middlewares/authorize-roles';
import { UserRole } from '../user/user.constants';

const router = Router();

// Public routes (anyone can view plans)
router.get('/', asyncHandler(getPlans));
router.get('/:id', validateRequest(getPlanByIdSchema), asyncHandler(getPlanById));

// Protected routes (admin only for CRUD operations)
router.post('/', authMiddleware, authorizeRoles([UserRole.ADMIN]), validateRequest(createPlanSchema), asyncHandler(createPlan));
router.put('/:id', authMiddleware, authorizeRoles([UserRole.ADMIN]), validateRequest(updatePlanSchema), asyncHandler(updatePlan));
router.delete('/:id', authMiddleware, authorizeRoles([UserRole.ADMIN]), validateRequest(deletePlanSchema), asyncHandler(deletePlan));

// Seeder route (admin only)
router.post('/seed/default', authMiddleware, authorizeRoles([UserRole.ADMIN]), asyncHandler(seedPlans));

export default router;
