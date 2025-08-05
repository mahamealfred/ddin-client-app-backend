import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';
import { generateRequestId } from '../utils/helper.js';

dotenv.config();


const AGENT_CODE = process.env.AGENT_CODE;
const PIN = process.env.AGENT_PIN;
const AFFCODE = 'ERW';
const SOURCE_CODE = 'DDIN';



export const postBillPayment = async (req, res) => {
    const {
        email,
        customerNumber,
        billerCode,
        productCode,
        amount,
        ccy,
        subagent,
    } = req.body;

    if (!email || !customerNumber || !billerCode || !productCode || !amount) {
        logger.warn('Missing required fields for bill payment', req.body);
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: email, customerNumber, billerCode, productCode, amount',
        });
    }

    const sourceIp = '192.168.0.237';
    const requestId = generateRequestId(); // Must be 16-char alphanumeric
    const amountFormatted = parseFloat(amount).toFixed(2);

    const requestTokenString = `${AFFCODE}${requestId}${AGENT_CODE}${SOURCE_CODE}${sourceIp}`;
    const requestToken = crypto.createHash('sha512').update(requestTokenString).digest('hex');;
    const tokenString = sourceIp + requestId + AGENT_CODE + ccy + billerCode + amountFormatted + PIN;
    const transactionToken = CryptoJS.SHA512(tokenString).toString();

    const header = {
        affcode: AFFCODE,
        requestId,
        agentcode: AGENT_CODE,
        requesttype: 'VALIDATE',
        sourceIp,
        sourceCode: SOURCE_CODE,
        channel: 'API',
        requestToken,
    };

    const payload = {
        formData: [
            { fieldName: 'EMAIL', fieldValue: email },
            { fieldName: 'Customer No/Smart Card No', fieldValue: customerNumber },
        ],
        billerCode,
        productCode,
        amount: amountFormatted,
        ccy,
        subagent,
        transactiontoken: transactionToken,
        header,
    };

    const config = {
        method: 'post',
        url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/postbillpayment',
        headers: { 'Content-Type': 'application/json' },
        data: payload,
    };

    try {
        const response = await axios.request(config);
        const responseData = response.data;

        logger.info('Bill payment response:', responseData);

        if (responseData?.header?.responsecode === '000') {
            return res.status(200).json({
                success: true,
                message: 'Bill payment successful',
                data: responseData,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: responseData?.header?.responsemessage || 'Unknown error',
                code: responseData?.header?.responsecode,
            });
        }
    } catch (error) {
        logger.error('Bill payment failed', {
            error: error?.response?.data || error.message,
        });

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error?.response?.data || error.message,
        });
    }
};




// Validate Bill Payment
export const validateBillPayment = async (req, res) => {
    const { billerCode, productCode, customerId, amount } = req.body;

    if (!billerCode || !productCode || !customerId) {
        logger.warn('Missing required fields', { billerCode, productCode, customerId });
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: billerCode, productCode, or customerId',
        });
    }

    const header = {
        sourceCode: 'DDIN',
        affcode: 'ERW',
        requestId: 'A' + Date.now(),
        agentcode: AGENT_CODE,
        requesttype: 'VALIDATE',
        sourceIp: '10.8.245.9',
        channel: 'API',
    };

    const tokenString =
        header.affcode +
        header.requestId +
        header.agentcode +
        header.sourceCode +
        header.sourceIp;

    const requestToken = crypto.createHash('sha512').update(tokenString).digest('hex');
    header.requestToken = requestToken;

    const payload = {
        formData: [
            {
                fieldName: 'EMAIL',
                fieldValue: '', // Can be made dynamic if needed
            },
            {
                fieldName: 'CUSTOMERID',
                fieldValue: customerId,
            },
            {
                fieldName: 'LAST4DIGITS',
                fieldValue: '9909', // Also can be dynamic if needed
            },
        ],
        billerCode,
        productCode,
        amount: amount, // Make dynamic if needed
        header,
    };

    const config = {
        method: 'post',
        url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/validatebillpayment',
        headers: {
            'Content-Type': 'application/json',
        },
        data: payload,
    };

    try {
        const response = await axios.request(config);
        const responseData = response.data;

        logger.info('Bill payment validation response', { responseData });

        if (responseData?.header?.responsecode === '000') {
            return res.status(200).json({
                success: true,
                message: 'Bill payment validated successfully',
                data: responseData,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: responseData?.header?.responsemessage,
                code: responseData?.header?.responsecode,
            });
        }
    } catch (error) {
        logger.error('Bill payment validation failed', {
            error: error?.response?.data || error.message,
        });
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error?.response?.data || error.message,
        });
    }
};



