import express from "express";
import {
  accountActivation,
  loginUserHandler,
  refreshAccessToken,
  refreshAccessTokenHandler,
  signupUserHandler,
} from "../controller/auth.controller";
import validateResource from "../middleware/validateResource";
import { createSessionSchema } from "../schema/auth.schema";
import { createUserSchema, verifyUserSchema } from "../schema/user.schema";

const router = express.Router();

router.post("/signup", validateResource(createUserSchema), signupUserHandler);

router.post("/login", validateResource(createSessionSchema), loginUserHandler);

router.post(
  "/activation",
  validateResource(verifyUserSchema),
  accountActivation
);

router.post("/api/sessions/refresh", refreshAccessTokenHandler);

router.post("/refresh/token", refreshAccessToken);

export default router;
