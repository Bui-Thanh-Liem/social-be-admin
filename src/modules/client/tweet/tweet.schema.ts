import { Collection, Db, ObjectId } from "mongodb";
import { ICodesTweet, ITweet } from "./tweet.interface";
import { ETweetAudience, ETweetStatus, ETweetType } from "./tweet.enum";
import { IMediaBare } from "~/shared/interfaces/media-base.interface";
import { BaseSchema } from "~/shared/schemas/base.schema";

const TWEET_COLLECTION_NAME = "tweets";
export class TweetSchema extends BaseSchema implements ITweet {
  user_id: ObjectId;
  type: ETweetType;
  audience: ETweetAudience;
  content: string;
  parent_id: ObjectId | null;
  hashtags: ObjectId[];
  mentions: ObjectId[];
  medias: IMediaBare[] | null;
  guest_view: number;
  user_view: number;
  community_id: ObjectId | null;
  status: ETweetStatus;
  likes_count: number;
  comments_count: number;
  textColor: string;
  bgColor: string;
  codes: ICodesTweet[] | null;

  constructor(tweet: Partial<ITweet>) {
    super();
    this.user_id = tweet.user_id || new ObjectId();
    this.type = tweet.type || ETweetType.Tweet;
    this.likes_count = tweet.likes_count || 0;
    this.comments_count = tweet.comments_count || 0;
    this.audience = tweet.audience || ETweetAudience.Everyone;
    this.content = tweet.content || "";
    this.parent_id = tweet.parent_id || null;
    this.hashtags = tweet.hashtags || [];
    this.mentions = tweet.mentions || [];
    this.medias = tweet.medias || null;
    this.textColor = tweet.textColor || ""; // Fe set default màu chữ
    this.bgColor = tweet.bgColor || ""; // Fe set default màu nền
    this.codes = tweet.codes || null;
    this.guest_view = tweet.guest_view || 0;
    this.user_view = tweet.user_view || 0;
    this.community_id = tweet.community_id || null;
    this.status = tweet.status || ETweetStatus.Pending;
  }
}

export let TweetCollection: Collection<TweetSchema>;

export function initTweetCollection(db: Db) {
  TweetCollection = db.collection<TweetSchema>(TWEET_COLLECTION_NAME);
}
