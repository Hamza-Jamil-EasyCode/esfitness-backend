import { z } from 'zod';
import { SubscriptionStatus, BillingCycle } from './subscription.constants';

const subscriptionStatusEnum = z.nativeEnum(SubscriptionStatus);
const billingCycleEnum = z.nativeEnum(BillingCycle);

const createSubscriptionSchema = z.object({
    body: z.object({
        planId: z.string().min(1, 'Plan ID is required'),
        billingCycle: billingCycleEnum,
        paymentMethodId: z.string().optional(),
        trialDays: z.number().min(0).optional()
    })
});

const updateSubscriptionSchema = z.object({
    body: z.object({
        planId: z.string().optional(),
        status: subscriptionStatusEnum.optional(),
        cancelAtPeriodEnd: z.boolean().optional(),
        metadata: z.record(z.any()).optional()
    })
});

const getSubscriptionByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Subscription ID is required')
    })
});

const cancelSubscriptionSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Subscription ID is required')
    }),
    body: z.object({
        cancelAtPeriodEnd: z.boolean().optional().default(true)
    })
});

export { createSubscriptionSchema, updateSubscriptionSchema, getSubscriptionByIdSchema, cancelSubscriptionSchema };
