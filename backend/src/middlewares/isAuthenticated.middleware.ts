import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../utils/appError";
import { config } from "../config/app.config";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException("Access token is required");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!config.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    if (!decoded || !decoded.userId) {
      throw new UnauthorizedException("Invalid token");
    }

    req.user = { _id: decoded.userId };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedException("Invalid token"));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedException("Token expired"));
    }
    next(error);
  }
};

export default isAuthenticated;
