import { Router } from "express";
import { authenticationMiddleware } from "~/middlewares/authentication.middleware";
import { queryValidate } from "~/middlewares/query-validate.middleware";
import { QueryDtoSchema } from "~/shared/dtos/req/query.dto";
import { asyncHandler } from "~/utils/async-handler.util";
import userViolationsController from "./user-violations.controller";

const userViolationsRoute = Router();

userViolationsRoute.use(authenticationMiddleware);

userViolationsRoute.get(
  "/",
  queryValidate(QueryDtoSchema),
  asyncHandler(userViolationsController.getMulti),
);

export default userViolationsRoute;
