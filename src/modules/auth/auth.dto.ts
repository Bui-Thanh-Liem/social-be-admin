import { z } from "zod";
import { CONSTANT_REGEX } from "../../shared/constants/regex.constant";
import { ITwoFactorBackup } from "../admin/admin.interface";

export const LoginDtoSchema = z.object({
  password: z.string().trim().min(1, "Vui lòng nhập mật khẩu"),
  email: z.string().email("Email không hợp lệ"),
});

export const ForgotPasswordDtoSchema = z.object({
  email: z.string().email("Email không hợp lệ").trim(),
});

export const ResetPasswordDtoSchema = z
  .object({
    password: z
      .string()
      .regex(CONSTANT_REGEX.STRONG_PASSWORD, {
        message:
          "Ít nhất 8 ký tự, chữ cái viết hoa, chữ cái viết thường, ký tự đặc biệt",
      })
      .trim(),
    confirm_password: z.string().trim(),
    forgot_password_token: z.string().trim(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Mật khẩu không khớp",
  });

export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;

export type ResLogin = {
  admin_id: string;
  two_factor_enabled: boolean;
  two_factor_session_enabled: boolean;
};

export type ResActive2Fa = {
  two_factor_enabled: boolean;
  backup_secret: ITwoFactorBackup[];
};

export type ResVerify2Fa = {
  token: string;
  two_factor_session_enabled: boolean;
};
