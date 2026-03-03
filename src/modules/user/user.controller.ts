import { Request, Response } from "express";
import { IJwtPayload } from "../../shared/interfaces/jwt-payload.interface";
import userService from "./user.service";
import { OkResponse } from "../../core/success.response";
import { IQuery } from "../../shared/interfaces/query.interface";
import { IUser } from "./user.interface";

class UserController {
  async getUser(req: Request, res: Response) {
    const { admin_id } = req.decoded_authorization as IJwtPayload;
    const result = await userService.getUsers({
      admin_id,
      query: req.queryParsed as IQuery<IUser>,
    });
    res.json(new OkResponse("Lấy danh sách người dùng thành công", result));
  }
}

export default new UserController();
