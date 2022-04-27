import express from "express";
import // forgotPasswordHandler,
// getCurrentUserHandler,
// resetPasswordHandler,
// signupUserHandler,
// verifyUserHandler,
"../controller/user.controller";
import {
  // addBankAccountHandler,
  connectStripeHandler,
  findUserByUsername,
  getUserBalanceHandler,
  onBoardingHandler,
  updateUserAvatar,
  updateUserProfileHandler,
} from "../controller/user.controller";
import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResource";
import {
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyUserSchema,
} from "../schema/user.schema";
import fileUpload from "../utils/file-upload";

const router = express.Router();

router.get("/balance/me", requireUser, getUserBalanceHandler);

router.post(
  "/onboarding",
  [requireUser, fileUpload.single("photo")],
  onBoardingHandler
);

router.put(
  "/avatar",
  [requireUser, fileUpload.array("image", 1)],
  updateUserAvatar
);

router.get("/username/:username", findUserByUsername);

router.get("/connect/stripe", requireUser, connectStripeHandler);

router.post("/profile", requireUser, updateUserProfileHandler);

// router.post("/connect/bank", requireUser, addBankAccountHandler);

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
