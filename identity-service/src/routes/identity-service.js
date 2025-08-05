import express from "express";

import { resgiterUser, loginUser, refreshTokenUser, logoutUser, findUser } from "../controllers/identity-controller.js";


const router = express.Router();

router.post("/register", resgiterUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenUser);
router.post("/logout", logoutUser);
router.get("/find/:user", findUser);

export default router