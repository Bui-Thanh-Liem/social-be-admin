import { JwtPayload } from "jsonwebtoken";
import { ETokenType } from "../enums/type.enum";

export interface IJwtPayload extends JwtPayload {
  admin_id: string;
  type: ETokenType;
}
