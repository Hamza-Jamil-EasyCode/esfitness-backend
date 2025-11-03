import axios, { AxiosResponse } from 'axios';
import logger from './logger';

const formatResponse = (success: boolean, message: string, data: any = null) => {
    return { success, message, data };
};

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generatePassword = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!.';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const generateRandomNumber = (length: number) => {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return String(result);
};

const sendRequest = async (url: string, data: any): Promise<AxiosResponse> => {
    const method: string = data.method || 'post';
    const payload: object = data.payload || {};
    const headers: object = data.headers || {};

    const axiosConfig: any = {
        method,
        url,
        headers,
        validateStatus: () => true
    };

    if (method === 'get') {
        axiosConfig.params = payload;
    } else {
        axiosConfig.data = payload;
    }

    try {
        const response: AxiosResponse = await axios(axiosConfig);
        return response;
    } catch (error: any) {
        return error;
    }
};

const sendSocketEvent = (eventName: string, payload: any) => {
    try {
        if (!process.send) {
            throw new Error('Socket event not sent: process.send is not available');
        }

        // Sending IPC message to primary process where socket server is running
        process.send({
            type: 'socket-data',
            data: {
                eventName,
                payload
            }
        });
        return true;
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

export { formatResponse, getRandomInt, generatePassword, generateRandomNumber, sendRequest, sendSocketEvent };
