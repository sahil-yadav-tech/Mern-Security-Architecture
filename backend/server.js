console.log("JAI SHREE RAM JI / JAI BAJARANG BALI JI❤️ 👏");

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import apiLimiter from "./middleware/rateLimit/rateLimiter.js";
import asyncHandler from "./utils/asyncHandler.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import User from "./models/User.js";
import AppError from "./utils/AppError.js";
import sendResponse from "./utils/sendResponse.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

app.use("/api", apiLimiter);

app.post("/api/register", asyncHandler,async (req, res, next) => {

  try {

    const { email, phone } = req.body;

    // Email exists
    // const emailExists = await User.findOne({ email });

    // if (emailExists) {
    //   return next(
    //     new AppError("Email already exists", 400)
    //   );
    // }

    // // Phone exists
    // const phoneExists = await User.findOne({ phone });

    // if (phoneExists) {
    //   return next(
    //     new AppError("Phone already exists", 400)
    //   );
    // }

    // // Create user
    // const user = await User.create({
    //   email,
    //   phone,
    // });

    // Success
    let user = {
      phone,
    }
return sendResponse(
   res,
   200,
   "Login successful",
   user=user
);

  } catch (error) {

    next(error);

  }

});


app.use((req, res, next) => {

  res.status(404).json({
    success: false,
    message: "API Not Found",
  });

});
// app.use(notFound);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
