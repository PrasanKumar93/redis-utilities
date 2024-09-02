import { z } from "zod";

import { getInputRedisConUrl } from "./common-api.js";
import { RedisWrapper } from "../utils/redis.js";
import * as InputSchemas from "../input-schema.js";

const testRedisConnection = async (
  input: z.infer<typeof InputSchemas.testRedisConnectionSchema>
) => {
  InputSchemas.testRedisConnectionSchema.parse(input); // validate input

  let redisConUrl = getInputRedisConUrl(
    input.redisConUrl,
    input.redisConUrlEncrypted
  );

  const redisWrapper = new RedisWrapper(redisConUrl);

  await redisWrapper.connect();
  await redisWrapper.client?.ping();
  await redisWrapper.disconnect();

  return "Connection to Redis successful !";
};

export { testRedisConnection };
