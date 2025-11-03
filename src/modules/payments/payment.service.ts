import Stripe from 'stripe';
import { Types } from 'mongoose';
import { Payment, PaymentModel } from './models';
import { PaymentStatus, PaymentType } from './payment.constants';
import { UserModel } from '../user/models';
import CustomError from '../../utils/custom-error';

// Get all payments
const getAllPayments = async (): Promise<Payment[]> => {
    return await PaymentModel.find({ isDeleted: false }).populate('userId', 'name email').populate('subscriptionId').sort({ createdAt: -1 }).select('-__v');
};

// Get payments by user ID
const getPaymentsByUserId = async (userId: string): Promise<Payment[]> => {
    return await PaymentModel.find({ userId, isDeleted: false }).populate('subscriptionId').sort({ createdAt: -1 }).select('-__v');
};

// Get a payment by ID
const getPaymentById = async (id: string): Promise<Payment | null> => {
    return await PaymentModel.findOne({ _id: id, isDeleted: false }).populate('userId', 'name email').populate('subscriptionId');
};

// Get payment by Stripe Payment Intent ID
const getPaymentByStripeId = async (stripePaymentIntentId: string): Promise<Payment | null> => {
    return await PaymentModel.findOne({ stripePaymentIntentId, isDeleted: false }).populate('userId', 'name email').populate('subscriptionId');
};

// Create a new payment record
const createPayment = async (paymentData: Partial<Payment>): Promise<Payment> => {
    const payment = new PaymentModel(paymentData);
    return await payment.save();
};

// Update a payment
const updatePayment = async (id: string, updatedData: Partial<Payment>): Promise<Payment | null> => {
    return await PaymentModel.findOneAndUpdate({ _id: id, isDeleted: false }, updatedData, { new: true }).populate('userId', 'name email').populate('subscriptionId');
};

// Handle successful payment webhook
const handlePaymentSucceeded = async (paymentIntent: Stripe.PaymentIntent): Promise<Payment | null> => {
    try {
        // Check if payment already exists
        let payment = await getPaymentByStripeId(paymentIntent.id);

        if (!payment) {
            // Extract user ID from metadata
            const userId = paymentIntent.metadata?.userId;
            if (!userId) {
                throw new CustomError('User ID not found in payment metadata', 400);
            }

            // Verify user exists
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new CustomError('User not found', 404);
            }
            // Create new payment record
            payment = await createPayment({
                userId: new Types.ObjectId(userId),
                stripePaymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100, // Convert from cents
                currency: paymentIntent.currency.toUpperCase(),
                status: PaymentStatus.SUCCEEDED,
                paymentType: paymentIntent.metadata?.subscriptionId ? PaymentType.SUBSCRIPTION : PaymentType.ONE_TIME,
                description: paymentIntent.description || 'Payment',
                subscriptionId: paymentIntent.metadata?.subscriptionId || undefined,
                metadata: paymentIntent.metadata,
                processedAt: new Date()
            });
        } else {
            // Update existing payment
            payment = await updatePayment(payment._id as string, {
                status: PaymentStatus.SUCCEEDED,
                processedAt: new Date(),
                metadata: paymentIntent.metadata
            });
        }

        return payment;
    } catch (error) {
        console.error('Error handling payment succeeded:', error);
        throw error;
    }
};

// Handle failed payment webhook
const handlePaymentFailed = async (paymentIntent: Stripe.PaymentIntent): Promise<Payment | null> => {
    try {
        // Check if payment already exists
        let payment = await getPaymentByStripeId(paymentIntent.id);

        if (!payment) {
            // Extract user ID from metadata
            const userId = paymentIntent.metadata?.userId;
            if (!userId) {
                throw new CustomError('User ID not found in payment metadata', 400);
            }

            // Verify user exists
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new CustomError('User not found', 404);
            }
            // Create new payment record for failed payment
            payment = await createPayment({
                userId: new Types.ObjectId(userId),
                stripePaymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100, // Convert from cents
                currency: paymentIntent.currency.toUpperCase(),
                status: PaymentStatus.FAILED,
                paymentType: paymentIntent.metadata?.subscriptionId ? PaymentType.SUBSCRIPTION : PaymentType.ONE_TIME,
                description: paymentIntent.description || 'Failed Payment',
                subscriptionId: paymentIntent.metadata?.subscriptionId || undefined,
                metadata: paymentIntent.metadata,
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
                processedAt: new Date()
            });
        } else {
            // Update existing payment
            payment = await updatePayment(payment._id as string, {
                status: PaymentStatus.FAILED,
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
                processedAt: new Date(),
                metadata: paymentIntent.metadata
            });
        }

        return payment;
    } catch (error) {
        console.error('Error handling payment failed:', error);
        throw error;
    }
};

export { getAllPayments, getPaymentsByUserId, getPaymentById, getPaymentByStripeId, createPayment, updatePayment, handlePaymentSucceeded, handlePaymentFailed };
