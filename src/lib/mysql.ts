import mysql from 'mysql2/promise';

// ============================================
// MySQL Connection Pools
// ============================================

// Analytics backup MySQL pool
export const createMySQLPool = () => {
  return mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// BeeYield MySQL connection pool
export const createBeeYieldPool = () => {
  return mysql.createPool({
    host: process.env.BEEYIELD_MYSQL_HOST,
    port: parseInt(process.env.BEEYIELD_MYSQL_PORT || '3306'),
    user: process.env.BEEYIELD_MYSQL_USER,
    password: process.env.BEEYIELD_MYSQL_PASSWORD,
    database: process.env.BEEYIELD_MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// ============================================
// Query Helpers (Edge Functions / Server-side only)
// ============================================

// Analytics backup query helper
export const mysqlQuery = async <T = unknown>(sql: string, params?: unknown[]): Promise<T[]> => {
  const pool = createMySQLPool();
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } finally {
    await pool.end();
  }
};

// BeeYield query helper
export const beeYieldQuery = async <T = unknown>(sql: string, params?: unknown[]): Promise<T[]> => {
  const pool = createBeeYieldPool();
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } finally {
    await pool.end();
  }
};

// BeeYield transaction helper for complex operations
export const beeYieldTransaction = async <T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
  const pool = createBeeYieldPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};