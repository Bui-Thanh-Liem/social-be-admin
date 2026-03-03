import { signedCloudfrontUrl } from "../../clouds/aws/cloudfront.aws";
import { ResMultiDto } from "../../shared/dtos/res/res-multi.dto";
import { IQuery } from "../../shared/interfaces/query.interface";
import { getFilterQuery } from "../../utils/get-filter-query";
import { getPaginationAndSafeQuery } from "../../utils/get-pagination-and-safe-query.util";
import { IUser } from "./user.interface";
import { UserCollection, UserSchema } from "./user.schema";

class UserService {
  //
  async getUsers({
    admin_id,
    query,
  }: {
    admin_id: string;
    query: IQuery<IUser>;
  }): Promise<ResMultiDto<IUser>> {
    //
    const { skip, limit, sort, q, qf } =
      getPaginationAndSafeQuery<IUser>(query);
    let filter: any = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    //
    filter = getFilterQuery(qf, filter as any);

    // Trường hợp đặt biệt , status lồng trong 2 cấp
    if (filter?.status) {
      filter["status.status"] = filter.status;
      delete filter.status;
    }

    //
    const [users, total] = await Promise.all([
      UserCollection.aggregate<UserSchema>([
        { $match: filter },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
          },
        },
      ]).toArray(),
      UserCollection.countDocuments(filter),
    ]);

    return {
      total,
      total_page: Math.ceil(total / limit),
      items: this.signedCloudfrontAvatarUrls(users) as IUser[],
    };
  }

  //
  signedCloudfrontAvatarUrls = (users: IUser[] | IUser | null) => {
    //
    if (!users) return users;

    //
    if (!Array.isArray(users))
      return {
        ...users,
        avatar: users?.avatar
          ? {
              s3_key: users.avatar.s3_key,
              ...signedCloudfrontUrl(users.avatar),
            }
          : null,
      };

    //
    return users.map((user) => ({
      ...user,
      avatar: user?.avatar
        ? {
            s3_key: user.avatar.s3_key,
            ...signedCloudfrontUrl(user.avatar),
          }
        : null,
    }));
  };
}

export default new UserService();
