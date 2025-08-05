import express from "express";
import { getCustomerDetails, getEcoBankAccountBalance, validateIdentity } from "../controllers/account-controller.js";
import { executeBillerPayment, getBillerDetails, getBillers, getBillPaymentFee, postBillPayment, validateBiller, ValidateBillerFdi} from "../controllers/payment-controller.js";
import { executeEcoCashIn, executeEcoCashOut, openAccount } from "../controllers/banking-controller.js";




const router = express.Router();

//Account Routes
router.get("/eco/services/getbalance",getEcoBankAccountBalance);
router.post("/eco/services/validateidentity",validateIdentity);

router.post("/eco/services/account-openning",openAccount);
//Bill pyement routes
//router.post("/eco/services/validate/biller",ValidateBillerFdi);
router.post("/eco/services/biller-details",getBillerDetails);
router.get("/eco/services/agent-billers",getBillers);
router.post("/eco/services/bill-payment-fee",getBillPaymentFee);
//router.post("/eco/services/execute-bill-payment",postBillPayment);

                     //Test
//BILL payment                    
router.post("/eco/services/validate/biller",ValidateBillerFdi);
router.post("/eco/services/execute/bill-payment",executeBillerPayment);

//cashin-eco
router.post("/eco/services/getcustomerdetails",getCustomerDetails);
router.post("/eco/services/execute/cash-in",executeEcoCashIn);
router.post("/eco/services/execute/cash-out",executeEcoCashOut);


export default router