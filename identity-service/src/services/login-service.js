import axios from "axios";
import logger from "../utils/logger.js";
import generateTokens from "../utils/generateToken.js";


const loginService = async (req, res, username, password) => {
    const token = Buffer.from(`${username}:${password}`).toString('base64');


    try {
        const response = await axios.get('https://test.ddin.rw/coretest/rest/members/me', {
            headers: {
                'Authorization': `Basic ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const { accessToken, refreshToken } = await generateTokens(username, password,token);


        logger.warn("Successfully logged");
        return res.status(200).json({
            success: true,
            accessToken,
            refreshToken

        });
    } catch (error) {
        logger.error("Error while saving in Cyclos:");
        if (error.response.status === 400) {
            return res.status(400).json({
                success: false,
                message: error.response?.data.errorDetails || "Invalid Credentials",
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while processing",
        });
    }

};

export { loginService };