import jwt from "jsonwebtoken";
import {User} from "../Models/UserModel.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // console.log("Cookies received:", req.cookies);

    const accessToken = req.cookies?.accessToken ||  req.header("Authorization")?.replace("Bearer ", "");

    // If no access token, check for refresh token
    if (!accessToken) {
      return tryRefreshToken(req, res, next);
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    
    if (!user) throw new Error("User not found");
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return tryRefreshToken(req, res, next);
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const tryRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Please login again" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({ 
      _id: decoded._id,
      refreshToken // Verify token exists in DB
    });

    if (!user) throw new Error("Invalid refresh token");

    // Issue new access token
    const newAccessToken = user.generateAccessToken();
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired. Please login." });
  }
};