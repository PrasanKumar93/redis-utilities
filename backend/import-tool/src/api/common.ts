import type { IEncryptedElm } from "../utils/crypto-node-util.js";

import { decryptData } from "../utils/crypto-node-util.js";

const getInputRedisConUrl = (
  redisConUrl?: string,
  redisConUrlEncrypted?: IEncryptedElm
) => {
  if (!redisConUrl && redisConUrlEncrypted) {
    redisConUrl = decryptData(redisConUrlEncrypted);
  }

  if (!redisConUrl) {
    throw new Error("Redis connection URL is missing !");
  }
  return redisConUrl;
};

export { getInputRedisConUrl };
