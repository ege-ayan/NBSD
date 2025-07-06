import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { config } from "@/lib/config";

const execAsync = promisify(exec);

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  view_count: number;
  uploader: string;
  upload_date: string;
  thumbnail: string;
  formats: VideoFormat[];
  webpage_url: string;
}

export interface VideoFormat {
  format_id: string;
  format_note: string;
  ext: string;
  resolution: string;
  filesize: number | null;
  filesize_approx: number | null;
  vcodec: string;
  acodec: string;
  fps: number | null;
  quality: number | null;
  height: number | null;
  width: number | null;
  tbr: number | null;
  abr: number | null;
  vbr: number | null;
}

function getQualityLabel(format: VideoFormat): string {
  if (format.acodec !== "none" && format.vcodec === "none") {
    // Audio only
    if (format.abr) return `Audio ${format.abr}kbps`;
    return "Audio Only";
  }

  if (format.height) {
    let label = `${format.height}p`;

    // Only add 60fps for high frame rate videos
    if (format.fps && format.fps >= 60) {
      label += " 60fps";
    }

    return label;
  }

  if (format.format_note) {
    return format.format_note;
  }

  return format.format_id;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

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

    // Use yt-dlp to fetch video information with ALL formats
    const command = `"${config.ytDlpPath}" --dump-json --no-download "${url}"`;

    console.log("Executing command:", command);

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error("yt-dlp stderr:", stderr);
    }

    console.log("yt-dlp output length:", stdout.length);

    // Parse the JSON output
    const videoInfo: VideoInfo = JSON.parse(stdout);

    console.log("=== RAW FORMATS FROM YT-DLP ===");
    console.log(
      "Total raw formats count:",
      videoInfo.formats ? videoInfo.formats.length : 0
    );

    // Log first few formats to see what we're getting
    if (videoInfo.formats && videoInfo.formats.length > 0) {
      console.log("First 5 raw formats:");
      videoInfo.formats.slice(0, 5).forEach((format, index) => {
        console.log(`Format ${index + 1}:`, {
          id: format.format_id,
          note: format.format_note,
          ext: format.ext,
          height: format.height,
          width: format.width,
          vcodec: format.vcodec,
          acodec: format.acodec,
          resolution: format.resolution,
          filesize: format.filesize,
        });
      });
    }

    // Filter and process formats - LESS RESTRICTIVE FILTERING
    const processedFormats: VideoFormat[] = videoInfo.formats
      .filter((format) => {
        // Keep formats that have valid extensions and are not just metadata
        const isValid =
          format.ext &&
          format.ext !== "mhtml" &&
          format.ext !== "none" &&
          (format.vcodec !== "none" || format.acodec !== "none");

        if (!isValid) {
          console.log("Filtered out format:", {
            id: format.format_id,
            ext: format.ext,
            vcodec: format.vcodec,
            acodec: format.acodec,
            note: format.format_note,
          });
        }

        return isValid;
      })
      .map((format) => ({
        format_id: format.format_id,
        format_note: getQualityLabel(format),
        ext: format.ext,
        resolution:
          format.resolution || `${format.width || "?"}x${format.height || "?"}`,
        filesize: format.filesize,
        filesize_approx: format.filesize_approx,
        vcodec: format.vcodec,
        acodec: format.acodec,
        fps: format.fps,
        quality: format.quality,
        height: format.height,
        width: format.width,
        tbr: format.tbr,
        abr: format.abr,
        vbr: format.vbr,
      }))
      .sort((a, b) => {
        // Sort by quality (height) descending, then by filesize descending
        if (a.height && b.height) {
          if (a.height !== b.height) return b.height - a.height;
        }

        const aSize = a.filesize || a.filesize_approx || 0;
        const bSize = b.filesize || b.filesize_approx || 0;
        return bSize - aSize;
      });

    console.log("=== PROCESSED FORMATS ===");
    console.log("Processed formats count:", processedFormats.length);

    // Log processed formats by type
    const videoFormats = processedFormats.filter(
      (f) => f.vcodec !== "none" && f.acodec !== "none"
    );
    const videoOnlyFormats = processedFormats.filter(
      (f) => f.vcodec !== "none" && f.acodec === "none"
    );
    const audioOnlyFormats = processedFormats.filter(
      (f) => f.vcodec === "none" && f.acodec !== "none"
    );

    console.log("Video formats (combined):", videoFormats.length);
    console.log("Video-only formats:", videoOnlyFormats.length);
    console.log("Audio-only formats:", audioOnlyFormats.length);

    // Log all video formats to see what qualities we have
    console.log(
      "All video formats:",
      videoFormats.map((f) => ({
        id: f.format_id,
        note: f.format_note,
        height: f.height,
        ext: f.ext,
      }))
    );

    // For YouTube, show the BEST format for each resolution to avoid confusion
    // Filter to get one optimal format per resolution
    const candidateFormats = [
      ...videoFormats, // Combined formats (rare, usually just 360p)
      ...videoOnlyFormats.filter(
        (f) => f.ext === "mp4" && f.height && f.height >= 144
      ), // Video-only MP4 formats
    ];

    // Group by resolution and pick the best format for each
    const formatsByHeight = new Map<number, VideoFormat[]>();

    candidateFormats.forEach((format) => {
      if (format.height) {
        if (!formatsByHeight.has(format.height)) {
          formatsByHeight.set(format.height, []);
        }
        formatsByHeight.get(format.height)!.push(format);
      }
    });

    // For each resolution, pick the best format based on:
    // 1. Has audio (combined formats preferred)
    // 2. H.264 codec (most compatible)
    // 3. Highest bitrate/filesize
    const allVideoFormats: VideoFormat[] = [];

    formatsByHeight.forEach((formats) => {
      const sortedFormats = formats.sort((a, b) => {
        // Prefer combined formats (with audio)
        const aHasAudio = a.acodec !== "none";
        const bHasAudio = b.acodec !== "none";
        if (aHasAudio !== bHasAudio) return aHasAudio ? -1 : 1;

        // Prefer H.264 over VP9/AV1 for compatibility
        const aIsH264 =
          a.vcodec?.includes("avc") ||
          a.format_id === "22" ||
          a.format_id === "18";
        const bIsH264 =
          b.vcodec?.includes("avc") ||
          b.format_id === "22" ||
          b.format_id === "18";
        if (aIsH264 !== bIsH264) return aIsH264 ? -1 : 1;

        // Prefer higher bitrate/filesize
        const aSize = a.filesize || a.filesize_approx || a.tbr || 0;
        const bSize = b.filesize || b.filesize_approx || b.tbr || 0;
        return bSize - aSize;
      });

      allVideoFormats.push(sortedFormats[0]);
    });

    // Sort by resolution descending
    allVideoFormats.sort((a, b) => {
      if (a.height && b.height) {
        return b.height - a.height;
      }
      return 0;
    });

    const organizedFormats = {
      combined: videoFormats,
      video_only: videoOnlyFormats,
      audio_only: audioOnlyFormats,
      all_video: allVideoFormats, // All downloadable video formats
    };

    console.log("YouTube format structure:", {
      combined: organizedFormats.combined.length,
      video_only: organizedFormats.video_only.length,
      audio_only: organizedFormats.audio_only.length,
      all_video: organizedFormats.all_video.length,
      candidate_formats: candidateFormats.length,
      filtered_best_formats: allVideoFormats.length,
    });

    console.log("=== BEST FORMATS SELECTED ===");
    console.log(
      "Selected formats (1 per resolution):",
      allVideoFormats.map((f) => ({
        id: f.format_id,
        quality: f.format_note,
        height: f.height,
        hasAudio: f.acodec !== "none",
        ext: f.ext,
        codec: f.vcodec,
        bitrate: f.tbr,
        filesize: f.filesize || f.filesize_approx,
      }))
    );

    // Log what was filtered for transparency
    console.log("=== FILTERING SUMMARY ===");
    formatsByHeight.forEach((formats, height) => {
      if (formats.length > 1) {
        console.log(
          `${height}p had ${formats.length} options:`,
          formats.map((f) => ({
            id: f.format_id,
            codec: f.vcodec,
            hasAudio: f.acodec !== "none",
            bitrate: f.tbr,
            size: f.filesize || f.filesize_approx,
          }))
        );
      }
    });

    const response = {
      id: videoInfo.id,
      title: videoInfo.title,
      description: videoInfo.description?.substring(0, 300) + "..." || "",
      duration: videoInfo.duration,
      view_count: videoInfo.view_count,
      uploader: videoInfo.uploader,
      upload_date: videoInfo.upload_date,
      thumbnail: videoInfo.thumbnail,
      webpage_url: videoInfo.webpage_url,
      formats: organizedFormats,
      available_formats: processedFormats, // All formats for dropdown
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching video info:", error);
    return NextResponse.json(
      { error: "Failed to fetch video information" },
      { status: 500 }
    );
  }
}
