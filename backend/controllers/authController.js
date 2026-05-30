import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import redis from "../config/redis.js";
import AppError from "../utils/AppError.js";
import sendResponse from "../utils/sendResponse.js";

export const sendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new AppError("Phone number is required", 400);
  }

  const OTP_EXPIRY = 30; // 5 minutes
  const OTP_LIMIT = 5;
  const RATE_LIMIT_WINDOW = 60; // 15 minutes

  const otpKey = `otp:${phone}`;
  const otpCountKey = `otp-count:${phone}`;

  // Atomic increment
  const requestCount = await redis.incr(otpCountKey);

  // Set TTL only on first request
  if (requestCount === 1) {
    await redis.expire(otpCountKey, RATE_LIMIT_WINDOW);
  }

  // Check limit
  if (requestCount > OTP_LIMIT) {
    const ttl = await redis.ttl(otpCountKey);

    throw new AppError(
      `Too many OTP requests. Try again in ${ttl} seconds.`,
      429
    );
  }

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Store OTP
  await redis.set(
    otpKey,
    JSON.stringify({ phone, otp }),
    "EX",
    OTP_EXPIRY
  );

  // Send SMS Provider here
  // await sendSMS(phone, otp);

 return sendResponse(
   res,
   200,
   "OTP sent successfully",
   { phone, otp }
);
});

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      res.status(409);
      throw new Error("Email or phone already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};
