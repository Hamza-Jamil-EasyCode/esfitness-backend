// Payment status enum for the payment module
export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED',
    CANCELED = 'CANCELED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

// Payment method enum
export enum PaymentMethod {
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    DIGITAL_WALLET = 'DIGITAL_WALLET'
}

// Payment type enum
export enum PaymentType {
    SUBSCRIPTION = 'SUBSCRIPTION',
    ONE_TIME = 'ONE_TIME',
    REFUND = 'REFUND'
}
