import { Request, Response } from "express";
import { OkResponse } from "~/core/success.response";
import { IJwtPayload } from "~/shared/interfaces/jwt-payload.interface";
import CommunityService from "./community.service";

class CommunityController {
  async getCommunities(req: Request, res: Response) {
    const { admin_id } = req.decoded_authorization as IJwtPayload;
    const result = await CommunityService.adminGetCommunities({
      admin_id,
      query: req.query,
    });
    res.json(new OkResponse("Lấy danh sách cộng đồng thành công", result));
  }
}

export default new CommunityController();
