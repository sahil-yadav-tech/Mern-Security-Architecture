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

app.post("/api/users", async (req, res, next) => {
  try {
    const { phone } = req.body;

    console.log("Received phone number:", phone);

    const user = await User.findOne({ phone });

    // User not found
    if (!user) {
     return next(new AppError("User does not exist", 404));
    }

    res.json({
      success: true,
      message: "User found",
    });
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
