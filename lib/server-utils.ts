import { promises as fs } from "fs";
import path from "path";
import { config } from "@/lib/config";

// Cleanup function for old temp files - SERVER SIDE ONLY
export async function cleanupTempFiles(): Promise<void> {
  try {
    const tempDir = config.tempDir;

    // Ensure temp directory exists
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }

    let files: string[] = [];
    try {
      files = await fs.readdir(tempDir);
    } catch (error) {
      console.error("Error reading temp directory:", error);
      return;
    }

    const now = Date.now();
    let cleanedCount = 0;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      try {
        const stat = await fs.stat(filePath);

        // Delete files older than tempFileLifetime
        if (now - stat.mtime.getTime() > config.tempFileLifetime) {
          await fs.unlink(filePath);
          cleanedCount++;
          console.log(`Cleaned up old temp file: ${file}`);
        }
      } catch (error) {
        // File might have been deleted already, ignore specific errors
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.log(`Could not clean up ${file}:`, (error as Error).message);
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleanup completed: ${cleanedCount} files removed`);
    } else {
      console.log("No old temp files to clean up");
    }
  } catch (error) {
    console.error("Error during temp file cleanup:", error);
  }
}

// Force cleanup all temp files (for development/debugging)
export async function forceCleanupAllTempFiles(): Promise<void> {
  try {
    const tempDir = config.tempDir;

    let files: string[] = [];
    try {
      files = await fs.readdir(tempDir);
    } catch (error) {
      console.error("Error reading temp directory:", error);
      return;
    }

    let cleanedCount = 0;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      try {
        await fs.unlink(filePath);
        cleanedCount++;
        console.log(`Force cleaned temp file: ${file}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.log(
            `Could not force clean ${file}:`,
            (error as Error).message
          );
        }
      }
    }

    console.log(`Force cleanup completed: ${cleanedCount} files removed`);
  } catch (error) {
    console.error("Error during force cleanup:", error);
  }
}

// Clean up temp files on server startup
cleanupTempFiles();
