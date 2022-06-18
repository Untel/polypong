import Redis from "ioredis";

export default class RedisBridge {
  key: string;
  store: Redis;

  constructor(store: Redis, key: string) {
    this.store = store;
    this.key = key;
  }

  set(key: string, value: string | number) {
    return this.store.set(`${this.key}/${key}`, `${value}`);
  }

  get(key: string) {
    return this.store.get(`${this.key}/${key}`);
  }
}
