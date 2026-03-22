import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { memoize } from '../../dist/index.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('memoize', () => {
  it('should return cached result for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => {
      calls++;
      return x * 2;
    });

    assert.strictEqual(fn(5), 10);
    assert.strictEqual(fn(5), 10);
    assert.strictEqual(calls, 1);
  });

  it('should compute fresh result for different args', () => {
    let calls = 0;
    const fn = memoize((x: number) => {
      calls++;
      return x * 2;
    });

    assert.strictEqual(fn(5), 10);
    assert.strictEqual(fn(3), 6);
    assert.strictEqual(calls, 2);
  });

  it('should evict oldest entry when maxSize exceeded', () => {
    let calls = 0;
    const fn = memoize(
      (x: number) => {
        calls++;
        return x * 2;
      },
      { maxSize: 2 },
    );

    fn(1);
    fn(2);
    fn(3); // evicts key=1
    assert.strictEqual(calls, 3);

    fn(1); // must recompute
    assert.strictEqual(calls, 4);

    fn(3); // still cached
    assert.strictEqual(calls, 4);
  });

  it('should expire entries after ttl', async () => {
    let calls = 0;
    const fn = memoize(
      (x: number) => {
        calls++;
        return x * 2;
      },
      { ttl: 50 },
    );

    fn(1);
    assert.strictEqual(calls, 1);

    fn(1);
    assert.strictEqual(calls, 1);

    await sleep(80);

    fn(1);
    assert.strictEqual(calls, 2);
  });

  it('should use custom key function', () => {
    let calls = 0;
    const fn = memoize(
      (obj: { id: number; name: string }) => {
        calls++;
        return obj.name.toUpperCase();
      },
      { key: (obj) => obj.id },
    );

    assert.strictEqual(fn({ id: 1, name: 'alice' }), 'ALICE');
    assert.strictEqual(fn({ id: 1, name: 'bob' }), 'ALICE'); // same key
    assert.strictEqual(calls, 1);
  });

  it('should clear the cache', () => {
    let calls = 0;
    const fn = memoize((x: number) => {
      calls++;
      return x;
    });

    fn(1);
    fn.clear();
    fn(1);
    assert.strictEqual(calls, 2);
  });

  it('should cache object args via WeakMap', () => {
    let calls = 0;
    const fn = memoize((obj: object) => {
      calls++;
      return Object.keys(obj).length;
    });

    const a = { x: 1, y: 2 };
    assert.strictEqual(fn(a), 2);
    assert.strictEqual(fn(a), 2);
    assert.strictEqual(calls, 1);
  });

  it('should work with multiple args', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => {
      calls++;
      return a + b;
    });

    assert.strictEqual(fn(1, 2), 3);
    assert.strictEqual(fn(1, 2), 3);
    assert.strictEqual(calls, 1);

    assert.strictEqual(fn(2, 1), 3);
    assert.strictEqual(calls, 2);
  });
});
