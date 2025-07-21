import { Router } from "express";
import { getPublicUserController } from "../controllers/user.controller";

const publicUserRoutes = Router();

publicUserRoutes.get("/:username", getPublicUserController);

export default publicUserRoutes; 