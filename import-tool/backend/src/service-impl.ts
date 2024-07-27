import { RedisWrapper } from "./utils/redis";

const testRedisConnection = async (redisConUrl: string) => {
  const redisWrapper = new RedisWrapper(redisConUrl);

  await redisWrapper.connect();
  await redisWrapper.client?.ping();
  await redisWrapper.disconnect();

  return "Connection to Redis successful !";
};

export { testRedisConnection };
