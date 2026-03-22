export interface MemoizeOptions<T extends (...args: any[]) => any> {
  maxSize?: number;
  ttl?: number;
  key?: (...args: Parameters<T>) => unknown;
}
