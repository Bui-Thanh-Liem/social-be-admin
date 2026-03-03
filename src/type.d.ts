import "express";
import "socket.io";
import { IAdmin } from "./modules/admin/admin.interface";
import { IQuery } from "./shared/interfaces/query.interface";
import { IJwtPayload } from "./shared/interfaces/jwt-payload.interface";

declare module "express" {
  interface Request {
    admin?: IAdmin;
    queryParsed?: IQuery<any>;
    decoded_authorization?: IJwtPayload;
  }
}

declare module "socket.io" {
  interface Socket {
    decoded_authorization?: IJwtPayload;
  }
}
