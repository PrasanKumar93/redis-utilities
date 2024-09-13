import type { IEncryptedElm } from "../utils/crypto-node-util.js";

import { decryptData } from "../utils/crypto-node-util.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "../utils/constants.js";

const getInputRedisConUrl = (
  redisConUrl?: string,
  redisConUrlEncrypted?: IEncryptedElm
) => {
  if (!redisConUrl && redisConUrlEncrypted) {
    redisConUrl = decryptData(redisConUrlEncrypted);
  }

  if (!redisConUrl) {
    throw "Redis connection URL is missing !";
  }
  return redisConUrl;
};

const getDefaultUploadType = (uploadPath: string) => {
  let retValue = "";

  if (uploadPath.match(/\.json$/) || uploadPath.match(/\.json\.gz$/)) {
    retValue = UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE;
  } else if (uploadPath.match(/\.csv$/)) {
    retValue = UPLOAD_TYPES_FOR_IMPORT.CSV_FILE;
  } else {
    retValue = UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER;
  }

  return retValue;
};

export { getInputRedisConUrl, getDefaultUploadType };
