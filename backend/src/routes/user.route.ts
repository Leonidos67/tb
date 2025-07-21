import { Router } from "express";
import { getCurrentUserController, onboardingUserController, updateProfilePictureController, setUsernameController, getPublicUserController, getFollowersController, getFollowingController, followUserController, unfollowUserController, getAllUsersController, getUserPostsController, createPostController, deletePostController, likePostController } from "../controllers/user.controller";
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
userRoutes.get("/:username/posts", getUserPostsController);
userRoutes.post("/:username/posts", isAuthenticated, createPostController);
userRoutes.delete("/posts/:postId", isAuthenticated, deletePostController);
userRoutes.post("/posts/:postId/like", isAuthenticated, likePostController);

export default userRoutes;
