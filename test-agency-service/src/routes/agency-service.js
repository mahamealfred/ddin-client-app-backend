import express from "express";
import { getCustomerDetails, getEcoBankAccountBalance, validateIdentity } from "../controllers/account-controller.js";
import { executeBillerPayment, getBillerDetails, getBillers, getBillPaymentFee, postBillPayment, validateBiller, ValidateBillerFdi} from "../controllers/payment-controller.js";
import { executeEcoCashIn, executeEcoCashOut, openAccount } from "../controllers/banking-controller.js";




const router = express.Router();

//Account Routes
router.get("/thirdpartyagency/services/getbalance",getEcoBankAccountBalance);
router.post("/thirdpartyagency/services/validateidentity",validateIdentity);

router.post("/thirdpartyagency/services/account-openning",openAccount);
//Bill pyement routes
//router.post("/eco/services/validate/biller",ValidateBillerFdi);
router.post("/thirdpartyagency/services/biller-details",getBillerDetails);
router.get("/thirdpartyagency/services/agent-billers",getBillers);
router.post("/thirdpartyagency/services/bill-payment-fee",getBillPaymentFee);
//router.post("/eco/services/execute-bill-payment",postBillPayment);

                     //Test
//BILL payment                    
router.post("/thirdpartyagency/services/validate/biller",ValidateBillerFdi);
router.post("/thirdpartyagency/services/execute/bill-payment",executeBillerPayment);

//cashin-eco
router.post("/thirdpartyagency/services/getcustomerdetails",getCustomerDetails);
router.post("/thirdpartyagency/services/execute/cash-in",executeEcoCashIn);
router.post("/thirdpartyagency/services/execute/cash-out",executeEcoCashOut);


export default router