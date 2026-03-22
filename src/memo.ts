import type { MemoizeOptions } from './types';

interface CacheEntry<R> {
  value: R;
  expires: number | null;
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: MemoizeOptions<T>,
): T & { cache: Map<unknown, unknown>; clear(): void } {
  const maxSize = options?.maxSize;
  const ttl = options?.ttl;
  const keyFn = options?.key;

  const mapCache = new Map<unknown, CacheEntry<ReturnType<T>>>();
  const weakCache = new WeakMap<object, CacheEntry<ReturnType<T>>>();
  let useWeakMap = false;

  function resolveKey(args: unknown[]): { key: unknown; weak: boolean } {
    if (keyFn) {
      const k = keyFn(...(args as Parameters<T>));
      return { key: k, weak: false };
    }

    if (args.length === 1) {
      const arg = args[0];
      if (arg !== null && (typeof arg === 'object' || typeof arg === 'function')) {
        return { key: arg, weak: true };
      }
      return { key: arg, weak: false };
    }

    return { key: JSON.stringify(args), weak: false };
  }

  function getEntry(
    key: unknown,
    weak: boolean,
  ): CacheEntry<ReturnType<T>> | undefined {
    if (weak) {
      return weakCache.get(key as object);
    }
    return mapCache.get(key);
  }

  function setEntry(
    key: unknown,
    weak: boolean,
    entry: CacheEntry<ReturnType<T>>,
  ): void {
    if (weak) {
      weakCache.set(key as object, entry);
      return;
    }

    if (maxSize !== undefined && mapCache.size >= maxSize && !mapCache.has(key)) {
      const firstKey = mapCache.keys().next().value;
      mapCache.delete(firstKey!);
    }

    mapCache.set(key, entry);
  }

  const memoized = function (this: unknown, ...args: unknown[]): ReturnType<T> {
    const { key, weak } = resolveKey(args);
    const existing = getEntry(key, weak);

    if (existing !== undefined) {
      if (existing.expires !== null && Date.now() > existing.expires) {
        if (weak) {
          weakCache.delete(key as object);
        } else {
          mapCache.delete(key);
        }
      } else {
        return existing.value;
      }
    }

    const result = fn.apply(this, args);
    const entry: CacheEntry<ReturnType<T>> = {
      value: result,
      expires: ttl ? Date.now() + ttl : null,
    };
    setEntry(key, weak, entry);
    return result;
  } as T & { cache: Map<unknown, unknown>; clear(): void };

  memoized.cache = mapCache as Map<unknown, unknown>;

  memoized.clear = (): void => {
    mapCache.clear();
  };

  return memoized;
}
