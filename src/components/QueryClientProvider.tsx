
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { openDB } from 'idb';

// 1. Create a stable QueryClient instance
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false, // Prevent too many refetches on focus
        },
    },
});

// 2. Create a resilient IDB persister (guards against corrupted cache/IDB errors)
const DB_NAME = 'beeyield-db';
const STORE_NAME = 'react-query';

const deleteDb = () => {
    if (typeof indexedDB === 'undefined') return;
    try {
        indexedDB.deleteDatabase(DB_NAME);
    } catch {
        // ignore cleanup errors
    }
};

const openSafeDb = async () => {
    try {
        return await openDB(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME);
            },
        });
    } catch (error) {
        console.warn('[QueryCache] Failed to open IDB, falling back to memory.', error);
        deleteDb();
        return null;
    }
};

const dbPromise = openSafeDb();

const idbPersister = createAsyncStoragePersister({
    storage: {
        getItem: async (key) => {
            try {
                const db = await dbPromise;
                if (!db) return null;
                const val = await db.get(STORE_NAME, key);
                return val ?? null;
            } catch (error) {
                console.warn('[QueryCache] Failed to read cache, clearing store.', error);
                deleteDb();
                return null;
            }
        },
        setItem: async (key, value) => {
            try {
                const db = await dbPromise;
                if (!db) return;
                await db.put(STORE_NAME, value, key);
            } catch (error) {
                console.warn('[QueryCache] Failed to persist cache, clearing store.', error);
                deleteDb();
            }
        },
        removeItem: async (key) => {
            try {
                const db = await dbPromise;
                if (!db) return;
                await db.delete(STORE_NAME, key);
            } catch (error) {
                console.warn('[QueryCache] Failed to remove cache key, clearing store.', error);
                deleteDb();
            }
        },
    },
});

// 3. Provider Component
export function BeeYieldQueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ 
                persister: idbPersister, 
                maxAge: 1000 * 60 * 60 * 24,
                buster: 'v2' // Force clear cache to eliminate soft-deleted db states
            }} 
        >
            {children}
        </PersistQueryClientProvider>
    );
}

// 4. Helper to clear cache (e.g. on logout)
export async function clearQueryCache() {
    queryClient.clear();
    const db = await dbPromise;
    if (db) {
        await db.clear(STORE_NAME);
    }
}
