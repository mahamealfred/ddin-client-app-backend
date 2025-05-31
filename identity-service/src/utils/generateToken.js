import jwt from "jsonwebtoken";
import crypto from "crypto";
//import RefreshToken from "../models/RefreshToken.js";

const generateTokens = async (username,email,token) => {
  const accessToken = jwt.sign(
    {
      email: email,
      username: username,
      tokenId:token
    },
    process.env.JWT_SECRET,
    { expiresIn: "60m" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expires in 7 days

//   await RefreshToken.create({
//     token: refreshToken,
//     user: user._id,
//     expiresAt,
//   });

  return { accessToken, refreshToken };
};

export default generateTokens