import express from "express";
import {getAccountHistory, getAccountBalance, getAccountsBalance } from "../controllers/account-controller.js";


const router = express.Router();

router.get("/main/balance", getAccountBalance);
router.get("/all/accounts/info/balance", getAccountsBalance);
router.get("/main/account/history", getAccountHistory);

export default router