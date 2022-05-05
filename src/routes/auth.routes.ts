import express from "express";
import {
  accountActivation,
  forgetPasswordHandler,
  loginUserHandler,
  refreshAccessToken,
  refreshAccessTokenHandler,
  resetPasswordHandler,
  signupUserHandler,
  updatePasswordHandler,
} from "../controller/auth.controller";
import requireUser from "../middleware/requireUser";
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

router.post("/forget-password", forgetPasswordHandler);

router.post("/reset-password", resetPasswordHandler);

router.post("/api/sessions/refresh", refreshAccessTokenHandler);

router.post("/refresh/token", refreshAccessToken);

router.post("/password/update", requireUser, updatePasswordHandler);

export default router;
