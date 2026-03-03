import { Request, Response } from "express";
import MediaService from "./media.service";
import { IJwtPayload } from "../../shared/interfaces/jwt-payload.interface";
import { OkResponse } from "../../core/success.response";
import { IQuery } from "../../shared/interfaces/query.interface";
import { IMedia } from "./media.interface";

class MediaController {
  async getMedias(req: Request, res: Response) {
    const { admin_id } = req.decoded_authorization as IJwtPayload;
    const result = await MediaService.getMedias({
      admin_id,
      query: req.queryParsed as IQuery<IMedia>,
    });
    res.json(
      new OkResponse("Lấy danh sách hình ảnh / video thành công", result),
    );
  }
}

export default new MediaController();
