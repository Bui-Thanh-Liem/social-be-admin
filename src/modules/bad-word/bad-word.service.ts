import { ObjectId } from "mongodb";
import { ConflictError } from "../../core/error.response";
import {
  createKeyBadWord,
  createKeyBadWords,
} from "../../utils/create-key-cache.util";
import { removeVietnameseAccent } from "../../utils/remove-vietnamese-accent.util";
import { ActionBadWordDto } from "./bad-word.dto";
import { BadWordSchema, BadWordCollection } from "./bad-word.schema";
import CacheService from "../../helpers/cache.helper";
import { IBadWord } from "./bad-word.interface";
import { getFilterQuery } from "../../utils/get-filter-query";
import { getPaginationAndSafeQuery } from "../../utils/get-pagination-and-safe-query.util";

interface IBadWordsCached {
  _id: string;
  original: string;
  normalized: string;
  replaceWith: string;
}

class BadWordService {
  private LEET_MAP: Record<string, string> = {
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "@": "a",
    $: "s",
    "!": "i",
  };

  // Map ngược để dùng trong việc tạo Regex linh hoạt
  private LEET_MAP_REVERSE: Record<string, string> = {
    o: "0",
    i: "1!",
    e: "3",
    a: "4@",
    s: "5$",
    t: "7",
  };

  /**
   * HÀM QUAN TRỌNG: Tạo biến thể cụ thể cho từng ký tự dựa trên từ gốc.
   * Nếu char gốc là 'ặ', nó sẽ chỉ cho phép 'ặ', 'a' (không dấu) và leet speak.
   * Nó sẽ KHÔNG cho phép 'á' (của từ "các").
   */
  private getSpecificVariants(char: string): string {
    const lowerChar = char.toLowerCase();
    const baseChar = removeVietnameseAccent(lowerChar); // 'ặ' -> 'a'
    const leet = this.LEET_MAP_REVERSE[baseChar] || "";

    // Tạo Set các ký tự cho phép: [ký tự gốc có dấu, ký tự không dấu, leet speak]
    const variants = new Set([lowerChar, baseChar, ...leet.split("")]);

    // Trả về dạng regex group: [ặa4@]
    return `[${Array.from(variants).join("")}]`;
  }

  async create({ body }: { body: ActionBadWordDto }) {
    const exists = await BadWordCollection.findOne({ words: body.words });
    if (exists) throw new ConflictError("Từ cấm đã tồn tại");

    const newBadWord = await BadWordCollection.insertOne(
      new BadWordSchema({
        words: body.words,
        action: body.action,
        priority: body.priority,
        replace_with: body.replace_with,
      }),
    );
    await CacheService.del(createKeyBadWords());
    return newBadWord;
  }

  async update({
    bad_word_id,
    body,
  }: {
    bad_word_id: string;
    body: ActionBadWordDto;
  }) {
    const updatedBadWord = await BadWordCollection.findOneAndUpdate(
      { _id: new ObjectId(bad_word_id) },
      {
        $set: {
          words: body.words,
          action: body.action,
          priority: body.priority,
          replace_with: body.replace_with,
        },
      },
      { returnDocument: "after" },
    );
    await CacheService.del(createKeyBadWords());
    return updatedBadWord;
  }

  async getOneByWords({ words }: { words: string }) {
    const keyCache = createKeyBadWord(words);
    const cached = await CacheService.get<IBadWord>(keyCache);
    if (cached) return cached;
    const badWord = await BadWordCollection.findOne({ words });
    await CacheService.set(keyCache, badWord, 3600);
    return badWord;
  }

  async getMulti({ query }: { query: any }) {
    const { skip, limit, sort, q, qf } =
      getPaginationAndSafeQuery<IBadWord>(query);
    let filter: Partial<Record<keyof IBadWord, any>> = q
      ? { words: { $regex: q, $options: "i" } }
      : {};

    //
    filter = getFilterQuery(qf, filter);

    //
    const [badWords, total] = await Promise.all([
      BadWordCollection.aggregate<BadWordSchema>([
        { $match: filter },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
      ]).toArray(),
      BadWordCollection.countDocuments(filter),
    ]);

    //
    return { total, total_page: Math.ceil(total / limit), items: badWords };
  }

  async getMultiMostUsed({ query }: { query: any }) {
    const { limit, skip } = getPaginationAndSafeQuery<IBadWord>(query);
    const badWords = await BadWordCollection.find({})
      .sort({ usage_count: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
    const total = await BadWordCollection.countDocuments({});
    return { total, total_page: Math.ceil(total / limit), items: badWords };
  }

  async delete({ bad_word_id }: { bad_word_id: string }) {
    const deletedBadWord = await BadWordCollection.findOneAndDelete({
      _id: new ObjectId(bad_word_id),
    });
    await CacheService.del(createKeyBadWords());
    return deletedBadWord;
  }

  private async loadBadWordsFromDB() {
    const keyCache = createKeyBadWords();
    const cached = await CacheService.get<IBadWordsCached[]>(keyCache);
    if (cached) return cached;

    const words = await BadWordCollection.find({}).toArray();
    const badWords = words.map((w) => ({
      _id: (w as any)._id.toString(),
      original: w.words,
      normalized: this.normalizeContent(w.words),
      replaceWith: w.replace_with,
    }));
    await CacheService.set(keyCache, badWords, 3600);
    return badWords;
  }

  private normalizeContent(input: string): string {
    let normalized = removeVietnameseAccent(input.toLowerCase());
    Object.keys(this.LEET_MAP).forEach((key) => {
      normalized = normalized.replace(
        new RegExp(`\\${key}`, "g"),
        this.LEET_MAP[key],
      );
    });
    return normalized.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
  }
}

export default new BadWordService();
