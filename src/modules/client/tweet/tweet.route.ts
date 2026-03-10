import { Router } from "express";
import TweetController from "./tweet.controller";
import { authenticationMiddleware } from "~/middlewares/authentication.middleware";
import { QueryDtoSchema } from "~/shared/dtos/req/query.dto";
import { queryValidate } from "~/middlewares/query-validate.middleware";
import { asyncHandler } from "~/utils/async-handler.util";

const tweetRoute = Router();

tweetRoute.use(authenticationMiddleware);

tweetRoute.get(
  "/",
  queryValidate(QueryDtoSchema),
  asyncHandler(TweetController.getTweets),
);

export default tweetRoute;
