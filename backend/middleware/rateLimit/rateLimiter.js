import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis"
import redis from "../../config/redis.js";

const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis  .call(...args),
  }),

  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests",
  },
});

export default apiLimiter;

