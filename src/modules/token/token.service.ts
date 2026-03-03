import { ObjectId } from "mongodb";
import { IToken } from "./token.interface";
import CacheService from "../../helpers/cache.helper";
import { TokenSchema, TokenCollection } from "./token.schema";
import { createKeyAdminAT } from "../../utils/create-key-cache.util";

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
  }: Pick<IToken, "admin_id" | "token" | "iat" | "exp">) {
    const filter = { admin_id: new ObjectId(admin_id) };
    const result = await TokenCollection.findOneAndUpdate(
      filter,
      {
        $set: new TokenSchema({
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
  async findByToken({ token }: Pick<IToken, "token">) {
    // Trước tiên sẽ kiểm tra cache, nếu có thì trả về luôn, không thì mới truy vấn database
    const keyCache = createKeyAdminAT(token);
    const cachedToken = await CacheService.get<IToken>(keyCache);

    // Nếu có token trong cache thì trả về luôn, không thì mới truy vấn database
    if (cachedToken) {
      return cachedToken;
    } else {
      const token_ = await TokenCollection.findOne({ token });
      if (token_) {
        await CacheService.set(keyCache, token_, 300);
      }
      return token_;
    }
  }

  //
  async findOneByAdminId({ admin_id }: { admin_id: string }) {
    return await TokenCollection.findOne({
      admin_id: new ObjectId(admin_id),
    });
  }

  //
  async deleteByToken({ token }: Pick<IToken, "token">) {
    return await TokenCollection.deleteOne({ token });
  }

  //
  async deleteByAdminId({ admin_id }: { admin_id: string }) {
    return await TokenCollection.deleteOne({
      admin_id: new ObjectId(admin_id),
    });
  }
}

export default new TokenService();
