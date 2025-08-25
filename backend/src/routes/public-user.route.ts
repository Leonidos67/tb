import { Router } from "express";
import { getPublicUserController, getAllUsersController } from "../controllers/user.controller";

const publicUserRoutes = Router();

publicUserRoutes.get("/all", getAllUsersController);
publicUserRoutes.get("/:username", getPublicUserController);

export default publicUserRoutes; 