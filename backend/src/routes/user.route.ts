import { Router } from "express";
import { getCurrentUserController, onboardingUserController, updateProfilePictureController, setUsernameController, getPublicUserController, getFollowersController, getFollowingController, followUserController, unfollowUserController, getAllUsersController } from "../controllers/user.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";

const userRoutes = Router();

userRoutes.get("/current", getCurrentUserController);
userRoutes.patch("/onboarding", isAuthenticated, onboardingUserController);
userRoutes.patch("/profile-picture", isAuthenticated, updateProfilePictureController);
userRoutes.patch("/set-username", isAuthenticated, setUsernameController);
userRoutes.get("/all", getAllUsersController);
userRoutes.get("/:username/followers", getFollowersController);
userRoutes.get("/:username/following", getFollowingController);
userRoutes.post("/:username/follow", isAuthenticated, followUserController);
userRoutes.post("/:username/unfollow", isAuthenticated, unfollowUserController);

export default userRoutes;
