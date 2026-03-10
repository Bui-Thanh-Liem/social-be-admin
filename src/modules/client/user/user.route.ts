import { Router } from "express";
import { authenticationMiddleware } from "../../../middlewares/authentication.middleware";
import { queryValidate } from "../../../middlewares/query-validate.middleware";
import { QueryDtoSchema } from "../../../shared/dtos/req/query.dto";
import { asyncHandler } from "../../../utils/async-handler.util";
import UserController from "./user.controller";

const userRoute = Router();

userRoute.use(authenticationMiddleware);

//
userRoute.get(
  "/",
  queryValidate(QueryDtoSchema),
  asyncHandler(UserController.getUser),
);

export default userRoute;
