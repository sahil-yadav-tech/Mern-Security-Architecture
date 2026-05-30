import jwt from "jsonwebtoken";
import AppError from "../AppError.js";

if (!process.env.JWT_SECRET) {
  throw new AppError(
    "JWT_SECRET is not defined",
    500
  );
}

const generateAccessToken = (userId) => {
  if (!userId) {
    throw new AppError(
      "User ID is required",
      400
    );
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

export default generateAccessToken;