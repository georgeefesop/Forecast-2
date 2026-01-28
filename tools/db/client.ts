
import { db } from '../../lib/db/client';

/**
 * Database Tool
 * Encapsulates raw SQL interactions with the Postgres database.
 */

export class DatabaseTool {
    /**
     * Execute a raw SQL query.
     */
    static async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
        try {
            const result = await db.query(sql, params);
            return result.rows;
        } catch (error) {
            console.error('DatabaseTool.query error:', error);
            throw error;
        }
    }

    /**
     * Execute an update or insert query.
     */
    static async execute(sql: string, params?: any[]): Promise<void> {
        try {
            await db.query(sql, params);
        } catch (error) {
            console.error('DatabaseTool.execute error:', error);
            throw error;
        }
    }
}
