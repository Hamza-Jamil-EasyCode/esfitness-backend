// Success messages for subscription module
export const SUCCESS_MESSAGES = {
    SUBSCRIPTIONS_RETRIEVED: 'Subscriptions retrieved successfully',
    SUBSCRIPTION_RETRIEVED: 'Subscription retrieved successfully',
    SUBSCRIPTION_CREATED: 'Subscription created successfully',
    SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
    SUBSCRIPTION_CANCELED: 'Subscription canceled successfully',
    SUBSCRIPTION_REACTIVATED: 'Subscription reactivated successfully'
};

// Error messages for subscription module
export const ERROR_MESSAGES = {
    SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
    SUBSCRIPTION_ID_NOT_FOUND: (id: string) => `Subscription with id ${id} not found`,
    SUBSCRIPTION_ALREADY_EXISTS: 'User already has an active subscription',
    SUBSCRIPTION_NOT_AUTHORIZED_UPDATE: 'You are not authorized to update this subscription',
    SUBSCRIPTION_NOT_AUTHORIZED_CANCEL: 'You are not authorized to cancel this subscription',
    SUBSCRIPTION_NOT_AUTHORIZED_VIEW: 'You are not authorized to view this subscription',
    STRIPE_SUBSCRIPTION_ERROR: 'Error creating Stripe subscription',
    STRIPE_CANCEL_ERROR: 'Error canceling Stripe subscription',
    PLAN_NOT_FOUND: 'Plan not found for subscription',
    USER_NOT_FOUND: 'User not found for subscription'
};
