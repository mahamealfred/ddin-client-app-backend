import express from "express";
import { getAccoutnBalance, getAccountHistory } from "../controllers/account-controller.js";


const router = express.Router();

router.get("/main/balance", getAccoutnBalance);
router.get("/main/account/history", getAccountHistory);

export default router