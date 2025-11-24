import { Request, Response } from "express";
import { User } from "../db/entity/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import emailService from "../services/email.service";
import { generateVerificationToken } from "../utils/token.utils";
import { google } from "googleapis";

export class AuthController {
  /**
   * Register a new user
   */
  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, firstname, lastname, birthday, gender, phone, city } = req.body;
      
      // Map frontend field names to backend field names
      const firstName = firstname;
      const lastName = lastname;

      // Check if user already exists
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({
          error: "Registration failed",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.firstName = firstName;
      user.lastName = lastName;
      
      // Add new fields
      if (birthday) user.birthday = new Date(birthday);
      if (gender) user.gender = gender;
      if (phone) user.phone = phone;
      if (city) user.city = city;

      user.isVerified = true;  // auto verify
      user.verificationToken = generateVerificationToken();
      // Set verification token expiry to 24 hours
      user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await user.save();
      
      // Send verification email
      // try {
      //   await emailService.sendVerificationEmail(
      //     user.email,
      //     user.verificationToken,
      //     user.firstName
      //   );
      // } catch (emailError) {
      //   console.error("Error sending verification email:", emailError);
      //   // Continue with registration even if email fails
      // }
// DO NOT send email
// await emailService.sendVerificationEmail(...);  ❌ remove

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1d" }
      );

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday,
          gender: user.gender,
          phone: user.phone,
          city: user.city,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({
        error: "Registration failed",
        message: "Internal server error during registration",
      });
    }
  }

  /**
   * Login existing user
   */
  /**
   * Verify user email with verification token
   */
  // public async verifyEmail(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { token } = req.params;

  //     // Find user with the token
  //     const user = await User.findOne({ where: { verificationToken: token } });
  //     if (!user) {
  //       return res.status(400).json({
  //         error: "Verification failed",
  //         message: "Invalid or expired verification token",
  //       });
  //     }

  //     // Check if token has expired
  //     if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
  //       return res.status(400).json({
  //         error: "Verification failed",
  //         message: "Verification token has expired. Please request a new one.",
  //       });
  //     }

  //     // Update user verification status
  //     user.isVerified = true;
  //     user.verificationToken = undefined; // Clear the token after verification
  //     user.verificationTokenExpiry = null; // Clear the expiry
  //     await user.save();

  //     return res.status(200).json({
  //       message: "Email verification successful",
  //       user: {
  //         id: user.id,
  //         email: user.email,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         birthday: user.birthday,
  //         gender: user.gender,
  //         phone: user.phone,
  //         city: user.city,
  //         isVerified: user.isVerified,
  //         createdAt: user.createdAt,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Email verification error:", error);
  //     return res.status(500).json({
  //       error: "Verification failed",
  //       message: "Internal server error during verification",
  //     });
  //   }
  // }

  public async verifyEmail(req: Request, res: Response): Promise<Response> {
  return res.status(200).json({
    message: "Email verification is currently disabled."
  });
}


  /**
   * Send a new verification email
   */
  // public async resendVerification(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { email } = req.body;

  //     // Find user by email
  //     const user = await User.findOne({ where: { email } });
  //     if (!user) {
  //       return res.status(400).json({
  //         error: "Verification failed",
  //         message: "User not found",
  //       });
  //     }

  //     // Check if already verified
  //     if (user.isVerified) {
  //       return res.status(400).json({
  //         error: "Verification failed",
  //         message: "Email is already verified",
  //       });
  //     }

  //     // Generate new token
  //     user.verificationToken = generateVerificationToken();
  //     // Set expiry to 24 hours
  //     user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  //     await user.save();

  //     // Send verification email
  //     await emailService.sendVerificationEmail(
  //       user.email,
  //       user.verificationToken,
  //       user.firstName
  //     );

  //     return res.status(200).json({
  //       message: "Verification email sent successfully",
  //     });
  //   } catch (error) {
  //     console.error("Resend verification error:", error);
  //     return res.status(500).json({
  //       error: "Verification failed",
  //       message: "Internal server error while sending verification email",
  //     });
  //   }
  // }

  public async resendVerification(req: Request, res: Response): Promise<Response> {
  return res.status(200).json({
    message: "Verification system is temporarily disabled.",
  });
}


  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid email or password",
        });
      }
      
      // // Check if email is verified
      // if (!user.isVerified) {
      //   return res.status(401).json({
      //     error: "Authentication failed",
      //     message: "Email not verified. Please verify your email before logging in.",
      //     needsVerification: true,
      //   });
      // }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday,
          gender: user.gender,
          phone: user.phone,
          city: user.city,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        error: "Authentication failed",
        message: "Internal server error during login",
      });
    }
  }

  /**
   * Handle forgot password request
   */
  public async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Return success even if user not found for security reasons
        return res.status(200).json({
          message: "If your email is registered, you will receive password reset instructions."
        });
      }

      // Generate reset token
      const resetToken = generateVerificationToken();
      
      // Set token expiry (1 hour from now)
      const resetExpiry = new Date();
      resetExpiry.setHours(resetExpiry.getHours() + 1);
      
      // Save token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = resetExpiry;
      await user.save();

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(
          user.email,
          resetToken,
          user.firstName
        );
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
        return res.status(500).json({
          error: "Password reset failed",
          message: "Error sending password reset email"
        });
      }

      return res.status(200).json({
        message: "If your email is registered, you will receive password reset instructions."
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        error: "Password reset failed",
        message: "Internal server error during password reset request"
      });
    }
  }

  /**
   * Reset password with token
   */
  public async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find user with the token and check expiry
      const user = await User.findOne({ 
        where: { 
          resetPasswordToken: token,
        }
      });

      if (!user) {
        return res.status(400).json({
          error: "Password reset failed",
          message: "Invalid or expired reset token"
        });
      }

      // Check if token is expired
      if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
        return res.status(400).json({
          error: "Password reset failed",
          message: "Reset token has expired"
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user password and clear reset token
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpiry = null;
      await user.save();

      return res.status(200).json({
        message: "Password has been reset successfully"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        error: "Password reset failed",
        message: "Internal server error during password reset"
      });
    }
  }

  /**
   * Change password for authenticated user
   */
  public async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          error: "Authentication required",
          message: "You must be logged in to change your password",
        });
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Password change failed",
          message: "Current password is incorrect",
        });
      }

      // Check if new password is the same as old password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          error: "Password change failed",
          message: "New password must be different from current password",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({
        error: "Password change failed",
        message: "Internal server error during password change",
      });
    }
  }

  public async getGoogleAuthUrl(req: Request, res: Response): Promise<Response> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "profile", "email"],
      });
      return res.json({ url });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Internal server error" })
    }
  }

  /**
   * Login with Google OAuth
   */
  public async loginWithGoogle(req: Request, res: Response): Promise<Response> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          error: "Authentication failed",
          message: "Google ID token is required"
        });
      }

      // Create OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Verify the token
      const ticket = await oauth2Client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        return res.status(400).json({
          error: "Authentication failed",
          message: "Invalid Google token"
        });
      }

      const { email, given_name, family_name, picture } = payload;

      // Check if user exists
      let user = await User.findOne({ where: { email } });

      if (!user) {
        // Create new user from Google data
        user = new User();
        user.email = email;
        user.firstName = given_name || "User";
        user.lastName = family_name || "";
        user.password = await bcrypt.hash(Math.random().toString(36), 10); // Random password for OAuth users
        user.isVerified = true; // Google users are pre-verified
        user.verificationToken = undefined;

        await user.save();
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday,
          gender: user.gender,
          phone: user.phone,
          city: user.city,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Google login error:", error);
      return res.status(500).json({
        error: "Authentication failed",
        message: "Internal server error during Google login"
      });
    }
  }

  /**
   * Update user account type (Individual, Business, Creator, etc.)
   */
  public async updateAccountType(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as any;
      const { accountType } = req.body;

      if (!user) {
        return res.status(401).json({
          error: "Authentication required",
          message: "You must be logged in to update your account type",
        });
      }

      // Validate account type
      const validAccountTypes = ["Individual", "Business", "Creator", "None"];
      if (!accountType || !validAccountTypes.includes(accountType)) {
        return res.status(400).json({
          error: "Invalid account type",
          message: `Account type must be one of: ${validAccountTypes.join(", ")}`,
        });
      }

      // Update user account type
      const userRecord = await User.findOne({ where: { id: user.id } });
      if (!userRecord) {
        return res.status(404).json({
          error: "User not found",
          message: "User record not found",
        });
      }

      userRecord.accountType = accountType;
      await userRecord.save();

      return res.status(200).json({
        message: "Account type updated successfully",
        user: {
          id: userRecord.id,
          email: userRecord.email,
          firstName: userRecord.firstName,
          lastName: userRecord.lastName,
          accountType: userRecord.accountType,
          isVerified: userRecord.isVerified,
          createdAt: userRecord.createdAt,
        },
      });
    } catch (error) {
      console.error("Update account type error:", error);
      return res.status(500).json({
        error: "Account type update failed",
        message: "Internal server error while updating account type",
      });
    }
  }
 
}