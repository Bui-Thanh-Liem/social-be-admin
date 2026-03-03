import { ObjectId } from "mongodb";
import { IBase } from "../../shared/interfaces/base.interface";

export interface IToken extends IBase {
  token: string;
  is_revoke: boolean;
  admin_id: ObjectId;
  iat: Date | number | undefined;
  exp: Date | number | undefined;
}
