import { shortKeyFromToken } from "./crypto.util";

export function createKeyAdminAT(token: string) {
  return `{admin}:at:${shortKeyFromToken(token)}`; // at: access token
}

export function createKeyAdminActive(admin_id: string) {
  return `{admin}:active:${admin_id}`;
}

export function createKeySessionLogin(admin_id: string) {
  return `{admin}:session:${admin_id}`;
}

export const createKeyBadWords = (): string => "{bad_words}:list";
export const createKeyBadWord = (words: string): string =>
  `{bad_words}:${words}`;
