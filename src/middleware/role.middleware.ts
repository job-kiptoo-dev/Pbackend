import { Request, Response, NextFunction } from "express";

/**
 * Middleware to prevent users with accountType 'Creator' from performing certain actions
 * (e.g., creating jobs). Assumes `authenticate` middleware has already attached `req.user`.
 */
export const forbidCreators = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user as any;

  if (!user) {
    res.status(401).json({
      error: "Authentication required",
      message: "You must be logged in",
    });
    return;
  }

  if (user.accountType === "Creator") {
    res.status(403).json({
      error: "Access denied",
      message: "Creators are not allowed to create jobs",
    });
    return;
  }

  next();
};

export default forbidCreators;
