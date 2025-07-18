import { callPollEndpoint } from "../utils/checkEfasheTransactionStatus.js";
import { generateAccessToken } from "../utils/generator.js";
import axios from "axios";

export const airtimePaymentService = async (req, res, response, amount, trxId, phoneNumber) => {
  const accessToken = await generateAccessToken();

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "A Token is required for authentication",
    });
  }

  const data = JSON.stringify({
    trxId: trxId,
    customerAccountNumber: phoneNumber,
    amount: amount,
    verticalId: "airtime",
    deliveryMethodId: "direct_topup",
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://sb-api.efashe.com/rw/v2/vend/execute",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.replace(/['"]+/g, "")}`,
    },
    data: data,
  };

  try {
    const resp = await axios.request(config);

    if (resp.status === 202) {
      // Begin polling
      while (true) {
        try {
          const responseData = await callPollEndpoint(resp, trxId);
          const thirdpart_status = responseData?.data?.data?.trxStatusId;

          if (thirdpart_status === "successful") {
            return res.status(200).json({
              success: true,
              message: "Airtime payment completed successfully",
              data: {
                transactionId: response.data.id,
                tranasactionRef:trxId,
                phoneNumber:phoneNumber,
                amount: amount,
                status:"successful"
              },
            });
          } else if (thirdpart_status !== "pending") {
            return res.status(400).json({
              success: false,
              message: "Dear client, We're unable to complete your transaction right now. Please try again later",
            });
          }

          await delay(3000); // Wait 3 seconds before next poll
        } catch (pollErr) {
          return res.status(500).json({
            success: false,
            message: "Error polling transaction status. Please try again later.",
          });
        }
      }
    } else {
      return res.status(resp.status).json({
        success: false,
        message: "Unexpected response from Efashe. Please try again.",
      });
    }
  } catch (error) {

    if (error.response) {
      const msg = error.response?.data?.msg || "Transaction failed";
      return res.status(error.response.status || 500).json({
        success: false,
        message: msg,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Dear client, we're unable to complete your transaction right now. Please try again later.",
    });
  }
};

// Helper function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
