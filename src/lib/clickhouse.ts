import { createClient } from '@clickhouse/client';

const clickhouseHost = import.meta.env.VITE_CLICKHOUSE_URL || process.env.CLICKHOUSE_URL;
const clickhouseUser = import.meta.env.VITE_CLICKHOUSE_USER || process.env.CLICKHOUSE_USER;
const clickhousePassword = import.meta.env.VITE_CLICKHOUSE_PASSWORD || process.env.CLICKHOUSE_PASSWORD;

if (typeof window !== 'undefined') {
  throw new Error('ClickHouse client must run server-side or in Edge Functions');
}

export const clickhouse = createClient({
  host: clickhouseHost,
  username: clickhouseUser,
  password: clickhousePassword
});

// Query helper for analytics (server-side only)
export const queryAnalytics = async (query: string) => {
  const resultSet = await clickhouse.query({ query, format: 'JSONEachRow' });
  return await resultSet.json();
};