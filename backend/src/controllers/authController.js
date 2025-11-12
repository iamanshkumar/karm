import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Helper function to generate JWT + set cookie correctly
const sendAuthCookie = (user, res, message) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // ✅ HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ✅ Safari-safe cross-origin cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // ✅ Needed for Safari to register cookie across routes
  });

  return res.json({
    success: true,
    message,
    token, // still included for fallback (localStorage if needed)
  });
};

// ✅ SIGNUP
export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    return sendAuthCookie(user, res, "User created successfully");
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Details missing" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    return sendAuthCookie(user, res, "Logged in successfully");
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ AUTH CHECK (used by frontend)
export const isAuthenticated = async (req, res) => {
  try {
    const token =
      req.cookies.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token)
      return res.json({ success: false, message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.json({ success: false, message: "Invalid token" });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: "Not authorised. Login again." });
  }
};
