import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { config, generateDownloadId } from "@/lib/config";
import { cleanupTempFiles } from "@/lib/server-utils";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { url, format, audioOnly, includeAudio } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Generate unique download ID
    const downloadId = generateDownloadId();

    // Ensure temp directory exists
    try {
      await fs.mkdir(config.tempDir, { recursive: true });
    } catch (error) {
      console.error("Error creating temp directory:", error);
    }

    // Clean up old files periodically
    cleanupTempFiles().catch(console.error);

    // Prepare yt-dlp command with temp directory
    const outputTemplate = path.join(
      config.tempDir,
      `${downloadId}_%(title)s.%(ext)s`
    );
    const args = [
      "--no-playlist",
      "--write-info-json",
      "--output",
      outputTemplate,
    ];

    if (audioOnly) {
      args.push("--extract-audio");
      args.push("--audio-format", format || "mp3");
    } else {
      // For video downloads - handle both combined and video-only formats
      console.log("Received format:", format);
      console.log("Include audio:", includeAudio);
      console.log("Using MP4 format (hardcoded for compatibility)");

      let formatString;
      if (format && format !== "best") {
        if (includeAudio) {
          // For specific format IDs, use more reliable merging
          // Try the specific format first, then fallback to best
          formatString = `${format}+bestaudio/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best`;
        } else {
          // Video only - use the specific format without audio
          formatString = format;
        }
      } else {
        if (includeAudio) {
          // Default to best compatible combination
          formatString =
            "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
        } else {
          // Video only - best video without audio
          formatString = "bestvideo[ext=mp4]/bestvideo";
        }
      }

      console.log("Using format string:", formatString);
      args.push("--format", formatString);

      // Hardcode MP4 format for maximum compatibility
      // Don't force conversion - let yt-dlp use native formats to avoid postprocessing errors

      // Add metadata and thumbnails
      args.push("--embed-thumbnail");
      args.push("--embed-metadata");
    }

    args.push(url);

    console.log("Executing yt-dlp with args:", args);

    // Start download process
    const downloadProcess = spawn(config.ytDlpPath, args);

    let downloadProgress = 0;
    let filename = "";
    let error = "";
    let downloadedFilePath = "";

    downloadProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log("yt-dlp stdout:", output);

      // Parse progress information
      const progressMatch = output.match(/(\d+\.?\d*)%/);
      if (progressMatch) {
        downloadProgress = parseFloat(progressMatch[1]);
      }

      // Extract filename from different possible patterns
      const patterns = [
        /\[download\] Destination: (.+)/,
        /\[download\] (.+) has already been downloaded/,
        /\[ExtractAudio\] Destination: (.+)/,
        /\[Merger\] Merging formats into "(.+)"/,
      ];

      for (const pattern of patterns) {
        const match = output.match(pattern);
        if (match) {
          downloadedFilePath = match[1].trim();
          filename = path.basename(downloadedFilePath);
          break;
        }
      }
    });

    downloadProcess.stderr.on("data", (data) => {
      const output = data.toString();
      console.error("yt-dlp stderr:", output);
      error += output;

      // Check for specific conversion errors and provide helpful messages
      if (
        output.includes("Conversion failed") ||
        output.includes("Postprocessing")
      ) {
        error +=
          "\n\nFormat conversion failed. Please try:\n1. Using MP4 format (most compatible)\n2. Selecting a different video quality\n3. Trying without audio if video-only download works";
      }

      if (output.includes("ffmpeg") || output.includes("avconv")) {
        error +=
          "\n\nFFmpeg processing error. MP4 format is recommended for best compatibility.";
      }
    });

    // Return a streaming response for progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const interval = setInterval(() => {
          const progressData = {
            progress: downloadProgress,
            filename: filename,
            status: "downloading",
            downloadId: downloadId,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`)
          );
        }, 1000);

        downloadProcess.on("close", async (code) => {
          clearInterval(interval);

          if (code === 0) {
            try {
              // Verify file exists and get actual filename
              const tempFiles = await fs.readdir(config.tempDir);
              const downloadedFile = tempFiles.find(
                (file) =>
                  file.startsWith(downloadId) && !file.endsWith(".info.json")
              );

              if (downloadedFile) {
                const actualFilePath = path.join(
                  config.tempDir,
                  downloadedFile
                );
                const stats = await fs.stat(actualFilePath);

                const successData = {
                  progress: 100,
                  filename: downloadedFile,
                  status: "completed",
                  downloadId: downloadId,
                  downloadUrl: `/api/download-file/${downloadId}/${encodeURIComponent(
                    downloadedFile
                  )}`,
                  fileSize: stats.size,
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(successData)}\n\n`)
                );
              } else {
                throw new Error("Downloaded file not found");
              }
            } catch (fileError) {
              console.error("Error processing downloaded file:", fileError);
              const errorData = {
                progress: 0,
                filename: "",
                status: "error",
                error: "File processing failed",
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
              );
            }
          } else {
            const errorData = {
              progress: 0,
              filename: "",
              status: "error",
              error: error || "Download failed",
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
            );
          }
          controller.close();
        });

        downloadProcess.on("error", (err) => {
          clearInterval(interval);
          const errorData = {
            progress: 0,
            filename: "",
            status: "error",
            error: err.message,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error starting download:", error);
    return NextResponse.json(
      { error: "Failed to start download" },
      { status: 500 }
    );
  }
}
