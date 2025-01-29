declare module 'lru-cache' {
  interface Options<K, V> {
    max?: number;
    maxAge?: number;
    length?(value: V, key: K): number;
    dispose?(key: K, value: V): void;
    stale?: boolean;
  }

  class LRUCache<K, V> {
    constructor(options: Options<K, V>);
    set(key: K, value: V, maxAge?: number): boolean;
    get(key: K): V | undefined;
    peek(key: K): V | undefined;
    del(key: K): void;
    reset(): void;
    has(key: K): boolean;
    forEach<T = this>(
      callback: (this: T, value: V, key: K, cache: this) => void,
      thisArg?: T
    ): void;
    rforEach<T = this>(
      callback: (this: T, value: V, key: K, cache: this) => void,
      thisArg?: T
    ): void;
    keys(): K[];
    values(): V[];
    length: number;
    itemCount: number;
  }

  export = LRUCache;
}
