# No Bullshit Downloader (NBSD)

A simple, fast, and reliable YouTube to MP4 converter built with Next.js. No ads, no tracking, no bullshit - just downloads.

![NBSD Screenshot](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **Lightning Fast**: Powered by yt-dlp for reliable downloads
- **Privacy First**: All processing happens locally, no data stored or tracked
- **Simple Interface**: Just paste URL, select quality, and download
- **Multiple Qualities**: Choose from 240p to 4K (when available)
- **Audio Options**: Download video with audio or video-only
- **MP4 Format**: All downloads in universally compatible MP4 format
- **Dark Mode**: Beautiful dark theme interface
- **Cross-Platform**: Works on macOS, Linux, and Windows

## 🛠️ Technologies Used

### Frontend & Framework

- **[Next.js 15.3.5](https://nextjs.org/)** - React framework with App Router
- **[React 19.0.0](https://reactjs.org/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework

### UI Components & Styling

- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
  - `@radix-ui/react-progress` - Progress bars
  - `@radix-ui/react-select` - Select dropdowns
  - `@radix-ui/react-slot` - Component composition
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[class-variance-authority](https://cva.style/)** - Component variants
- **[clsx](https://github.com/lukeed/clsx)** - Conditional classnames
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Tailwind class merging

### State Management & HTTP

- **[Axios](https://axios-http.com/)** - HTTP client for API requests
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### Backend Dependencies

- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** - YouTube downloader
- **[FFmpeg](https://ffmpeg.org/)** - Video processing

## 📋 Prerequisites

### System Requirements

- **Node.js** 18.17 or later
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **yt-dlp** (YouTube downloader)
- **FFmpeg** (video processing)

---

## 🚀 Installation Guide

### macOS Setup

#### 1. Install Node.js

```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org/
```

#### 2. Install yt-dlp

```bash
# Using Homebrew (recommended)
brew install yt-dlp

# Or using pip
pip install yt-dlp

# Or download binary
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos -o /usr/local/bin/yt-dlp
chmod +x /usr/local/bin/yt-dlp
```

#### 3. Install FFmpeg

```bash
# Using Homebrew (recommended)
brew install ffmpeg

# Or using MacPorts
sudo port install ffmpeg
```

#### 4. Verify Installation

```bash
node --version     # Should show v18.17.0 or later
yt-dlp --version   # Should show yt-dlp version
ffmpeg -version    # Should show FFmpeg version
```

### Linux Setup (Ubuntu/Debian)

#### 1. Install Node.js

```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using snap
sudo snap install node --classic

# Verify installation
node --version
npm --version
```

#### 2. Install yt-dlp

```bash
# Using pip (recommended)
sudo apt update
sudo apt install python3-pip
pip3 install yt-dlp

# Or download binary
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod +x /usr/local/bin/yt-dlp

# Or using package manager (if available)
sudo apt install yt-dlp
```

#### 3. Install FFmpeg

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# CentOS/RHEL/Fedora
sudo dnf install ffmpeg
# or
sudo yum install ffmpeg

# Arch Linux
sudo pacman -S ffmpeg
```

#### 4. Verify Installation

```bash
node --version     # Should show v18.17.0 or later
yt-dlp --version   # Should show yt-dlp version
ffmpeg -version    # Should show FFmpeg version
```

### Linux Setup (CentOS/RHEL/Fedora)

#### 1. Install Node.js

```bash
# Using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install nodejs npm

# Or using snap
sudo dnf install snapd
sudo snap install node --classic
```

#### 2. Install yt-dlp

```bash
# Using pip
sudo dnf install python3-pip
pip3 install yt-dlp

# Or download binary
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod +x /usr/local/bin/yt-dlp
```

#### 3. Install FFmpeg

```bash
# Enable RPM Fusion repository first
sudo dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm

# Install FFmpeg
sudo dnf install ffmpeg
```

---

## 🏗️ Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ege-ayan/NBSD.git
cd NBSD
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

### 3. Environment Configuration

The application automatically detects system paths for yt-dlp and FFmpeg. If you have custom installations, you can modify the paths in `lib/config.ts`.

**Default paths:**

- **macOS**: `/opt/homebrew/bin/yt-dlp`, `/opt/homebrew/bin/ffmpeg`
- **Linux**: `/usr/local/bin/yt-dlp`, `/usr/bin/ffmpeg`

### 4. Start Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev

# Using bun
bun dev
```

### 5. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🎯 Usage

1. **Enter YouTube URL**: Paste any YouTube video URL into the input field
2. **Get Video Info**: Click "Get Info" to fetch video details and available qualities
3. **Select Quality**: Choose your preferred video quality from the dropdown
4. **Audio Option**: Toggle "Include Audio" on/off as needed
5. **Download**: Click "Download" and the file will be saved to your computer

### Supported URLs

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- And other YouTube URL formats

---

## 🔧 Configuration

### Custom Binary Paths

If you installed yt-dlp or FFmpeg in custom locations, edit `lib/config.ts`:

```typescript
export const config: Config = {
  ytDlpPath: "/custom/path/to/yt-dlp",
  ffmpegPath: "/custom/path/to/ffmpeg",
  // ... other config
};
```

### Download Directory

Downloads are processed through a temporary directory and served to users' browsers. The temp directory is automatically cleaned up.

---

## 🚀 Production Deployment

### Build the Application

```bash
npm run build
npm start
```

### Environment Variables

For production, consider setting:

```bash
NODE_ENV=production
PORT=3000
```

### Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Install yt-dlp and ffmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip3 install yt-dlp

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Project Structure

```
NBSD/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # UI components
│   ├── VideoInfo.tsx  # Video information display
│   └── DownloadSection.tsx # Download interface
├── lib/               # Utility functions
│   ├── config.ts      # App configuration
│   ├── utils.ts       # General utilities
│   └── server-utils.ts # Server-side utilities
├── temp_downloads/    # Temporary download directory
└── public/           # Static assets
```

---

## 🐛 Troubleshooting

### Common Issues

#### "yt-dlp not found"

```bash
# Verify yt-dlp installation
which yt-dlp
yt-dlp --version

# Reinstall if needed
pip3 install --upgrade yt-dlp
```

#### "FFmpeg not found"

```bash
# Verify FFmpeg installation
which ffmpeg
ffmpeg -version

# Install/reinstall FFmpeg
# macOS: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

#### "Permission denied" errors

```bash
# Make sure binaries are executable
chmod +x /usr/local/bin/yt-dlp
chmod +x /usr/local/bin/ffmpeg
```

#### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## ⚠️ Disclaimer

This tool is for personal use only. Please respect YouTube's Terms of Service and copyright laws. Only download videos that you have permission to download or that are in the public domain.

---

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The powerful YouTube downloader
- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - The utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - The UI component library

---

**Made with ❤️ for the community. No ads, no tracking, just downloads.**
