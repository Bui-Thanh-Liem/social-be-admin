import { Collection, Db } from "mongodb";
import { BaseSchema } from "../../shared/schemas/base.schema";
import { EActionBadWord, EPriorityBadWord } from "./bad-word.enum";
import { IBadWord } from "./bad-word.interface";

const COLLECTION_BAD_WORD_NAME = "bad-words";
export class BadWordSchema extends BaseSchema implements IBadWord {
  words: string;
  usage_count: number;
  replace_with: string;
  priority: EPriorityBadWord;
  action: EActionBadWord;

  constructor(
    badWord: Pick<IBadWord, "words" | "priority" | "replace_with" | "action">,
  ) {
    super();
    this.usage_count = 0;
    this.words = badWord.words || "";
    this.replace_with = badWord.replace_with || "";
    this.action = badWord.action || EActionBadWord.Warn;
    this.priority = badWord.priority || EPriorityBadWord.Low;
  }
}

export let BadWordCollection: Collection<BadWordSchema>;

export function initBadWordCollection(db: Db) {
  BadWordCollection = db.collection<BadWordSchema>(COLLECTION_BAD_WORD_NAME);
}
