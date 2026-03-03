import { Collection, Db, ObjectId } from "mongodb";
import { IToken } from "./token.interface";
import { BaseSchema } from "../../shared/schemas/base.schema";

export class TokenSchema extends BaseSchema implements IToken {
  admin_id: ObjectId;
  token: string;
  iat: Date | undefined;
  exp: Date | undefined;
  is_revoke: boolean;

  constructor(token: Pick<IToken, "admin_id" | "token" | "iat" | "exp">) {
    super();
    this.token = token.token;
    this.is_revoke = false;
    this.admin_id = token.admin_id;
    if (token.iat && typeof token.iat === "number")
      this.iat = new Date(token.iat * 1000);
    if (token.exp && typeof token.exp === "number")
      this.exp = new Date(token.exp * 1000);
  }
}

export let TokenCollection: Collection<TokenSchema>;

export function initTokenCollection(db: Db) {
  TokenCollection = db.collection<TokenSchema>("tokens");
}
