import axios from "axios";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";





export const getAccountBalance = async (req, res) => {
    logger.info("Get Account Balance endpoint hit...");
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        const userTokenDeatails = await jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                logger.warn("Invalid token!");
                return res.status(429).json({
                    message: "Invalid token!",
                    success: false,
                });
            }

            return user;

        });
        const userAuth = userTokenDeatails.userAuth
        const response = await axios.get('https://test.ddin.rw/coretest/rest/accounts/default/status', {
            headers: {
                'Authorization': `Basic ${userAuth}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            logger.warn("Successfully get Account Balance");
            return res.status(200).json({
                success: true,
                data: {
                    mainBalance: response.data,
                    creditBalance: 0
                }


            });
        }

    } catch (error) {
        logger.error("get Account Balnce Error error occured", error);

        if (error.response.status === 400) {
            return res.status(400).json({
                success: false,
                message: error.response?.data.errorDetails || "Invalid Credentials",
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAccountsBalance = async (req, res) => {
    logger.info("Get Account Balance endpoint hit...");
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const userTokenDetails = jwt.verify(token, process.env.JWT_SECRET);
        const userAuth = userTokenDetails.userAuth;

        const response = await axios.get(
            'https://test.ddin.rw/coretest/rest/accounts/info',
            {
                headers: {
                    'Authorization': `Basic ${userAuth}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.status === 200) {
            logger.info("Successfully retrieved Account Balance");

            // Transform the API response to a user-friendly format
            const formattedAccounts = response.data.map(accountObj => {
                return {
                    accountId: accountObj.account.id,
                    accountName: accountObj.account.type.name,
                    currency: accountObj.account.type.currency.name,
                    currencySymbol: accountObj.account.type.currency.symbol,
                    balance: accountObj.status.balance,
                    formattedBalance: accountObj.status.formattedBalance,
                    availableBalance: accountObj.status.availableBalance,
                    formattedAvailableBalance: accountObj.status.formattedAvailableBalance,
                    reservedAmount: accountObj.status.reservedAmount,
                    formattedReservedAmount: accountObj.status.formattedReservedAmount
                };
            });

            return res.status(200).json({
                success: true,
                accounts: formattedAccounts,
                creditBalance: 0
            });
        }

    } catch (error) {
        logger.error("get Account Balance Error occurred", error);

        if (error.response?.status === 400) {
            return res.status(400).json({
                success: false,
                message: error.response?.data.errorDetails || "Invalid Credentials",
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};




export const getAccountHistory = async (req, res) => {
    logger.info("Get Account History endpoint hit...");

    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const userTokenDetails = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    logger.warn("Invalid token!");
                    return reject("Invalid token");
                }
                resolve(user);
            });
        });

        const userAuth = userTokenDetails.userAuth;

        const response = await axios.get(
            "https://test.ddin.rw/coretest/rest/accounts/default/history",
            {
                headers: {
                    Authorization: `Basic ${userAuth}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.status === 200) {
            logger.info("Successfully fetched account history");

            const filteredData = response.data.elements.map((item) => {
                const customValues = item.customValues || [];

                const netAmount = customValues.find(
                    (cv) => cv.internalName === "net_amount"
                )?.value;

                const transactionId = customValues.find(
                    (cv) => cv.internalName === "trans_id"
                )?.value;

                return {
                    id: item.id,
                    date: item.date,
                    formattedDate: item.formattedDate,
                    processDate: item.processDate,
                    formattedProcessDate: item.formattedProcessDate,
                    amount: item.amount,
                    formattedAmount: item.formattedAmount,
                    netAmount,
                    status:"successful",
                    transactionId,
                    description: item.description,
                    transferTypeId: item.transferType.id,
                    transferTypeName: (item.transferType.name==="EFASHE Airtime Payment(Client)"?"Airtime":item.transferType.name) || (item.transferType.name==="EFASHE Electricity Payment(Client)"?"Electricity" :item.transferType.name) || item.transferType.name
                };
            });

            return res.status(200).json({
                success: true,
                message: "Account History",
                data: filteredData,
            });
        }
    } catch (error) {
        logger.error("Get Account History error occurred", error);

        if (error?.response?.status === 400) {
            return res.status(400).json({
                success: false,
                message:
                    error.response?.data?.errorDetails ||
                    "Invalid credentials",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
