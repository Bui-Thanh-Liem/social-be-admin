import { IBase } from "../../shared/interfaces/base.interface";
import { EActionBadWord, EPriorityBadWord } from "./bad-word.enum";

export interface IBadWord extends IBase {
  words: string;
  priority: EPriorityBadWord;
  replace_with: string;
  usage_count: number;
  action: EActionBadWord;
}
