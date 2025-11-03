import { AxiosResponse } from 'axios';
import { sendRequest } from './helpers';
import config from '../config/default';
import logger from './logger';
import CustomError from './custom-error';

const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
    if (!config.emailClient.apiKey || !config.emailClient.apiURL || !config.emailClient.senderEmail) {
        throw new CustomError('Missing email client configuration values', 500);
    }

    const emailData = {
        sender: { name: config.emailClient.senderName, email: config.emailClient.senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html
    };

    const apiUrl = config.emailClient.apiURL;
    const headers = {
        'Content-Type': 'application/json',
        'api-key': config.emailClient.apiKey
    };

    try {
        const response: AxiosResponse = await sendRequest(apiUrl, { method: 'post', payload: emailData, headers });
        return response.status === 201;
    } catch (error: any) {
        logger.error(
            JSON.stringify({
                type: 'Error',
                error: error.message,
                stack: error.stack
            })
        );
        return false;
    }
};

export { sendEmail };
