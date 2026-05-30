import jwt from "jsonwebtoken";
import AppError from "../AppError.js";

if (!process.env.JWT_REFRESH_SECRET) {
  throw new AppError(
    "JWT_REFRESH_SECRET is not defined",
    500
  );
}
const generateRefreshToken = (userId) => {
  if (!userId) {
    throw new AppError(
      "User ID is required to generate refresh token",
      400
    );
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export default generateRefreshToken;