
import { executeAirtimeyVendor } from "../controllers/client-controller.js";
import logger from "../utils/logger.js";
import axios from "axios";


//Topup User float account from Cyclos Momo User
const clientMomoTopup = async (req,res,userId,topupUserAuth,userAuth,amount,currencySymbol,serviceType,trxId, phoneNumber) => {
    try {
    const response = await axios.post(
      "https://test.ddin.rw/coretest/rest/payments/confirmMemberPayment",
      {
        toMemberId: userId,
        amount: amount,
        transferTypeId: "114",
        currencySymbol: currencySymbol,
        description: "Mobile Money Top Up"
      },
      {
        headers: {
          Authorization: `Basic ${topupUserAuth}`,
          "Content-Type": "application/json"
        }
      }
    );

    logger.warn("Successfully TopUp Client Account");
    // return res.status(200).json({
    //   success: true,
    //   data: response.data
    // });
    if(serviceType==="airtime"){
        await executeAirtimeyVendor(req,res,topupUserAuth,userAuth,amount,currencySymbol,serviceType,trxId, phoneNumber)
    }
     return res.status(400).json({
      success: false,
      message:"Failed to execute Airtime Vendor"
    });
  } catch (error) {
    console.log("error:", error);
    logger.error("Error while saving in Cyclos:");

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.response?.data?.errorDetails || "Invalid Credentials"
      });
    }

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while processing"
    });
  }
};



export { clientMomoTopup }