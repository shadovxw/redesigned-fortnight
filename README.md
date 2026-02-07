# ECHO Meeting Assistant 🎙️

A Notion-style meeting assistant with real-time transcription, AI formatting, and persistent storage.

## Features
- **Real-time Transcription:** Live streaming audio transcription using Groq (Whisper).
- **AI Formatting:** Clean up transcripts and extract tasks using Gemini 1.5 Flash.
- **Smart Editor:** Tiptap-based editor with Notion-like bubble menus.
- **Persistent Storage:** Saves meetings and audio to SQLite + NAS/Local storage.
- **Authentication:** Secure JWT login system.
- **Microservices Ready:** Dockerized for easy deployment behind an Nginx gateway.

## Deployment Guide

### Prerequisites
- Linux Server (Ubuntu/Debian)
- Docker & Docker Compose
- `cifs-utils` (for NAS mounting)

### 1. Setup
```bash
# Clone the repo
git clone https://github.com/shadovxw/redesigned-fortnight.git echo
cd echo

# Install dependencies (on host)
sudo apt update && sudo apt install cifs-utils -y

# Mount NAS (Optional but recommended)
sudo mkdir -p /mnt/nas
sudo mount -t cifs -o username=user,password=pass,vers=3.0 //NAS_IP/share /mnt/nas

# Configure Environment
cp .env.example .env
nano .env # Add your API keys!
```

### 2. Run with Docker
```bash
sudo docker-compose up -d --build
```
- **Frontend:** `http://localhost:8000`
- **Backend:** Internal (only accessible via Docker network)

### 3. Nginx Gateway (Multi-Domain Setup)
See [`PROXY_SETUP.md`](PROXY_SETUP.md) for details on setting up a reverse proxy to host Echo alongside other apps (like your portfolio) on port 80/443.

## Troubleshooting

### "ContainerConfig" Error
If you see `KeyError: 'ContainerConfig'` during deployment, your Docker state is corrupted. Fix it by cleaning up:

```bash
# 1. Force remove old containers
sudo docker rm -f echo-backend echo-frontend

# 2. Remove images
sudo docker rmi echo_echo-backend echo_echo-frontend

# 3. Deploy again
sudo docker-compose up -d --build --force-recreate
```

### "Port already in use"
Ensure port `8000` is free, or change it in `docker-compose.yml`.
