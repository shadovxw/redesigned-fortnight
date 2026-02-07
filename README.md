# ECHO Meeting Assistant 🎙️

A professional, Notion-style meeting assistant that provides real-time transcription, AI-powered formatting, and persistent storage. Built with a microservices architecture and designed for self-hosting.

![Echo Dashboard](https://github.com/shadovxw/redesigned-fortnight/blob/main/media/dashboard.png?raw=true)

## 🌟 Key Features

### 1. Real-Time Transcription
- **Live Streaming:** Uses **WebSockets** to stream audio chunks to the backend.
- **Groq API (Whisper):** processed by Groq's ultra-fast inference engine for near-instant text generation.
- **Visual Feedback:** Shows real-time waveform visualization during recording.

### 2. AI-Powered Formatting
- **Gemini 1.5 Flash:** Cleans up raw transcripts into professional meeting notes with a single click.
- **Task Extraction:** Automatically identifies and lists action items from the conversation.
- **Tiptap Editor:** A rich-text editor with a "Notion-like" bubble menu for quick AI actions.

### 3. Hybrid Storage Architecture
- **Local Database:** SQLite database (`echo.db`) stored on the server's local disk for maximum reliability and performance (avoids `SQLITE_BUSY` errors).
- **NAS Integration:** Large audio recordings are automatically saved to your mounted Network Attached Storage (NAS) via CIFS/SMB.

### 4. Secure Authentication
- **JWT Auth:** Secure, stateless authentication using JSON Web Tokens.
- **Middleware:** Go middleware protects API routes; Next.js hooks protect frontend pages.

### 5. Microservices Ready
- **Dockerized:** Frontend and Backend are containerized with optimized multi-stage builds.
- **Nginx Gateway:** Designed to sit behind a host Nginx reverse proxy, allowing multiple apps (like your portfolio) to coexist on the same server.

---

## 🛠️ Tech Stack

### Backend (Go / Golang)
- **Framework:** Gin (High-performance HTTP web framework)
- **Database:** `modernc.org/sqlite` (CGO-free SQLite driver)
- **Audio Processing:** `ffmpeg` (Audio merging and format conversion)
- **AI Integration:** Google Gemini SDK, Groq API (via REST)

### Frontend (Next.js)
- **Framework:** Next.js 14 (React) with TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **Editor:** Tiptap (Headless wrapper for ProseMirror)
- **State Management:** React Hooks + Context API

### DevOps & CI/CD
- **Docker:** Multi-stage Dockerfiles for optimized image size.
- **Docker Compose:** Orchestrates the Frontend, Backend, and Networking.
- **GitHub Actions:** Auto-deploys changes to the server via SSH on every push to `main`.

---

## 🚀 CI/CD Pipeline

This project uses **GitHub Actions** for continuous deployment.

**Workflow File:** `.github/workflows/deploy.yml`

### How it Works:
1. **Push to Main:** Triggers the workflow.
2. **Build & Push:** GitHub Actions builds Docker images and pushes them to **Docker Hub**.
3. **Deploy:** Connects to your server via SSH and runs:
   ```bash
   cd /srv/echo
   docker-compose pull # Pulls new images from Docker Hub
   docker-compose up -d # Restarts with new code
   ```

*To enable this, configure these Repository Secrets in GitHub:*
- `DOCKER_USERNAME` / `DOCKER_PASSWORD`
- `SERVER_HOST` / `SERVER_USER` / `SERVER_SSH_KEY`

---

## 📦 Deployment Guide

### Prerequisites
- Linux Server (Ubuntu/Debian) with Docker & Docker Compose
- `cifs-utils` (for NAS mounting)

### 1. Server Setup
```bash
# Install NAS helper
sudo apt update && sudo apt install cifs-utils -y

# Create NAS mount point
sudo mkdir -p /mnt/nas
sudo mount -t cifs -o username=user,password=pass,vers=3.0 //NAS_IP/share /mnt/nas
```

### 2. Run the App
```bash
git clone https://github.com/shadovxw/redesigned-fortnight.git echo
cd echo
cp .env.example .env # Fill in keys!
sudo docker-compose up -d --build
```

### 3. Nginx Gateway
Since you host other apps (like Portfolio), use Nginx on the host to route traffic:
- **Echo:** Port 8000 (Internal) -> `echo.shadovxw.me`
- **Portfolio:** Port 3000 -> `portfolio.shadovxw.me`

*(See [`PROXY_SETUP.md`](PROXY_SETUP.md) for the exact Nginx config file).*

---

## 🔧 Troubleshooting

### "ContainerConfig" / "Recreate" Errors?
If `docker-compose up` fails with `KeyError: 'ContainerConfig'`, your Docker state is corrupted. Run:
```bash
sudo docker rm -f echo-backend echo-frontend
sudo docker rmi echo_echo-backend echo_echo-frontend
sudo docker-compose up -d --build --force-recreate
```

### Database Locked?
We use split storage to fix this. Ensure your `docker-compose.yml` mounts a **local** volume for `/app/data` (DB) and the **NAS** for `/app/storage` (Audio).
