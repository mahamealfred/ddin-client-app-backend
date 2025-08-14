import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";
//import RefreshToken from "../models/RefreshToken.js";

const generateTokens = async (token,id) => {
  const accessToken = jwt.sign(
    {
      userAuth:token,
      id:id
    },
    process.env.JWT_SECRET,
    { expiresIn: "60m" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expires in 7 days

  await RefreshToken.create({
    token: refreshToken,
    userId: id,
    userAuth:token,
    expiresAt,
  });

  return { accessToken, refreshToken };
};


export default generateTokens