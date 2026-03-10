import { signedCloudfrontUrl } from "~/clouds/aws/cloudfront.aws";
import { ResMultiDto } from "~/shared/dtos/res/res-multi.dto";
import { IQuery } from "~/shared/interfaces/query.interface";
import { getPaginationAndSafeQuery } from "~/utils/get-pagination-and-safe-query.util";
import { ICommunity } from "./community.interface";
import { CommunityCollection, CommunitySchema } from "./community.schema";

class CommunityService {
  // Admin get communities
  async adminGetCommunities({
    query,
  }: {
    admin_id: string;
    query: IQuery<ICommunity>;
  }): Promise<ResMultiDto<ICommunity>> {
    const { skip, limit, sort, q, qe } =
      getPaginationAndSafeQuery<ICommunity>(query);
    const filter: any = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    //
    const [communities, total] = await Promise.all([
      CommunityCollection.aggregate<CommunitySchema>([
        { $match: filter },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "admin",
            foreignField: "_id",
            as: "admin",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  verify: 1,
                  avatar: 1,
                  username: 1,
                },
              },
            ],
          },
        },
        // count members
        {
          $lookup: {
            from: "community-members",
            localField: "_id",
            foreignField: "community_id",
            as: "members",
          },
        },

        // count mentors
        {
          $lookup: {
            from: "community-mentors",
            localField: "_id",
            foreignField: "community_id",
            as: "mentors",
          },
        },

        {
          $addFields: {
            member_count: { $size: "$members" },
            mentor_count: { $size: "$mentors" },
          },
        },

        {
          $unwind: {
            path: "$admin",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            members: 0,
            mentors: 0,
          },
        },
      ]).toArray(),
      CommunityCollection.countDocuments({}),
    ]);

    //
    return {
      total,
      total_page: Math.ceil(total / limit),
      items: this.signedCloudfrontCoverUrls(communities) as ICommunity[],
    };
  }

  //
  signedCloudfrontCoverUrls = (
    communities: ICommunity[] | ICommunity | null,
  ) => {
    //
    if (!communities) return communities;

    //
    if (!Array.isArray(communities))
      return {
        ...communities,
        cover: {
          ...communities.cover,
          ...signedCloudfrontUrl(communities.cover),
        },
      };

    //
    return communities.map((community) => ({
      ...community,
      cover: {
        ...community.cover,
        ...signedCloudfrontUrl(community.cover),
      },
    }));
  };
}

export default new CommunityService();
