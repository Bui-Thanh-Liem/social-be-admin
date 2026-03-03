import { Router } from "express";
import { authenticationMiddleware } from "~/middlewares/authentication.middleware";
import { queryValidate } from "~/middlewares/query-validate.middleware";
import { QueryDtoSchema } from "~/shared/dtos/req/query.dto";
import { asyncHandler } from "~/utils/async-handler.util";
import CommunityController from "./community.controller";

const communityRoute = Router();

communityRoute.use(authenticationMiddleware);

communityRoute.get(
  "/",
  queryValidate(QueryDtoSchema),
  asyncHandler(CommunityController.getCommunities),
);

export default communityRoute;
