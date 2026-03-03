import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware";
import { queryValidate } from "../../middlewares/query-validate.middleware";
import { QueryDtoSchema } from "../../shared/dtos/req/query.dto";
import { asyncHandler } from "../../utils/async-handler.util";
import mediaController from "./media.controller";

const mediaRoute = Router();

mediaRoute.use(authenticationMiddleware);

mediaRoute.get(
  "/",
  queryValidate(QueryDtoSchema),
  asyncHandler(mediaController.getMedias),
);

export default mediaRoute;
