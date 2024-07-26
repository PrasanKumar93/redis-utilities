import { createClient } from "redis";

type RedisClientType = ReturnType<typeof createClient>;

// Singleton class to wrap the Redis client
class RedisWrapper {
  private static instance: RedisWrapper;
  public client: RedisClientType | null = null;

  private constructor(connectionURL?: string) {
    this.client = createClient({ url: connectionURL });
    this.client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
  }

  // --- static methods
  public static setInstance(connectionURL: string) {
    RedisWrapper.instance = new RedisWrapper(connectionURL);
    return RedisWrapper.instance;
  }

  public static getInstance(): RedisWrapper {
    return RedisWrapper.instance;
  }
  // ---

  public async connect() {
    await this.client?.connect();
    console.log("Connected successfully to Redis !");
  }

  public async disconnect() {
    await this.client?.disconnect();
    console.log("Disconnected from Redis.");
  }

  public async set(_key: string, _value: string) {
    const result = await this.client?.set(_key, _value);
    return result;
  }

  public async get(_key: string) {
    const result = await this.client?.get(_key);
    return result;
  }

  public async getKeys(_pattern?: string) {
    _pattern = _pattern || "*";
    const result = await this.client?.keys(_pattern);
    return result;
  }
}

export default RedisWrapper;

/** Example Usage 
 
// on app start
const redisWrapper = RedisWrapper.setInstance("redis://localhost:6379");
await redisWrapper.connect(); 

// on app usage
const redisWrapper = RedisWrapper.getInstance();
await redisWrapper.set("key", "value");
await redisWrapper.client.set("key", "value"); // direct access to client 

*/
