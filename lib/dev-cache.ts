import fs from 'fs/promises';
import path from 'path';
import { fileExists } from './image-processing';

export interface DevCacheEntry {
  filename: string;
  width: number;
  height: number;
  blurDataURL: string;
  lastModified: number;
}

export class DevCache {
  private cache = new Map<string, DevCacheEntry>();
  private cacheDir: string;
  private cacheFile: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), '.next', 'cache', 'images');
    this.cacheFile = path.join(this.cacheDir, 'dev-metadata.json');
  }

  /**
   * 初始化缓存，从文件加载已有数据
   */
  async initialize(): Promise<void> {
    try {
      // 确保缓存目录存在
      await fs.mkdir(this.cacheDir, { recursive: true });

      // 如果缓存文件存在，加载数据
      if (await fileExists(this.cacheFile)) {
        const data = await fs.readFile(this.cacheFile, 'utf-8');
        const entries: DevCacheEntry[] = JSON.parse(data);
        
        for (const entry of entries) {
          this.cache.set(entry.filename, entry);
        }
        
        console.log(`Loaded ${entries.length} cached image metadata entries`);
      }
    } catch (error) {
      console.warn('Failed to initialize dev cache:', error);
    }
  }

  /**
   * 获取缓存条目
   */
  get(filename: string): DevCacheEntry | undefined {
    return this.cache.get(filename);
  }

  /**
   * 设置缓存条目
   */
  set(entry: DevCacheEntry): void {
    this.cache.set(entry.filename, entry);
  }

  /**
   * 检查缓存是否有效（文件未被修改）
   */
  async isValid(filename: string, imagePath: string): Promise<boolean> {
    const entry = this.cache.get(filename);
    if (!entry) return false;

    try {
      const stat = await fs.stat(imagePath);
      return stat.mtimeMs === entry.lastModified;
    } catch {
      return false;
    }
  }

  /**
   * 保存缓存到文件
   */
  async save(): Promise<void> {
    try {
      const entries = Array.from(this.cache.values());
      await fs.writeFile(this.cacheFile, JSON.stringify(entries, null, 2));
      console.log(`Saved ${entries.length} image metadata entries to cache`);
    } catch (error) {
      console.error('Failed to save dev cache:', error);
    }
  }

  /**
   * 清理缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取所有缓存条目
   */
  getAll(): DevCacheEntry[] {
    return Array.from(this.cache.values());
  }
} 