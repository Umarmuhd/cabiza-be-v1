import express from "express";
import // forgotPasswordHandler,
// getCurrentUserHandler,
// resetPasswordHandler,
// signupUserHandler,
// verifyUserHandler,
"../controller/user.controller";
import {
  findUserByUsername,
  onBoardingHandler,
} from "../controller/user.controller";
import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResource";
import {
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyUserSchema,
} from "../schema/user.schema";

const router = express.Router();

// router.post(
//   "/api/users/verify/:id/:verificationCode",
//   validateResource(verifyUserSchema),
//   verifyUserHandler
// );

router.post("/onboarding", requireUser, onBoardingHandler);

router.get("/username/:username", findUserByUsername);

// router.post(
//   "/api/users/forgotpassword",
//   validateResource(forgotPasswordSchema),
//   forgotPasswordHandler
// );

// router.post(
//   "/api/users/resetpassword/:id/:passwordResetCode",
//   validateResource(resetPasswordSchema),
//   resetPasswordHandler
// );

// router.get("/api/users/me", requireUser, getCurrentUserHandler);

export default router;
