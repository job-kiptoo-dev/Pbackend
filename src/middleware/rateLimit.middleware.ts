import rateLimit from "express-rate-limit";

/**
 * Rate limiter for login attempts
 * 5 attempts per 15 minutes
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    error: "Too many login attempts",
    message: "Please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req, res) => {
    // Skip rate limiting for certain IPs (optional)
    return false;
  },
});

/**
 * Rate limiter for registration attempts
 * 3 attempts per hour
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: {
    error: "Too many registration attempts",
    message: "Please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password reset requests
 * 3 attempts per hour
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: {
    error: "Too many password reset attempts",
    message: "Please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for email resend attempts
 * 5 attempts per hour
 */
export const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts
  message: {
    error: "Too many verification email requests",
    message: "Please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for Google OAuth
 * 10 attempts per hour
 */
export const googleAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts
  message: {
    error: "Too many OAuth attempts",
    message: "Please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter (if needed)
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  standardHeaders: true,
  legacyHeaders: false,
});
