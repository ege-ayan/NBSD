import { platform } from "os";
import { join } from "path";

export interface Config {
  ytDlpPath: string;
  ffmpegPath: string;
  downloadDir: string;
  tempDir: string;
  maxConcurrentDownloads: number;
  tempFileLifetime: number; // in milliseconds
}

const isWindows = platform() === "win32";
const isMacOS = platform() === "darwin";

// Default configuration
export const config: Config = {
  ytDlpPath: getYtDlpPath(),
  ffmpegPath: getFfmpegPath(),
  downloadDir: getDownloadDir(),
  tempDir: getTempDir(),
  maxConcurrentDownloads: 3,
  tempFileLifetime: 30 * 60 * 1000, // 30 minutes
};

function getYtDlpPath(): string {
  if (isWindows) {
    return "yt-dlp.exe";
  } else if (isMacOS) {
    // Try common installation paths for macOS
    return "/opt/homebrew/bin/yt-dlp";
  } else {
    // Linux/Ubuntu
    return "/usr/local/bin/yt-dlp";
  }
}

function getFfmpegPath(): string {
  if (isWindows) {
    return "ffmpeg.exe";
  } else if (isMacOS) {
    // Try common installation paths for macOS
    return "/opt/homebrew/bin/ffmpeg";
  } else {
    // Linux/Ubuntu
    return "/usr/bin/ffmpeg";
  }
}

function getDownloadDir(): string {
  if (isWindows) {
    return process.env.USERPROFILE
      ? `${process.env.USERPROFILE}\\Downloads`
      : "C:\\Downloads";
  } else {
    return process.env.HOME
      ? `${process.env.HOME}/Downloads`
      : "/tmp/downloads";
  }
}

function getTempDir(): string {
  // Use a temp directory within the project for easier cleanup and security
  if (process.env.NODE_ENV === "production") {
    return join(process.cwd(), "temp_downloads");
  } else {
    return join(process.cwd(), "temp_downloads");
  }
}

// Utility function to format file sizes
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Utility function to generate unique download IDs
export function generateDownloadId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Audio format options for extraction
export const audioFormats = [
  {
    value: "mp3",
    label: "MP3",
    description: "Most compatible",
    badge: "Universal",
  },
  { value: "m4a", label: "M4A", description: "High quality", badge: "Premium" },
  {
    value: "wav",
    label: "WAV",
    description: "Uncompressed",
    badge: "No Compression",
  },
  { value: "flac", label: "FLAC", description: "Lossless", badge: "No Loss" },
  {
    value: "opus",
    label: "Opus",
    description: "Modern codec",
    badge: "Small Size",
  },
];
