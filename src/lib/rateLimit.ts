import LRU from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRU({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (res: any, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) || [0])[0];
        if (tokenCount === 0) {
          tokenCache.set(token, [1]);
          resolve();
        } else if (tokenCount < limit) {
          tokenCache.set(token, [tokenCount + 1]);
          resolve();
        } else {
          res.status(429).send('Too Many Requests');
          reject();
        }
      }),
  };
}
