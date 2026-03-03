import { Request, Response } from "express";
import TweetService from "./tweet.service";
import { OkResponse } from "../../core/success.response";
import { IQuery } from "../../shared/interfaces/query.interface";
import { ITweet } from "./tweet.interface";
import { IJwtPayload } from "../../shared/interfaces/jwt-payload.interface";

class TweetController {
  async getTweets(req: Request, res: Response) {
    const { admin_id } = req.decoded_authorization as IJwtPayload;
    const result = await TweetService.adminGetTweets({
      admin_id,
      query: req.queryParsed as IQuery<ITweet>,
    });
    res.json(new OkResponse("Lấy danh sách bài viết thành công", result));
  }
}

export default new TweetController();
