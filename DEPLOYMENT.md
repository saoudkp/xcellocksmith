# Xcel Locksmith — Production Deployment Guide

Contabo Cloud VPS 10 + Coolify + WAHA

---

## Prerequisites

- Contabo VPS 10 provisioned (Ubuntu 22.04 LTS)
- Domain pointed to VPS IP (A record for `xcellocksmith.com` and `*.xcellocksmith.com`)
- SSH access to the VPS
- GitHub repo: `git@github.com:saoudkp/xcellocksmith.git`

---

## Part 1 — Initial VPS Setup

SSH into your server:

```bash
ssh root@YOUR_VPS_IP
```

Update the system:

```bash
apt update && apt upgrade -y
apt install -y curl git ufw
```

Configure firewall:

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw allow 8000   # Coolify dashboard
ufw enable
```

---

## Part 2 — Install Coolify

Run the official one-line installer:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

This installs Docker, Docker Compose, and Coolify automatically. Takes 2-5 minutes.

Once done, access Coolify at:

```
http://YOUR_VPS_IP:8000
```

Complete the setup wizard:
1. Create your admin account (email + password)
2. Select "localhost" as the server (it's already configured)
3. Skip the team setup for now

---

## Part 3 — Connect GitHub Repo to Coolify

1. In Coolify sidebar → **Sources** → **Add** → **GitHub App**
2. Follow the OAuth flow to connect your GitHub account
3. Install the Coolify GitHub App on your `saoudkp/xcellocksmith` repo

---

## Part 4 — Deploy PostgreSQL (Database)

1. Coolify sidebar → **Projects** → **New Project** → name it `xcel-locksmith`
2. Inside the project → **New Resource** → **Database** → **PostgreSQL**
3. Set:
   - Name: `xcel-postgres`
   - Version: `16`
   - Database name: `xcel-cms`
   - Username: `postgres`
   - Password: generate a strong one and save it
4. Click **Deploy**
5. Copy the **internal connection string** — you'll need it for the CMS env vars

---

## Part 5 — Deploy MinIO (Media Storage)

1. Inside the same project → **New Resource** → **Docker Compose** (or Service)
2. Use this compose snippet:

```yaml
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: your_minio_user
      MINIO_ROOT_PASSWORD: your_strong_minio_password
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
volumes:
  minio_data:
```

3. Deploy, then access MinIO console at `http://YOUR_VPS_IP:9001`
4. Log in and create a bucket named `xcel-media`
5. Set the bucket policy to **public read** (for serving images)

---

## Part 6 — Deploy WAHA (WhatsApp)

1. Inside the project → **New Resource** → **Docker Image**
2. Image: `devlikeapro/waha:latest`
3. Set environment variables:
   ```
   WHATSAPP_API_KEY=your_strong_waha_api_key
   WHATSAPP_DEFAULT_ENGINE=NOWEB
   ```
4. Set port mapping: `3001 → 3000`
5. Set volume: `/app/.sessions` → persistent volume named `waha_sessions`
6. Deploy

WAHA dashboard will be at `http://YOUR_VPS_IP:3001`

### Connect WhatsApp to WAHA

1. Open `http://YOUR_VPS_IP:3001` in browser
2. Go to **Sessions** → **Start Session** → name it `default`
3. A QR code appears — scan it with the WhatsApp app on the business phone
4. Session status changes to `WORKING` — done

> The session persists in the Docker volume so it survives restarts.

---

## Part 7 — Deploy Payload CMS

1. Inside the project → **New Resource** → **Application** → **GitHub**
2. Select repo `saoudkp/xcellocksmith`
3. Branch: `main`
4. Build pack: **Dockerfile**
5. Dockerfile location: `apps/cms/Dockerfile`
6. Set environment variables:

```
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@xcel-postgres:5432/xcel-cms
PAYLOAD_SECRET=generate_with_openssl_rand_hex_32
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=your_minio_user
S3_SECRET_KEY=your_strong_minio_password
S3_BUCKET=xcel-media
S3_REGION=us-east-1
NEXT_PUBLIC_SITE_URL=https://xcellocksmith.com
RESEND_API_KEY=re_your_resend_key
WAHA_API_URL=http://waha:3000
WAHA_API_KEY=your_strong_waha_api_key
```

7. Domain: `cms.xcellocksmith.com`
8. Enable **HTTPS** (Coolify handles Let's Encrypt automatically)
9. Enable **Auto Deploy** on push to `main`
10. Click **Deploy**

---

## Part 8 — Deploy React Frontend

1. Inside the project → **New Resource** → **Application** → **GitHub**
2. Select repo `saoudkp/xcellocksmith`
3. Branch: `main`
4. Build pack: **Dockerfile**
5. Dockerfile location: `Dockerfile` (root)
6. Set environment variables:

```
VITE_CMS_URL=https://cms.xcellocksmith.com
```

7. Domain: `xcellocksmith.com`
8. Enable **HTTPS**
9. Enable **Auto Deploy** on push to `main`
10. Click **Deploy**

---

## Part 9 — DNS Setup

In your domain registrar (wherever `xcellocksmith.com` is registered), add:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `YOUR_VPS_IP` |
| A | `www` | `YOUR_VPS_IP` |
| A | `cms` | `YOUR_VPS_IP` |

DNS propagation takes 5-30 minutes.

---

## Part 10 — Verify Everything Works

```
https://xcellocksmith.com          → React frontend
https://cms.xcellocksmith.com      → Payload CMS admin
https://cms.xcellocksmith.com/api  → Payload REST API
http://YOUR_VPS_IP:3001            → WAHA dashboard
http://YOUR_VPS_IP:9001            → MinIO console
```

---

## Auto-Deploy Workflow (ongoing)

Every time you push to `main`:

```
git add .
git commit -m "your changes"
git push
```

Coolify detects the push via GitHub webhook → rebuilds Docker images → deploys automatically. No SSH needed.

---

## Useful Commands (if you ever need to SSH)

Check running containers:
```bash
docker ps
```

View CMS logs:
```bash
docker logs xcel_cms --tail 100 -f
```

Restart a service:
```bash
docker restart xcel_cms
```

Check disk usage:
```bash
df -h
```

---

## Generate a Strong Secret

Run this locally or on the server to generate `PAYLOAD_SECRET`:

```bash
openssl rand -hex 32
```

---

## Backup PostgreSQL manually

```bash
docker exec xcel_postgres pg_dump -U postgres xcel-cms > backup_$(date +%Y%m%d).sql
```

Coolify also has built-in scheduled backups — enable them in the database resource settings.
