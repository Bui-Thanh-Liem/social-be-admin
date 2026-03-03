export enum ETweetAudience {
  Everyone,
  Followers,
  Mentions,
}

export enum ETweetStatus {
  Pending = "Chờ duyệt",
  Reject = "Từ chối",
  Ready = "Sẵn sàng",
}

export enum ETweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet, // đăng lại và thêm được content của mình
}
