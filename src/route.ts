import { Request, Response, Router } from "express";
import { envs } from "./configs/env.config";
import { OkResponse } from "./core/success.response";
import adminRoute from "./modules/admin/admin.route";
import authRoute from "./modules/auth/auth.route";
import communityRoute from "./modules/community/community.route";
import mediaRoute from "./modules/media/media.route";
import tweetRoute from "./modules/tweet/tweet.route";
import userViolationsRoute from "./modules/user-violations/user-violations.route";
import userRoute from "./modules/user/user.route";

const rootRoute = Router();

// Mount các route con
rootRoute.use("/auth", authRoute);
rootRoute.use("/admin", adminRoute);
rootRoute.use("/user", userRoute);
rootRoute.use("/tweet", tweetRoute);
rootRoute.use("/community", communityRoute);
rootRoute.use("/media", mediaRoute);  
rootRoute.use("/user-violation", userViolationsRoute);  

// Health check
rootRoute.get("/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json(new OkResponse(`✅ - ${envs.CLIENT_DOMAIN} is healthy!`));
});

export default rootRoute;
