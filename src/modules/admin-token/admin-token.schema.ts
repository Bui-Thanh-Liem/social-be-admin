import { Collection, Db, ObjectId } from "mongodb";
import { BaseSchema } from "../../shared/schemas/base.schema";
import { IAdminToken } from "./admin-token.interface";

const COLLECTION_ADMIN_TOKENS_NAME = "admin-tokens";
export class AdminTokenSchema extends BaseSchema implements IAdminToken {
  admin_id: ObjectId;
  token: string;
  iat: Date | undefined;
  exp: Date | undefined;
  is_revoke: boolean;

  constructor(token: Pick<IAdminToken, "admin_id" | "token" | "iat" | "exp">) {
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

export let AdminTokenCollection: Collection<AdminTokenSchema>;

export function initAdminTokenCollection(db: Db) {
  AdminTokenCollection = db.collection<AdminTokenSchema>(
    COLLECTION_ADMIN_TOKENS_NAME,
  );
}
