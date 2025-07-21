import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService } from "../services/user.service";
import UserModel from "../models/user.model";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  }
);

export const onboardingUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ message: "Answer is required" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isNewUser = false;
    user.onboardingAnswer = answer;
    await user.save();
    return res.status(200).json({ message: "Onboarding complete" });
  }
);
