import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService, updateUserRoleService, createOrUpdateGoogleUser } from "../services/auth.service";
import passport from "passport";
import jwt from "jsonwebtoken";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Create or update user from Google profile
      const { user, workspaceId } = await createOrUpdateGoogleUser(req.user as any);
      
      // Generate JWT token for Google OAuth
      if (!config.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
      }

      const token = jwt.sign(
        { userId: (user as any)._id.toString() },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.redirect(
        `${config.FRONTEND_ORIGIN}/workspace/${workspaceId}?token=${token}`
      );
    } catch (error) {
      console.error("Google OAuth error:", error);
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    const { userId, workspaceId } = await registerUserService(body);

    // Generate JWT token
    if (!config.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { userId: userId.toString() },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Пользователь успешно создан",
      token,
      userId,
      workspaceId,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Неверный адрес электронной почты или пароль",
          });
        }

        // Generate JWT token
        if (!config.JWT_SECRET) {
          return next(new Error("JWT_SECRET is not configured"));
        }

        const token = jwt.sign(
          { userId: user._id.toString() },
          config.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.status(HTTPSTATUS.OK).json({
          message: "Успешно вошел в систему",
          user,
          token,
        });
      }
    )(req, res, next);
  }
);

export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    // With JWT, logout is handled client-side by removing the token
    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Успешно вышел из системы" });
  }
);

export const updateUserRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userRole } = req.body;
    
    if (!req.user?._id) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Пользователь не авторизован",
      });
    }

    const updatedUser = await updateUserRoleService(req.user._id.toString(), userRole);

    return res.status(HTTPSTATUS.OK).json({
      message: "Роль пользователя успешно обновлена",
      user: updatedUser,
    });
  }
);
