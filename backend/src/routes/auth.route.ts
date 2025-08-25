import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import {
  googleLoginCallback,
  registerUserController,
  loginController,
  logOutController,
  updateUserRoleController,
} from "../controllers/auth.controller";

const router = Router();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure` }),
  googleLoginCallback
);

// Local authentication routes
router.post("/register", registerUserController);
router.post("/login", loginController);
router.post("/logout", logOutController);
router.put("/role", updateUserRoleController);

export default router;
