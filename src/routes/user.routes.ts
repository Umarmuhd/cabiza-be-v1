import express from "express";
import // forgotPasswordHandler,
// getCurrentUserHandler,
// resetPasswordHandler,
// signupUserHandler,
// verifyUserHandler,
"../controller/user.controller";
import {
  addBankAccountHandler,
  addPaypalHandler,
  connectStripeHandler,
  findUserByUsername,
  getUserBalanceHandler,
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
import fileUpload from "../utils/file-upload";

const router = express.Router();

router.get("/balance/me", requireUser, getUserBalanceHandler);

router.post(
  "/onboarding",
  [requireUser, fileUpload.single("photo")],
  onBoardingHandler
);

router.get("/username/:username", findUserByUsername);

router.get("/connect/stripe", requireUser, connectStripeHandler);

router.post("/connect/paypal", requireUser, addPaypalHandler);

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
