import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import {
  Download,
  Music,
  Video,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { audioFormats, formatFileSize } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface VideoFormat {
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

interface VideoFormats {
  combined: VideoFormat[];
  video_only: VideoFormat[];
  audio_only: VideoFormat[];
  all_video?: VideoFormat[]; // All video formats (combined + video-only)
}

interface DownloadSectionProps {
  videoUrl: string;
  availableFormats: VideoFormats;
  allFormats: VideoFormat[]; // All available formats
}

interface DownloadProgress {
  progress: number;
  filename: string;
  status: "idle" | "downloading" | "completed" | "error";
  error?: string;
  downloadUrl?: string;
  downloadId?: string;
  fileSize?: number;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  videoUrl,
  availableFormats,
  allFormats,
}) => {
  const [selectedFormat, setSelectedFormat] = useState("");
  const [audioOnly, setAudioOnly] = useState(false);
  const [selectedAudioFormat, setSelectedAudioFormat] = useState("mp3");
  const [includeAudio, setIncludeAudio] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    progress: 0,
    filename: "",
    status: "idle",
  });

  // Helper function to clean filename for display (remove download ID prefix)
  const getCleanFilename = (filename: string) => {
    // Remove the download ID prefix (format: downloadId_filename)
    const underscoreIndex = filename.indexOf("_");
    if (underscoreIndex !== -1) {
      return filename.substring(underscoreIndex + 1);
    }
    return filename;
  };

  const handleDownload = async () => {
    if (!selectedFormat && !audioOnly) {
      toast.error("Please select a video format");
      return;
    }

    try {
      setDownloadProgress({ progress: 0, filename: "", status: "downloading" });

      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl,
          format: audioOnly ? selectedAudioFormat : selectedFormat,
          audioOnly: audioOnly,
          includeAudio: includeAudio,
        }),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setDownloadProgress(data);

              if (data.status === "completed" && data.downloadUrl) {
                // Automatically trigger download
                const link = document.createElement("a");
                link.href = data.downloadUrl;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success("Download completed successfully!", {
                  description: `${getCleanFilename(
                    data.filename
                  )} has been downloaded to your computer.`,
                });
              } else if (data.status === "error") {
                toast.error("Download failed", {
                  description: data.error || "An unknown error occurred.",
                });
              }
            } catch (error) {
              console.error("Error parsing download progress:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      setDownloadProgress({
        progress: 0,
        filename: "",
        status: "error",
        error: "Download failed",
      });
      toast.error("Download failed", {
        description: "Please try again later.",
      });
    }
  };

  const getStatusIcon = () => {
    switch (downloadProgress.status) {
      case "downloading":
        return <Clock className="w-4 h-4 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (downloadProgress.status) {
      case "downloading":
        return "Processing...";
      case "completed":
        return "Downloaded to your computer!";
      case "error":
        return "Download failed";
      default:
        return "";
    }
  };

  // Use all video formats provided by API (includes both combined and video-only)
  // This is needed because YouTube provides mostly video-only formats for higher qualities
  const allVideoFormats = availableFormats.all_video || [];

  // Get all audio-only formats
  const allAudioFormats = allFormats.filter(
    (f) => f.vcodec === "none" && f.acodec !== "none"
  );

  const currentFormats = audioOnly ? allAudioFormats : allVideoFormats;
  const hasFormats = currentFormats && currentFormats.length > 0;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {audioOnly ? (
            <Music className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
          Download Options
        </CardTitle>
        <CardDescription>
          Choose your preferred format and quality for downloading
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Format Type Selection */}
        <div className="flex gap-2">
          <Button
            variant={!audioOnly ? "default" : "outline"}
            onClick={() => {
              setAudioOnly(false);
              setSelectedFormat("");
              setIncludeAudio(true);
            }}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
          <Button
            variant={audioOnly ? "default" : "outline"}
            onClick={() => {
              setAudioOnly(true);
              setSelectedFormat("");
            }}
            className="flex-1"
          >
            <Music className="w-4 h-4 mr-2" />
            Audio Only
          </Button>
        </div>

        {/* Format Selection */}
        {audioOnly ? (
          // Audio format selection
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Audio Format
            </label>
            <Select
              value={selectedAudioFormat}
              onValueChange={setSelectedAudioFormat}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audio format" />
              </SelectTrigger>
              <SelectContent>
                {audioFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{format.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {format.badge}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          // Video format selection - NOW SHOWING ALL AVAILABLE FORMATS
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Video Quality
              </label>
              {hasFormats ? (
                <Select
                  value={selectedFormat}
                  onValueChange={setSelectedFormat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select video quality" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {currentFormats.map((format) => (
                      <SelectItem
                        key={format.format_id}
                        value={format.format_id}
                      >
                        <span className="font-medium">
                          {format.format_note}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                  No formats available. Please try fetching video information
                  again.
                </div>
              )}
            </div>

            {/* Audio Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Download Options
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-audio"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                  className="h-4 w-4 rounded border-2 border-border bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <label
                  htmlFor="include-audio"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Include Audio
                </label>
                <Badge variant="outline" className="text-xs">
                  {includeAudio ? "MP4 with Audio" : "MP4 Video Only"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                All downloads use MP4 format for maximum compatibility
              </p>
            </div>
          </div>
        )}

        {/* Download Progress */}
        {downloadProgress.status !== "idle" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>

            {downloadProgress.status === "downloading" && (
              <div className="space-y-2">
                <Progress
                  value={downloadProgress.progress}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {downloadProgress.progress.toFixed(1)}% completed
                  {downloadProgress.filename &&
                    ` - ${getCleanFilename(downloadProgress.filename)}`}
                </p>
              </div>
            )}

            {downloadProgress.status === "completed" &&
              downloadProgress.downloadUrl && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        File downloaded:{" "}
                        {getCleanFilename(downloadProgress.filename)}
                      </p>
                      {downloadProgress.fileSize && (
                        <p className="text-xs text-green-600 dark:text-green-300">
                          Size: {formatFileSize(downloadProgress.fileSize)}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              )}

            {downloadProgress.status === "error" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {downloadProgress.error ||
                    "An error occurred during download"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={
            downloadProgress.status === "downloading" ||
            (!selectedFormat && !audioOnly)
          }
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {downloadProgress.status === "downloading"
            ? "Processing..."
            : "Download"}
        </Button>
      </CardContent>
    </Card>
  );
};
