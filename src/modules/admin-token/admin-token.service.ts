import { ObjectId } from "mongodb";
import CacheService from "../../helpers/cache.helper";
import { createKeyAdminAT } from "../../utils/create-key-cache.util";
import { IAdminToken } from "./admin-token.interface";
import { AdminTokenCollection, AdminTokenSchema } from "./admin-token.schema";

class TokenService {
  /**
   *
   * @param param
   * @returns
   * @description Mỗi admin chỉ có một token duy nhất
   */
  async create({
    iat,
    exp,
    token,
    admin_id,
  }: Pick<IAdminToken, "admin_id" | "token" | "iat" | "exp">) {
    const filter = { admin_id: new ObjectId(admin_id) };
    const result = await AdminTokenCollection.findOneAndUpdate(
      filter,
      {
        $set: new AdminTokenSchema({
          exp,
          iat,
          token,
          admin_id: new ObjectId(admin_id),
        }),
      },
      { upsert: true, returnDocument: "before" },
    );

    return result;
  }

  //
  async findByToken({ token }: Pick<IAdminToken, "token">) {
    // Trước tiên sẽ kiểm tra cache, nếu có thì trả về luôn, không thì mới truy vấn database
    const keyCache = createKeyAdminAT(token);
    const cachedToken = await CacheService.get<IAdminToken>(keyCache);

    // Nếu có token trong cache thì trả về luôn, không thì mới truy vấn database
    if (cachedToken) {
      return cachedToken;
    } else {
      const token_ = await AdminTokenCollection.findOne({ token });
      if (token_) {
        await CacheService.set(keyCache, token_, 300);
      }
      return token_;
    }
  }

  //
  async findOneByAdminId({ admin_id }: { admin_id: string }) {
    return await AdminTokenCollection.findOne({
      admin_id: new ObjectId(admin_id),
    });
  }

  //
  async deleteByToken({ token }: Pick<IAdminToken, "token">) {
    return await AdminTokenCollection.deleteOne({ token });
  }

  //
  async deleteByAdminId({ admin_id }: { admin_id: string }) {
    return await AdminTokenCollection.deleteOne({
      admin_id: new ObjectId(admin_id),
    });
  }
}

export default new TokenService();
