// Success messages for payment module
export const SUCCESS_MESSAGES = {
    PAYMENTS_RETRIEVED: 'Payments retrieved successfully',
    PAYMENT_RETRIEVED: 'Payment retrieved successfully',
    PAYMENT_CREATED: 'Payment created successfully',
    PAYMENT_UPDATED: 'Payment updated successfully',
    PAYMENT_PROCESSED: 'Payment processed successfully',
    WEBHOOK_PROCESSED: 'Webhook processed successfully'
};

// Error messages for payment module
export const ERROR_MESSAGES = {
    PAYMENT_NOT_FOUND: 'Payment not found',
    PAYMENT_ID_NOT_FOUND: (id: string) => `Payment with id ${id} not found`,
    PAYMENT_NOT_AUTHORIZED_VIEW: 'You are not authorized to view this payment',
    PAYMENT_PROCESSING_ERROR: 'Error processing payment',
    STRIPE_PAYMENT_NOT_FOUND: 'Stripe payment not found',
    WEBHOOK_SIGNATURE_INVALID: 'Invalid webhook signature',
    WEBHOOK_PROCESSING_ERROR: 'Error processing webhook',
    USER_NOT_FOUND_FOR_PAYMENT: 'User not found for payment'
};
