import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  body: object({
    full_name: string({
      required_error: "Full name is required",
    }),
  
    password: string({
      required_error: "Password is required",
    }).min(6, "Password is too short - should be min 6 chars"),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
  }),
});

export const verifyUserSchema = object({
  body: object({
    id: string(),
    activation_code: string(),
  }),
});

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
  }),
});

export const resetPasswordSchema = object({
  params: object({
    id: string(),
    password_reset: string(),
  }),
  body: object({
    password: string({
      required_error: "Password is required",
    }).min(6, "Password is too short - should be min 6 chars"),
    password_confirmation: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];

export type VerifyUserInput = TypeOf<typeof verifyUserSchema>["body"];

export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>["body"];

export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
