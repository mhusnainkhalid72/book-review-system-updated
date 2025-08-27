
declare module "connect-redis" {
  import { Store } from "express-session";
  import { RedisClientType } from "redis";

  interface RedisStoreOptions {
    client: RedisClientType;
    prefix?: string;
    ttl?: number;
    serializer?: {
      stringify: (val: any) => string;
      parse: (val: string) => any;
    };
    scanCount?: number;
  }

  export default class RedisStore extends Store {
    constructor(options: RedisStoreOptions);
  }
}
