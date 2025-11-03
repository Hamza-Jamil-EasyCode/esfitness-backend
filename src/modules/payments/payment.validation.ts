import { z } from 'zod';

const getPaymentByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Payment ID is required')
    })
});

const webhookSchema = z.object({
    body: z.any(), // Stripe webhook payload - will be validated by Stripe
    headers: z.object({
        'stripe-signature': z.string().min(1, 'Stripe signature is required')
    })
});

const createPaymentSchema = z.object({
    body: z.object({
        amount: z.number().min(1, 'Amount must be greater than 0'),
        currency: z.string().default('USD'),
        paymentMethodId: z.string().min(1, 'Payment method is required'),
        description: z.string().optional(),
        subscriptionId: z.string().optional(),
        metadata: z.record(z.unknown()).optional()
    })
});

export { getPaymentByIdSchema, webhookSchema, createPaymentSchema };
