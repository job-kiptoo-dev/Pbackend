import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err: any) => ({
        field: err.param || err.path,
        message: err.msg,
      })),
    });
    return;
  }
  next();
};

/**
 * Validation rules for registration
 */
export const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("lastname")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  body("birthday")
    .optional()
    .isISO8601()
    .withMessage("Birthday must be a valid date"),
  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  body("city")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("City must be at least 2 characters"),
];

/**
 * Validation rules for login
 */
export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/**
 * Validation rules for email verification resend
 */
export const validateResendVerification = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address"),
];

/**
 * Validation rules for forgot password
 */
export const validateForgotPassword = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address"),
];

/**
 * Validation rules for reset password
 */
export const validateResetPassword = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

/**
 * Validation rules for change password (authenticated)
 */
export const validateChangePassword = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
];

/**
 * Validation rules for Google login
 */
export const validateGoogleLogin = [
  body("idToken")
    .notEmpty()
    .withMessage("Google ID token is required"),
];
