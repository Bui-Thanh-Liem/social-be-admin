import { Collection, Db, ObjectId } from "mongodb";
import { BaseSchema } from "../../../shared/schemas/base.schema";
import { IMedia } from "./media.interface";
import { EMediaStatus } from "./media.enum";

const MEDIA_COLLECTION_NAME = "medias";
export class MediaSchema extends BaseSchema implements IMedia {
  file_size: number;
  url?: string | undefined;
  file_type: string;
  s3_key: string;
  file_name: string;
  status: EMediaStatus;
  user_id?: ObjectId | undefined;

  constructor(media: Partial<IMedia>) {
    super();
    this.file_size = media.file_size || 0;
    this.url = media.url || undefined;
    this.file_type = media.file_type || "";
    this.s3_key = media.s3_key || "";
    this.file_name = media.file_name || "";
    this.user_id = media.user_id || undefined;
    this.status = media.status || EMediaStatus.Pending;
  }
}

export let MediaCollection: Collection<MediaSchema>;

export function initMediaCollection(db: Db) {
  MediaCollection = db.collection<MediaSchema>(MEDIA_COLLECTION_NAME);
}
