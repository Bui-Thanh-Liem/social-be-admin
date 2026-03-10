import { signedCloudfrontUrl } from "~/clouds/aws/cloudfront.aws";
import { ResMultiDto } from "~/shared/dtos/res/res-multi.dto";
import { IQuery } from "~/shared/interfaces/query.interface";
import { getFilterQuery } from "~/utils/get-filter-query";
import { getPaginationAndSafeQuery } from "~/utils/get-pagination-and-safe-query.util";
import { ITweet } from "./tweet.interface";
import { TweetCollection, TweetSchema } from "./tweet.schema";

class TweetService {
  //
  async adminGetTweets({
    query,
  }: {
    query: IQuery<TweetSchema>;
    admin_id: string;
  }): Promise<ResMultiDto<TweetSchema>> {
    const { skip, limit, sort, q, qf } =
      getPaginationAndSafeQuery<TweetSchema>(query);
    let filter: any = q ? { $text: { $search: q } } : {};

    //
    filter = getFilterQuery(qf, filter as any);

    //
    const tweets = await TweetCollection.aggregate<TweetSchema>([
      {
        $match: filter,
      },
      {
        $sort: sort,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "communities",
          localField: "community_id",
          foreignField: "_id",
          as: "community_id",
          pipeline: [
            {
              $project: {
                cover: 1,
                name: 1,
                slug: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$community_id", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id",
          pipeline: [
            {
              $project: {
                name: 1,
                username: 1,
                email: 1,
                avatar: 1,
                verify: 1,
                cover_photo: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$user_id", preserveNullAndEmptyArrays: true },
      },
    ]).toArray();

    const total = await TweetCollection.countDocuments(filter);

    return {
      total,
      total_page: Math.ceil(total / limit),
      items: this.signedCloudfrontMediaUrls(tweets) as TweetSchema[],
    };
  }

  //
  signedCloudfrontMediaUrls = (tweets: ITweet[] | ITweet | null) => {
    //
    if (!tweets) return tweets;

    //
    if (!Array.isArray(tweets))
      return {
        ...tweets,
        medias: tweets.medias?.map((m) => ({
          ...m,
          ...signedCloudfrontUrl(m),
        })) as any,
      };

    //
    return tweets.map((tweet) => ({
      ...tweet,
      medias: tweet.medias?.map((m) => ({
        ...m,
        ...signedCloudfrontUrl(m),
      })) as any,
    }));
  };
}

export default new TweetService();
