import { z } from 'zod';
import { PlanType, PlanStatus, PlanDuration } from './plan.constants';

const planTypeEnum = z.nativeEnum(PlanType);
const planStatusEnum = z.nativeEnum(PlanStatus);
const planDurationEnum = z.nativeEnum(PlanDuration);

const createPlanSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Plan name is required'),
        type: planTypeEnum,
        description: z.string().min(1, 'Plan description is required'),
        price: z.number().min(0, 'Price must be a positive number'),
        currency: z.string().default('USD'),
        duration: planDurationEnum,
        features: z.array(z.string()).optional().default([]),
        status: planStatusEnum.optional().default(PlanStatus.ACTIVE),
        stripeProductId: z.string().optional(),
        stripePriceId: z.string().optional()
    })
});

const updatePlanSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        type: planTypeEnum.optional(),
        description: z.string().optional(),
        price: z.number().min(0, 'Price must be a positive number').optional(),
        currency: z.string().optional(),
        duration: planDurationEnum.optional(),
        features: z.array(z.string()).optional(),
        status: planStatusEnum.optional(),
        stripeProductId: z.string().optional(),
        stripePriceId: z.string().optional()
    })
});

const getPlanByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Plan ID is required')
    })
});

const deletePlanSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Plan ID is required')
    })
});

export { createPlanSchema, updatePlanSchema, getPlanByIdSchema, deletePlanSchema };
