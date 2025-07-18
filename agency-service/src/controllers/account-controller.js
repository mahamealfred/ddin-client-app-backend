import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import { generateRequestToken } from '../utils/helper.js';

export const getEcoBankAccountBalance = async (req, res) => {


  logger.info(`Get Account Balance endpoint `);


  // These values could come dynamically or from environment vars
  const affcode = "ERW";
  const agentcode = "32650551883";
  const sourceCode = "DDIN";
  const requestId = "A" + Date.now(); // or use uuid
  const pin = "123456"; // you can make this secure
  const ccy = "RWF";
  const destinationAccount = "000000000000"; // if not used, use default
  const amount = "0";
  const sourceIp = "10.8.245.9"

  // Generate requestToken = SHA512 ( AffiliateCode + Request ID + Agent Code + Source Code + IP )
  const requestToken = crypto
    .createHash('sha512')
    .update(affcode + requestId + agentcode + sourceCode + sourceIp)
    .digest('hex');

  //  Generate transactionToken = SHA512 ( IP + Request ID + Agent Code + ccy + destAcc + amount + PIN )
  const transactionToken = crypto
    .createHash('sha512')
    .update(sourceIp + requestId + agentcode + ccy + destinationAccount + amount + pin)
    .digest('hex');

  const data = {
    header: {
      affcode,
      requestId,
      requestToken,
      sourceCode,
      sourceIp,
      channel: "API",
      requesttype: "VALIDATE",
      agentcode
    },
    transactiontoken: transactionToken
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/getbalance',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  };

  try {
    const response = await axios.request(config);
    logger.info("Account balance response received", response.data);

    if (response.data?.header?.responsecode === "000") {
      return res.status(200).json({
        success: true,
        message: "Account balance retrieved successfully",
        data: response.data
      });
    }

    logger.warn("Failed to retrieve balance", response.data?.header?.responsemessage);
    return res.status(400).json({
      success: false,
      message: response.data?.header?.responsemessage
    });

  } catch (e) {
    logger.error("Get Account Balance error occurred", e?.response?.data || e.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e?.response?.data || e.message
    });
  }
};


//Validate national ID

export const validateNID = async (req, res) => {
  const { idNumber } = req.body;

  const header = {
    sourceCode: "DDIN",
    affcode: "EGN",
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

//Openning Ecobank Account 
export const openEcoBankAccount = async (req, res) => {
  logger.info(`EcoBank Account Opening endpoint called.`);

  const {
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
    countryCode
  } = req.body;

  const affcode = "EGH";
  const agentcode = "32650551883";
  const sourceCode = "DDIN";
  const requestId = "A" + Date.now();
  const sourceIp = "10.8.245.9";
  const pin = "123456"; // should be stored securely
  const ccy = "RWF";
  const destinationAccount = "000000000000";
  const amount = "0";

  // Generate tokens
  const requestToken = crypto
    .createHash('sha512')
    .update(affcode + requestId + agentcode + sourceCode + sourceIp)
    .digest('hex');

  const transactionToken = crypto
    .createHash('sha512')
    .update(sourceIp + requestId + agentcode + ccy + destinationAccount + amount + pin)
    .digest('hex');

  const transactionGuid = crypto.randomUUID();

  const data = {
    header: {
      sourceCode,
      affcode,
      requestId,
      agentcode,
      requestToken,
      requesttype: "ACCOUNT_OPENING",
      sourceIp,
      channel: "API"
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
    transactiontoken: transactionToken
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://mule.ecobank.com/agencybanking/services/thirdpartyagencybanking/createaccount',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  };

  try {
    const response = await axios.request(config);
    logger.info("Account opening response received", response.data);

    if (response.data?.header?.responsecode === "000") {
      return res.status(200).json({
        success: true,
        message: "Account opened successfully",
        data: response.data
      });
    }

    logger.warn("Account opening failed", response.data?.header?.responsemessage);
    return res.status(400).json({
      success: false,
      message: response.data?.header?.responsemessage,
      data: response.data
    });

  } catch (e) {
    logger.error("Account opening error", e?.response?.data || e.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e?.response?.data || e.message
    });
  }
};