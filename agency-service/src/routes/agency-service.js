import express from "express";
import { getCustomerDetails, getEcoBankAccountBalance, validateNID } from "../controllers/account-controller.js";




const router = express.Router();


router.get("/eco/services/getbalance",getEcoBankAccountBalance);
router.post("/eco/services/validateidentity",validateNID);
router.post("/eco/services/getcustomerdetails",getCustomerDetails);

export default router