import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ downloadId: string; filename: string }> }
) {
  try {
    const { downloadId, filename } = await params;

    // Decode the filename
    const decodedFilename = decodeURIComponent(filename);

    // Security check: ensure the filename starts with the download ID
    if (!decodedFilename.startsWith(downloadId)) {
      return NextResponse.json(
        { error: "Invalid file access" },
        { status: 403 }
      );
    }

    // Construct the file path
    const filePath = path.join(config.tempDir, decodedFilename);

    // Security check: ensure the file is within the temp directory
    const tempDir = path.resolve(config.tempDir);
    const resolvedFilePath = path.resolve(filePath);
    if (!resolvedFilePath.startsWith(tempDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file stats
    const stats = await fs.stat(filePath);

    // Read the file
    const fileBuffer = await fs.readFile(filePath);

    // Determine content type based on file extension
    const ext = path.extname(decodedFilename).toLowerCase();
    const contentType = getContentType(ext);

    // Clean filename for download (remove download ID prefix)
    const cleanFilename = decodedFilename.replace(`${downloadId}_`, "");

    // Schedule file deletion after a delay (allowing time for download to complete)
    setTimeout(async () => {
      try {
        // Check if file still exists before trying to delete
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(`Cleaned up downloaded file: ${decodedFilename}`);
      } catch (error) {
        // File might already be deleted, which is fine
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error(`Error cleaning up file ${decodedFilename}:`, error);
        }
      }

      // Also remove the associated .info.json file if it exists
      const infoFile = filePath.replace(/\.[^.]+$/, ".info.json");
      try {
        await fs.access(infoFile);
        await fs.unlink(infoFile);
        console.log(`Cleaned up info file: ${path.basename(infoFile)}`);
      } catch {
        // Ignore if info file doesn't exist or already deleted
      }
    }, 2 * 60 * 1000); // 2 minutes delay (reduced)

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Content-Disposition": `attachment; filename="${cleanFilename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}

function getContentType(extension: string): string {
  const types: { [key: string]: string } = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".flv": "video/x-flv",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".opus": "audio/opus",
    ".ogg": "audio/ogg",
    ".aac": "audio/aac",
  };

  return types[extension] || "application/octet-stream";
}
