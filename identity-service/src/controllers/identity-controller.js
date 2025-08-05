import axios from "axios";
import logger from "../utils/logger.js";
import generateTokens from "../utils/generateToken.js";
import { validatelogin, validateRegistration } from "../utils/validation.js";
import { registerService } from "../services/register-service.js";
import { loginService } from "../services/login-service.js";


//user registration
const resgiterUser = async (req, res) => {
    logger.info("Registration endpoint hit...");
    try {
        //validate the schema
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const { email, password, username, firstName, lastName, identity, phoneNumber } = req.body;

        await registerService(req, res, email, password, username, firstName, lastName, identity, phoneNumber)


    } catch (e) {
        logger.error("Registration error occured", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//Client login
const loginUser = async (req, res) => {
    logger.info("Login endpoint hit...");
    try {
        const { error } = validatelogin(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const { username, password } = req.body;
        await loginService(req, res, username, password)

    } catch (e) {
        logger.error("Login error occured", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};



//Agent login
const agentLogin = async (req, res) => {
    logger.info("Agent Login endpoint hit...");
    try {
        const { error } = validatelogin(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const { username, password } = req.body;
        await loginService(req, res, username, password)

    } catch (e) {
        logger.error("Agent Login error occured", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
//Search User
const findUser = async (req, res) => {
    logger.info("FindUser endpoint hit...");
 const username = "topupuser";
        const password = "Topup@123"
        const topupUserAuth = Buffer.from(`${username}:${password}`).toString('base64');
    try {
        const userName = req.params.user

        const response = await axios.get(`https://test.ddin.rw/coretest/rest/members/principal/${userName}`, {
            headers: {
                Authorization: `Basic ${topupUserAuth}`,
                'Content-Type': 'application/json',
            },
        });

        logger.warn("Successfully logged");
        return res.status(200).json({
            success: true,
            message:"User details",
            data: response.data

        });
    } catch (error) {

        logger.error("Error while saving in Cyclos:");
        if (error.response.status === 400) {
            return res.status(400).json({
                success: false,
                message: error.response?.data.errorDetails || "Invalid Credentials",
            });
        }
        if (error.response.status === 401) {
            return res.status(400).json({
                success: false,
                message: error.response?.data.errorDetails || "Invalid Credentials",
            });
        }
        if (error.response.status === 404) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while processing",
        });
    }
};

//refresh token
const refreshTokenUser = async (req, res) => {
    logger.info("Refresh token endpoint hit...");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("Refresh token missing");
            return res.status(400).json({
                success: false,
                message: "Refresh token missing",
            });
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        if (!storedToken) {
            logger.warn("Invalid refresh token provided");
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        if (!storedToken || storedToken.expiresAt < new Date()) {
            logger.warn("Invalid or expired refresh token");

            return res.status(401).json({
                success: false,
                message: `Invalid or expired refresh token`,
            });
        }

        const user = await User.findById(storedToken.user);

        if (!user) {
            logger.warn("User not found");

            return res.status(401).json({
                success: false,
                message: `User not found`,
            });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await generateTokens(user);

        //delete the old refresh token
        await RefreshToken.deleteOne({ _id: storedToken._id });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (e) {
        logger.error("Refresh token error occured", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//logout

const logoutUser = async (req, res) => {
    logger.info("Logout endpoint hit...");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("Refresh token missing");
            return res.status(400).json({
                success: false,
                message: "Refresh token missing",
            });
        }

        const storedToken = await RefreshToken.findOneAndDelete({
            token: refreshToken,
        });
        if (!storedToken) {
            logger.warn("Invalid refresh token provided");
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token",
            });
        }
        logger.info("Refresh token deleted for logout");

        res.json({
            success: true,
            message: "Logged out successfully!",
        });
    } catch (e) {
        logger.error("Error while logging out", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export { resgiterUser, loginUser, refreshTokenUser, logoutUser, findUser }