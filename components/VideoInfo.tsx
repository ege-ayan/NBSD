import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Calendar, User } from "lucide-react";

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
}

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  view_count: number;
  uploader: string;
  upload_date: string;
  thumbnail: string;
  webpage_url: string;
  formats: VideoFormats;
  available_formats: VideoFormat[];
}

interface VideoInfoProps {
  videoInfo: VideoInfo;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const formatUploadDate = (dateString: string): string => {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return new Date(`${year}-${month}-${day}`).toLocaleDateString();
};

export const VideoInfo: React.FC<VideoInfoProps> = ({ videoInfo }) => {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative w-full lg:w-80 h-48 lg:h-44 rounded-lg overflow-hidden bg-muted">
            <Image
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
              {formatDuration(videoInfo.duration)}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <CardTitle className="text-xl lg:text-2xl font-bold text-foreground mb-2 line-clamp-2">
                {videoInfo.title}
              </CardTitle>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{videoInfo.uploader}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViewCount(videoInfo.view_count)} views</span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatUploadDate(videoInfo.upload_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {videoInfo.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};
