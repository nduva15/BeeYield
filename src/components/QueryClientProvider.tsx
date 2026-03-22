
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

// 2. Create an IDB persister
const dbPromise = openDB('beeyield-db', 1, {
    upgrade(db) {
        db.createObjectStore('react-query');
    },
});

const idbPersister = createAsyncStoragePersister({
    storage: {
        getItem: async (key) => {
            const val = await (await dbPromise).get('react-query', key);
            return val ?? null;
        },
        setItem: async (key, value) => {
            await (await dbPromise).put('react-query', value, key);
        },
        removeItem: async (key) => {
            await (await dbPromise).delete('react-query', key);
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
    await (await dbPromise).clear('react-query');
}
