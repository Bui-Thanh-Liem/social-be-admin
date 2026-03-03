import { Router } from "express";
import {
  loginRateLimit,
  setupF2aRateLimit,
  verifyF2aRateLimit,
} from "../../middlewares/rate-limit.middleware";
import { asyncHandler } from "../../utils/async-handler.util";
import { bodyValidate } from "../../middlewares/body-validate.middleware";
import { LoginDtoSchema } from "./auth.dto";
import AuthController from "./auth.controller";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware";

const authRoute = Router();

/**
 * ĐĂNG NHẬP
 * Nếu chưa thiết lập 2FA sẽ yêu cầu setup, nếu đã thiết lập nhưng chưa active sẽ yêu cầu active, nếu đã thiết lập và active sẽ yêu cầu verify 2FA
 */
authRoute.post(
  "/login",
  asyncHandler(loginRateLimit),
  bodyValidate(LoginDtoSchema),
  asyncHandler(AuthController.login),
);

/**
 * KÍCH HOẠT 2FA
 * API tạo Secret Key và trả về mã QR
 */
authRoute
  .route("/2fa/setup/:admin_id")
  .post(
    asyncHandler(setupF2aRateLimit),
    asyncHandler(AuthController.setupTwoFactorAuth),
  );

/**
 * XÁC THỰC LẦN ĐẦU (Kích hoạt chính thức)
 * ADmin quét QR xong phải nhập thử mã để xác nhận thiết lập thành công
 */
authRoute
  .route("/2fa/active/:admin_id")
  .post(
    asyncHandler(verifyF2aRateLimit),
    asyncHandler(AuthController.activeTwoFactorAuth),
  );

/**
 * KIỂM TRA ĐĂNG NHẬP
 * Sử dụng mỗi khi người dùng đăng nhập sau này
 */
authRoute
  .route("/2fa/verify/:admin_id")
  .post(
    asyncHandler(verifyF2aRateLimit),
    asyncHandler(AuthController.verifyTwoFactorAuth),
  );

//
authRoute.use(authenticationMiddleware);

/**
 * ĐĂNG XUẤT
 * Xóa token khỏi database để kết thúc phiên làm việc
 * Xóa cache liên quan đến token đó để đảm bảo token không còn hiệu lực nữa
 */
authRoute.post("/logout", asyncHandler(AuthController.logout));

/**
 * LẤY THÔNG TIN CỦA CHÍNH MÌNH
 */
authRoute.route("/me").get(asyncHandler(AuthController.getMe));

export default authRoute;
