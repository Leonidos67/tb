import { Router } from "express";
import { getCurrentUserController, onboardingUserController } from "../controllers/user.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";

const userRoutes = Router();

userRoutes.get("/current", getCurrentUserController);
userRoutes.patch("/onboarding", isAuthenticated, onboardingUserController);

export default userRoutes;
