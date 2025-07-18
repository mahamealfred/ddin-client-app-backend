import express from "express";
import { momoClientPull, validatedVendor } from "../controllers/client-controller.js";




const router = express.Router();


router.post("/payment/execute/vendor",momoClientPull);
router.post("/validation/validate/vendor",validatedVendor);

export default router