// const rateLimit = require("express-rate-limit");
// const RedisStore = require("rate-limit-redis").default;

// const redisClient = require("../config/redis");

// const apiLimiter = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.call(...args),
//   }),

//   windowMs: 15 * 60 * 1000,

//   max: 100,

//   standardHeaders: true,

//   legacyHeaders: false,

//   message: {
//     success: false,
//     message: "Too many requests",
//   },
// });

// module.exports = apiLimiter;