import dotenv from 'dotenv';
import CustomError from '../utils/custom-error';

dotenv.config();

if (!process.env.CLIENT_URL || !process.env.JWT_SECRET) {
    throw new CustomError('Missing required environment variables', 500);
}

const config = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    baseRoute: '/api/v1',
    db: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp'
    },
    clientUrl: process.env.CLIENT_URL, //required
    jwtSecret: process.env.JWT_SECRET, //required
    emailClient: {
        apiKey: process.env.BREVO_API_KEY,
        apiURL: process.env.BREVO_API_URL,
        senderName: process.env.BREVO_SENDER_NAME,
        senderEmail: process.env.BREVO_SENDER_EMAIL
    }
};

export default config;
