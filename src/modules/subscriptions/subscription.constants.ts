// Subscription status enum for the subscription module
export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    CANCELED = 'CANCELED',
    PAST_DUE = 'PAST_DUE',
    UNPAID = 'UNPAID',
    INCOMPLETE = 'INCOMPLETE',
    INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
    TRIALING = 'TRIALING'
}

// Subscription billing cycle enum
export enum BillingCycle {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'
}
