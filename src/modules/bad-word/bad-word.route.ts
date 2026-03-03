import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware";
import { queryValidate } from "../../middlewares/query-validate.middleware";
import { QueryDtoSchema } from "../../shared/dtos/req/query.dto";
import { asyncHandler } from "../../utils/async-handler.util";
import BadWordsController from "./bad-word.controller";
import { bodyValidate } from "../../middlewares/body-validate.middleware";
import {
  ActionBadWordDtoSchema,
  paramIdBadWordsDtoSchema,
} from "./bad-word.dto";
import { paramsValidate } from "../../middlewares/params-validate.middleware";

const badWordRoute = Router();

badWordRoute.use(authenticationMiddleware);

badWordRoute
  .route("/")
  .get(queryValidate(QueryDtoSchema), asyncHandler(BadWordsController.getMulti))
  .post(
    bodyValidate(ActionBadWordDtoSchema),
    asyncHandler(BadWordsController.create),
  );

badWordRoute.get(
  "/most-used",
  queryValidate(QueryDtoSchema),
  asyncHandler(BadWordsController.getMultiMostUsed),
);

badWordRoute.patch(
  "/:bad_word_id",
  paramsValidate(paramIdBadWordsDtoSchema),
  bodyValidate(ActionBadWordDtoSchema),
  asyncHandler(BadWordsController.update),
);

badWordRoute.delete(
  "/:bad_word_id",
  paramsValidate(paramIdBadWordsDtoSchema),
  asyncHandler(BadWordsController.delete),
);

export default badWordRoute;
