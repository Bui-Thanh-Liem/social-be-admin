import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware";
import { queryValidate } from "../../middlewares/query-validate.middleware";
import { QueryDtoSchema } from "../../shared/dtos/req/query.dto";
import { asyncHandler } from "../../utils/async-handler.util";
import TweetController from "./tweet.controller";

const tweetRoute = Router();

tweetRoute.use(authenticationMiddleware);

tweetRoute.get(
  "/",
  queryValidate(QueryDtoSchema),
  asyncHandler(TweetController.getTweets),
);

export default tweetRoute;
