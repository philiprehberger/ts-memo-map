# @philiprehberger/memo-map

[![CI](https://github.com/philiprehberger/ts-memo-map/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-memo-map/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/memo-map)](https://www.npmjs.com/package/@philiprehberger/memo-map)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Memoization with WeakMap support for object keys, LRU eviction, and TTL.

## Installation

```bash
npm install @philiprehberger/memo-map
```

## Usage

```ts
import { memoize } from '@philiprehberger/memo-map';

// Basic memoization
const expensive = memoize((n: number) => {
  console.log('computing...');
  return n * n;
});

expensive(5); // computing... => 25
expensive(5); // => 25 (cached)

// With LRU eviction and TTL
const cached = memoize(fetchUser, {
  maxSize: 100,
  ttl: 60_000, // 1 minute
});

// Object args use WeakMap automatically
const getSize = memoize((obj: object) => Object.keys(obj).length);

// Custom key function
const byId = memoize(
  (user: { id: number; name: string }) => user.name.toUpperCase(),
  { key: (user) => user.id },
);
```

## API

### `memoize<T>(fn, options?)`

Wraps `fn` with memoization. Returns the memoized function with additional properties.

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `maxSize` | `number` | Maximum cache entries (LRU eviction) |
| `ttl` | `number` | Time-to-live in milliseconds |
| `key` | `(...args) => unknown` | Custom cache key function |

**Returned function extras:**

- **`.cache`** — The underlying `Map` instance
- **`.clear()`** — Clear all cached entries

**Key resolution (default):**

- Single primitive arg: used directly as key
- Single object arg: stored in a `WeakMap`
- Multiple args: `JSON.stringify(args)`

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
