import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import { generateRequestId, generateRequestToken } from '../utils/helper.js';
import CryptoJS from 'crypto-js';

import dotenv from 'dotenv';


dotenv.config();


const AGENT_CODE = process.env.AGENT_CODE ;
const PIN = process.env.AGENT_PIN ; 
const AFFCODE = 'ERW';
const SOURCE_CODE = 'DDIN';
const sourceIp = "10.8.245.9"
const ccy = "RWF";
const CHANNEL="API"
  const requestId = generateRequestId();

//Validate national ID
export const validateNID = async (req, res) => {
  const { idNumber } = req.body;

  const header = {
    sourceCode: "DDIN",
    affcode: "ERW",
    requestId: "A" + Date.now(),
    agentcode: "32650551883",
    requesttype: "ACCOUNT_OPENING",
    sourceIp: "10.8.245.9",
    channel: "API"
  };

  const tokenString = header.affcode + header.requestId + header.agentcode + header.sourceCode + header.sourceIp;
  const requestToken = crypto.createHash('sha512').update(tokenString).digest('hex');
  header.requestToken = requestToken;

  const payload = {
    header,
    idNumber,
    base64Image: ""
  };

  const config = {
    method: 'post',
    url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/validateidentity',
    headers: {
      'Content-Type': 'application/json'
    },
    data: payload
  };

  try {
    const response = await axios.request(config);
    const responseData = response.data;

   logger.info('NID validation response', { responseData });

    if (responseData?.header?.responsecode === "000") {
      return res.status(200).json({
        success: true,
        message: "NID validated successfully",
        data: responseData
      });
    } else {
      return res.status(400).json({
        success: false,
        message: responseData?.header?.responsemessage,
        code: responseData?.header?.responsecode
      });
    }

  } catch (error) {
    logger.error('NID validation failed', { error: error?.response?.data || error.message });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.response?.data || error.message
    });
  }
};

export const getCustomerDetails = async (req, res) => {
  const { accountno } = req.body;

  logger.info("Initiating customer detail validation", { accountno });

  const header = {
    affcode: "ERW",
    requestId: "A" + Date.now(),
    sourceCode: "DDIN",
    sourceIp: "10.8.245.9",
    channel: "API",
    requesttype: "VALIDATE",
    agentcode: "20209387"
  };

  const tokenString = header.affcode + header.requestId + header.agentcode + header.sourceCode + header.sourceIp;
  const requestToken = crypto.createHash('sha512').update(tokenString).digest('hex');
  header.requestToken = requestToken;

  const payload = {
    accountno,
    header
  };

  const config = {
    method: 'post',
    url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/getcustomerdetails',
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload
  };

  try {
    logger.info("Sending request to Ecobank API", { requestId: header.requestId });

    const response = await axios.request(config);
    const responseData = response.data;

    logger.info("Received response", responseData);

    if (responseData?.header?.responsecode === "000") {
      return res.status(200).json({
        success: true,
        message: "Customer details retrieved successfully",
        data: responseData
      });
    } else {
      logger.error("Validation failed", responseData?.header);
      return res.status(400).json({
        success: false,
        message: responseData?.header?.responsemessage || "Validation failed",
        code: responseData?.header?.responsecode
      });
    }
  } catch (error) {
    logger.error("Request failed", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.response?.data || error.message
    });
  }
};

//Account opening
export const openAccount = async (req, res) => {
  const {
    firstname,
    lastname,
    middlename = null,
    dateOfBirth,
    identityType,
    identityNo,
    idIssueDate,
    idExpiryDate,
    mobileNo,
    email,
    gender,
    address,
    countryCode,
    transactionGuid,
    amount
  } = req.body;

  if (
    !firstname || !lastname || !dateOfBirth || !identityType || !identityNo ||
    !idIssueDate || !idExpiryDate || !mobileNo || !email || !gender || !address ||
    !countryCode || !transactionGuid
  ) {
    logger.warn('Missing required fields in account opening payload', req.body);
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
   const amountFormatted = parseFloat(amount).toFixed(2);
  const destinationAccount = identityNo;
  const requestId = generateRequestId();
  const requestToken = generateRequestToken(AFFCODE,requestId,AGENT_CODE,SOURCE_CODE,sourceIp);
  const tokenString = sourceIp + requestId + AGENT_CODE + ccy + destinationAccount+ amountFormatted + PIN;
  const transactiontoken = CryptoJS.SHA512(tokenString).toString();
  // Destination account is usually mobile number or identity number (adjust as per API docs)
  

  const payload = {
    header: {
      sourceCode: SOURCE_CODE,
      affcode: AFFCODE,
      requestId,
      agentcode: AGENT_CODE,
      requestToken,
      requesttype: REQUEST_TYPE,
      sourceIp: sourceIp,
      channel: CHANNEL,
    },
    firstname,
    lastname,
    middlename,
    dateOfBirth,
    identityType,
    identityNo,
    idIssueDate,
    idExpiryDate,
    mobileNo,
    email,
    gender,
    address,
    countryCode,
    transactionGuid,
    transactiontoken,
  };

  const config = {
    method: 'post',
    url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/accountopening',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    maxBodyLength: Infinity,
  };

  try {
    const response = await axios.request(config);
    const responseData = response.data;

    logger.info('Account opening response', { requestId, responseData });

    if (responseData?.header?.responsecode === '000') {
      return res.status(200).json({
        success: true,
        message: 'Account opened successfully',
        data: responseData,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: responseData?.header?.responsemessage || 'Account opening failed',
        code: responseData?.header?.responsecode,
      });
    }
  } catch (error) {
    logger.error(' Account opening error', {
      requestId,
      error: error?.response?.data || error.message,
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error during account opening',
      error: error?.response?.data || error.message,
    });
  }
};