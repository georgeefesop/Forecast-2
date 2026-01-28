
import * as fs from 'fs';
import * as path from 'path';

/**
 * File System Tool
 * Encapsulates local file I/O operations.
 */

export class FileSystemTool {
    /**
     * Write JSON data to a file.
     */
    static writeJson(filePath: string, data: any): void {
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`FileSystemTool.writeJson error for ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Read JSON data from a file.
     */
    static readJson<T>(filePath: string): T | null {
        try {
            if (!fs.existsSync(filePath)) return null;
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content) as T;
        } catch (error) {
            console.error(`FileSystemTool.readJson error for ${filePath}:`, error);
            return null;
        }
    }
}
