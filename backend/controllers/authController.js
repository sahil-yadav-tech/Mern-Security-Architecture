import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import redis from "../config/redis.js";
import AppError from "../utils/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import generateAccessToken from "../utils/token/generateAccessToken.js";
import generateRefreshToken from "../utils/token/generateRefreshToken.js";
import setAuthCookies from "../utils/token/setAuthCookies.js";

// @desc    Send OTP for email verification
// @route   POST /api/v1/auth/send-otp
// @access  Public

export const sendOTP = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    throw new AppError("Name, email, phone and password are required", 400);
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new AppError("Email or phone number already registered", 400);
  }

  const OTP_EXPIRY = 120;
  const OTP_LIMIT = 5;
  const RATE_LIMIT_WINDOW = 300;

  const registrationKey = `registration:${email}`;
  const otpCountKey = `otp-count:${email}`;

  // Atomic increment prevents race conditions.
  const requestCount = await redis.incr(otpCountKey);

  // Start rate-limit window on first request.
  if (requestCount === 1) {
    await redis.expire(otpCountKey, RATE_LIMIT_WINDOW);
  }

  // Reject excessive OTP requests.
  if (requestCount > OTP_LIMIT) {
    const ttl = await redis.ttl(otpCountKey);

    throw new AppError(
      `Too many OTP requests. Try again in ${ttl} seconds.`,
      429,
    );
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const hashedPassword = await bcrypt.hash(password, 12);

  // Store registration data temporarily until verification.
  await redis.set(
    registrationKey,
    JSON.stringify({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
    }),
    "EX",
    OTP_EXPIRY,
  );

  // TODO: Send OTP via email provider
  // await sendEmail(email, otp);

  return sendResponse(res, 200, "OTP sent successfully", {
    email,
    otp, // Remove this in production
  });
});

// @desc    Verify email OTP and create account
// @route   POST /api/v1/auth/verify-otp
// @access  Public

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const registrationKey = `registration:${email}`;

  const registrationData = await redis.get(registrationKey);

  if (!registrationData) {
    throw new AppError("OTP has expired or is invalid", 400);
  }

  const userData = JSON.parse(registrationData);
  console.log(userData, "userData");

  if (userData.otp !== otp) {
    throw new AppError("Incorrect OTP", 400);
  }

  const existingUser = await User.findOne({
    $or: [{ email: userData.email }, { phone: userData.phone }],
  });

  if (existingUser) {
    throw new AppError("Email or phone number already registered", 400);
  }

  const user = await User.create({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
  });

  // Cleanup temporary registration data.
  await redis.del(registrationKey);
  await redis.del(`otp-count:${email}`);

  return sendResponse(res, 201, "Account created successfully", {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
});

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const checkEmail = await User.findOne({ email });
    console.log(checkEmail, "checkEmail");

    if (!checkEmail) {
      throw new AppError("Invalid email or password", 401);
    }
    const isMatch = await bcrypt.compare(password, checkEmail.password);

    if (!isMatch) {
      throw new AppError("Invalid Credentials", 401);
    }

    const accessToken = await generateAccessToken(checkEmail._id);
    const refreshToken = await generateRefreshToken(checkEmail._id);
    console.log(accessToken, "accessToken");
    console.log(refreshToken, "refreshToken");

    if (!accessToken && !refreshToken) {
      throw new AppError("Failed to generate tokens", 500);
    }

    setAuthCookies(res, accessToken, refreshToken);

    return sendResponse(res, 200, "Login successful", {
      id: checkEmail._id,
      name: checkEmail.name,
      email: checkEmail.email,
      phone: checkEmail.phone,
    });
  } catch (error) {
    next(error);
  }
};
