import express from "express";
import { clientMomoTopUp } from "../controllers/account-controller.js";



const router = express.Router();


router.post("/client-topup", clientMomoTopUp);

export default router