# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-21

### Added

- `memoize()` function with automatic Map/WeakMap selection
- LRU eviction via `maxSize` option
- TTL-based expiry via `ttl` option
- Custom key function support
- `.cache` property and `.clear()` method on memoized functions
