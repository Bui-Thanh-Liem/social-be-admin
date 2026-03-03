import { Request, Response, Router } from "express";
import { OkResponse } from "./core/success.response";
import { envs } from "./configs/env.config";
import authRoute from "./modules/auth/auth.route";
import adminRoute from "./modules/admin/admin.route";

const rootRoute = Router();

// Mount các route con
rootRoute.use("/auth", authRoute);
rootRoute.use("/admin", adminRoute);

// Health check
rootRoute.get("/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json(new OkResponse(`✅ - ${envs.CLIENT_DOMAIN} is healthy!`));
});

export default rootRoute;
