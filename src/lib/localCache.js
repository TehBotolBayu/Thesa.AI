import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'papers');

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create cache directory:', error);
  }
}

// Generate a safe filename based on a unique identifier (like pdfUrl or paper id)
function getCacheFilePath(identifier) {
  const hash = crypto.createHash('md5').update(identifier).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

export async function saveChunksToCache(identifier, chunks) {
  await ensureCacheDir();
  const filePath = getCacheFilePath(identifier);
  try {
    await fs.writeFile(filePath, JSON.stringify(chunks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save chunks to cache:', error);
    return false;
  }
}

export async function getChunksFromCache(identifier) {
  const filePath = getCacheFilePath(identifier);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return null if file does not exist or cannot be parsed
    return null;
  }
}
