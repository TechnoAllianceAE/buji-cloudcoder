/**
 * A simple Least Recently Used (LRU) cache implementation using a Map.
 * It leverages the fact that Map objects maintain insertion order.
 */
export declare class LRUCache<K, V> {
    private maxSize;
    private cache;
    constructor(maxSize: number);
    /**
     * Retrieves an item from the cache. If found, marks it as recently used.
     * @param key The key of the item to retrieve.
     * @returns The value associated with the key, or undefined if not found.
     */
    get(key: K): V | undefined;
    /**
     * Adds or updates an item in the cache. If the cache exceeds maxSize,
     * the least recently used item is evicted.
     * @param key The key of the item to set.
     * @param value The value to associate with the key.
     */
    set(key: K, value: V): void;
    /**
     * Returns the current number of items in the cache.
     */
    get size(): number;
    /**
     * Clears all items from the cache.
     */
    clear(): void;
}
//# sourceMappingURL=lru-cache.d.ts.map