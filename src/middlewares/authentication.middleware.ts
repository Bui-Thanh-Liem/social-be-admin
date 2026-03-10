import { NextFunction, Request, Response } from "express";
import { envs } from "../configs/env.config";
import { UnauthorizedError } from "../core/error.response";
import { verifyToken } from "../utils/jwt.util";
import adminService from "../modules/admin/admin.service";
import tokenService from "../modules/admin-token/admin-token.service";

export async function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorization = req.headers["authorization"] || "";
    const token = authorization.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Vui lòng đăng nhập.");
    }
    const decoded = await verifyToken({
      token,
      privateKey: envs.JWT_SECRET,
    });

    //
    if (decoded.admin_id) {
      const [admin, token_] = await Promise.all([
        adminService.getAdminActive(decoded.admin_id),
        tokenService.findByToken({ token }),
      ]);

      if (!admin || !token_) {
        throw new UnauthorizedError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        );
      }

      req.admin = admin;
    }

    req.decoded_authorization = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError(error as string));
  }
}
