
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken"
import { clientMomoTopUpService } from "../service/clientMomoTopUpService.js";


//user topup
const clientMomoTopUp = async (req, res) => {
    logger.info("Client Momo TopUp endpoint hit...");
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

        const { amount, currencySymbol } = req.body;
        const tokenId = userTokenDeatails.tokenId
        await clientMomoTopUpService(req, res, amount, currencySymbol, tokenId)

    } catch (e) {
        logger.error("Client Momo TopUp error occured", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};



export { clientMomoTopUp }