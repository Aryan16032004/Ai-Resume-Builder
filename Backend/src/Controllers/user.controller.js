import { User } from "../Models/UserModel.js";


export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: createdUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed"
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

    res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: loggedInUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed"
    });
  }
};

export const logoutUser = async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } }
  );

  // Clear both cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json({ success: true });
};

export const getCurrentUser = async (req, res) => {
  try {
    // console.log(req.user);
    
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve current user"
    });
  }
};