// Get Biller Details
export const getBillerDetails = async (req, res) => {
    const { billerCode } = req.body;

    if (!billerCode) {
        logger.warn('Missing billerCode in request body');
        return res.status(400).json({
            success: false,
            message: 'Missing required field: billerCode',
        });
    }

    const header = {
        sourceCode: 'DDIN',
        affcode: 'ERW',
        requestId: 'A' + Date.now(),
        agentcode: AGENT_CODE,
        requesttype: 'VALIDATE',
        sourceIp: '10.8.245.9',
        channel: 'API',
    };

    const tokenString =
        header.affcode +
        header.requestId +
        header.agentcode +
        header.sourceCode +
        header.sourceIp;

    const requestToken = crypto.createHash('sha512').update(tokenString).digest('hex');
    header.requestToken = requestToken;

    const payload = {
        billercode: billerCode,
        header,
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/getbillerdetails',
        headers: {
            'Content-Type': 'application/json',
        },
        data: payload,
    };

    try {
        const response = await axios.request(config);
        const responseData = response.data;

        logger.info('Biller details fetched successfully', { responseData });

        if (responseData?.header?.responsecode === '000') {
            return res.status(200).json({
                success: true,
                message: 'Biller details retrieved successfully',
                data: responseData,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: responseData?.header?.responsemessage,
                code: responseData?.header?.responsecode,
            });
        }
    } catch (error) {
        logger.error('Failed to fetch biller details', {
            error: error?.response?.data || error.message,
        });

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error?.response?.data || error.message,
        });
    }
};

// Get List of Agent Billers
export const getBillers = async (req, res) => {
    const header = {
        sourceCode: 'DDIN',
        affcode: 'ERW',
        requestId: 'A' + Date.now(),
        agentcode: AGENT_CODE,
        requesttype: 'VALIDATE',
        sourceIp: '10.8.245.9',
        channel: 'API',
    };

    const tokenString =
        header.affcode +
        header.requestId +
        header.agentcode +
        header.sourceCode +
        header.sourceIp;

    const requestToken = crypto.createHash('sha512').update(tokenString).digest('hex');
    header.requestToken = requestToken;

    const payload = { header };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/agentbillers',
        headers: {
            'Content-Type': 'application/json',
        },
        data: payload,
    };

    try {
        const response = await axios.request(config);
        const responseData = response.data;

        logger.info('Fetched agent billers', { responseData });

        if (responseData?.header?.responsecode === '000') {
            return res.status(200).json({
                success: true,
                message: 'Billers fetched successfully',
                data: responseData,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: responseData?.header?.responsemessage,
                code: responseData?.header?.responsecode,
            });
        }
    } catch (error) {
        logger.error('Failed to fetch agent billers', {
            error: error?.response?.data || error.message,
        });

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error?.response?.data || error.message,
        });
    }
};


// Get Bill Payment Fee
export const getBillPaymentFee = async (req, res) => {
    const { billerCode, amount } = req.body;

    if (!billerCode || !amount) {
        logger.warn('Missing billerCode or amount in request body', { billerCode, amount });
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: billerCode or amount',
        });
    }

    const header = {
        sourceCode: 'DDIN',
        affcode: 'ERW',
        requestId: 'A' + Date.now(),
        agentcode: AGENT_CODE,
        requesttype: 'VALIDATE',
        sourceIp: '10.8.245.9',
        channel: 'API',
    };

    const tokenString =
        header.affcode +
        header.requestId +
        header.agentcode +
        header.sourceCode +
        header.sourceIp;

    const requestToken = crypto.createHash('sha512').update(tokenString).digest('hex');
    header.requestToken = requestToken;

    const payload = {
        billercode: billerCode,
        amount,
        header,
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/getbillpaymentfee',
        headers: {
            'Content-Type': 'application/json',
        },
        data: payload,
    };

    try {
        const response = await axios.request(config);
        const responseData = response.data;

        logger.info('Fetched bill payment fee', { responseData });

        if (responseData?.header?.responsecode === '000') {
            return res.status(200).json({
                success: true,
                message: 'Payment fee retrieved successfully',
                data: responseData,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: responseData?.header?.responsemessage,
                code: responseData?.header?.responsecode,
            });
        }
    } catch (error) {
        logger.error('Failed to fetch bill payment fee', {
            error: error?.response?.data || error.message,
        });

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error?.response?.data || error.message,
        });
    }
};

