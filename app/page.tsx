"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoInfo } from "@/components/VideoInfo";
import { DownloadSection } from "@/components/DownloadSection";
import { Download, Search, Github, Zap, Shield, Globe } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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

export default function Home() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setVideoInfo(null);

    try {
      const response = await axios.post("/api/video-info", { url });
      setVideoInfo(response.data);
      toast.success("Video information loaded successfully!");
    } catch (error) {
      console.error("Error fetching video info:", error);
      toast.error("Failed to fetch video information", {
        description: "Please check the URL and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Download className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              No Bullshit Downloader
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert YouTube videos to MP4 format with custom quality selection.
            Simple, fast, and reliable.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Powered by yt-dlp for the fastest and most reliable downloads
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your downloads are processed locally. No data stored or tracked.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Multiple Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose from various video qualities and audio-only options
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* URL Input */}
        <Card className="w-full max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Enter YouTube URL
            </CardTitle>
            <CardDescription>
              Paste any YouTube video URL to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading} size="lg">
                {loading ? (
                  <Search className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {loading ? "Loading..." : "Get Info"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Video Information */}
        {videoInfo && (
          <div className="space-y-8">
            <VideoInfo videoInfo={videoInfo} />
            <DownloadSection
              videoUrl={url}
              availableFormats={videoInfo.formats}
              allFormats={videoInfo.available_formats}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-4 mb-4">
            <a
              href="https://github.com/yt-dlp/yt-dlp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              Powered by yt-dlp
            </a>
          </div>
          <p className="text-sm">
            Made with ❤️ for the community. No ads, no tracking, just downloads.
          </p>
        </footer>
      </div>
    </div>
  );
}
