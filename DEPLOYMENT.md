# Deployment Guide — Xcel Locksmith

> **Target:** Netcup VPS 500 G12 (Manassas, VA) managed via Coolify  
> **Stack:** Next.js 15 + Payload CMS 3.x + PostgreSQL + MinIO  
> **Date:** 2026-02-28

---

## Table of Contents

1. [VPS Setup](#1-vps-setup)
2. [Install Coolify](#2-install-coolify)
3. [PostgreSQL Container](#3-postgresql-container)
4. [MinIO Container](#4-minio-container)
5. [Deploy the App](#5-deploy-the-app)
6. [Environment Variables](#6-environment-variables)
7. [Domain & SSL](#7-domain--ssl)
8. [Backup Strategy](#8-backup-strategy)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. VPS Setup

### 1.1 Order & Access

1. Order **Netcup VPS 500 G12** from [netcup.com](https://www.netcup.com)
2. Choose **Ubuntu 24.04 LTS** as the OS
3. Note your server IP and root credentials from the SCP (Server Control Panel)

### 1.2 Initial Server Hardening

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser deploy
usermod -aG sudo deploy

# Set up SSH key authentication
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh

# Disable root login & password auth
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Configure firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw allow 8000  # Coolify dashboard (restrict later)
ufw enable
```

### 1.3 Verify Resources

```bash
# Confirm specs
free -h          # Should show ~4GB RAM
lscpu            # Should show 2 vCPUs
df -h            # Should show ~128GB NVMe
```

---

## 2. Install Coolify

### 2.1 One-Line Install

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 2.2 Access Dashboard

1. Open `http://YOUR_SERVER_IP:8000` in your browser
2. Create your admin account
3. Complete the initial setup wizard

### 2.3 Connect GitHub

1. Go to **Settings → Sources → Add Source**
2. Select **GitHub App**
3. Follow the OAuth flow to authorize Coolify
4. Select the repository: `your-username/xcel-locksmith`

---

## 3. PostgreSQL Container

### 3.1 Create Database

1. In Coolify dashboard: **Resources → New Resource → Database → PostgreSQL**
2. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `xcel-postgres` |
| **Version** | `16` (latest stable) |
| **Database** | `xcel_locksmith` |
| **Username** | `xcel_admin` |
| **Password** | *(auto-generated, save it)* |
| **Port** | `5432` (internal only) |
| **Public Access** | **OFF** |

3. Click **Deploy**

### 3.2 Verify Connection

```bash
# From within the server (Coolify terminal or SSH)
docker exec -it xcel-postgres psql -U xcel_admin -d xcel_locksmith -c "SELECT version();"
```

### 3.3 Note the Internal URL

Coolify assigns an internal hostname. Your `DATABASE_URL` will be:

```
postgresql://xcel_admin:YOUR_PASSWORD@xcel-postgres:5432/xcel_locksmith
```

> **Important:** Use the container name (`xcel-postgres`) as the host — both containers share the same Docker network, so no external exposure needed.

---

## 4. MinIO Container

### 4.1 Create MinIO Service

1. In Coolify: **Resources → New Resource → Service → MinIO**
2. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `xcel-minio` |
| **Root User** | `xcel_minio_admin` |
| **Root Password** | *(strong password, save it)* |
| **API Port** | `9000` (internal) |
| **Console Port** | `9001` (expose for admin access) |
| **Storage** | `/data` mapped to a persistent volume |

3. Click **Deploy**

### 4.2 Create Media Bucket

1. Open MinIO Console at `http://YOUR_SERVER_IP:9001`
2. Login with root credentials
3. Create bucket: **`xcel-media`**
4. Set bucket policy to **Public Read** (so images serve without auth):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::xcel-media/*"]
    }
  ]
}
```

### 4.3 Create Access Keys

1. In MinIO Console → **Access Keys → Create Access Key**
2. Save the **Access Key** and **Secret Key**

### 4.4 Note the Internal URL

```
S3_ENDPOINT=http://xcel-minio:9000
S3_BUCKET=xcel-media
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_REGION=us-east-1
```

---

## 5. Deploy the App

### 5.1 Create Application Resource

1. In Coolify: **Resources → New Resource → Application**
2. Select your GitHub source and repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `xcel-app` |
| **Branch** | `main` |
| **Build Pack** | **Nixpacks** (auto-detects Next.js) |
| **Port** | `3000` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start` |
| **Auto Deploy** | **ON** (push-to-deploy) |

### 5.2 Docker Network

Ensure all three resources (app, PostgreSQL, MinIO) are on the **same Docker network**. Coolify does this by default when resources are in the same project/environment.

### 5.3 Health Check

| Setting | Value |
|---------|-------|
| **Path** | `/api/health` or `/` |
| **Interval** | `30s` |
| **Timeout** | `10s` |

### 5.4 Deploy

1. Click **Deploy** — Coolify pulls from GitHub, builds, and starts
2. Watch the build logs for errors
3. Once green, the app is live on `http://YOUR_SERVER_IP:3000`

---

## 6. Environment Variables

Add these in Coolify under **xcel-app → Environment Variables**:

### Required

```env
# Database (internal Docker network)
DATABASE_URL=postgresql://xcel_admin:YOUR_PASSWORD@xcel-postgres:5432/xcel_locksmith

# Payload CMS
PAYLOAD_SECRET=your_random_64_char_secret_here
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com

# MinIO / S3 Storage (internal Docker network)
S3_ENDPOINT=http://xcel-minio:9000
S3_BUCKET=xcel-media
S3_ACCESS_KEY=your_minio_access_key
S3_SECRET_KEY=your_minio_secret_key
S3_REGION=us-east-1

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=info@yourdomain.com
```

### Optional

```env
# Node
NODE_ENV=production

# Payload Admin
PAYLOAD_PUBLIC_DRAFT_SECRET=your_draft_secret

# Analytics (if self-hosting Plausible/Umami later)
NEXT_PUBLIC_ANALYTICS_URL=
```

### Generate PAYLOAD_SECRET

```bash
openssl rand -hex 32
```

---

## 7. Domain & SSL

### 7.1 DNS Configuration

At your domain registrar (Cloudflare DNS recommended for free):

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| **A** | `@` | `YOUR_SERVER_IP` | DNS only (gray cloud) |
| **A** | `www` | `YOUR_SERVER_IP` | DNS only (gray cloud) |
| **A** | `minio` | `YOUR_SERVER_IP` | DNS only (optional, for MinIO console) |

> **Note:** Keep Cloudflare proxy OFF (gray cloud). Coolify manages SSL directly via Let's Encrypt.

### 7.2 Configure Domain in Coolify

1. Go to **xcel-app → Settings → Domains**
2. Add: `yourdomain.com` and `www.yourdomain.com`
3. Enable **Auto SSL** (Let's Encrypt)
4. Coolify automatically provisions and renews certificates

### 7.3 Restrict MinIO Console (Optional)

If you exposed MinIO console on port 9001, add a domain:
- `minio.yourdomain.com` → port `9001` with SSL

Or restrict to SSH tunnel only:

```bash
# Access MinIO console via SSH tunnel (more secure)
ssh -L 9001:localhost:9001 deploy@YOUR_SERVER_IP
# Then open http://localhost:9001
```

---

## 8. Backup Strategy

### 8.1 PostgreSQL Backups

#### Automated Daily Backups (via cron)

```bash
# SSH into server as deploy user
sudo crontab -e

# Add daily backup at 3 AM EST
0 3 * * * docker exec xcel-postgres pg_dump -U xcel_admin xcel_locksmith | gzip > /home/deploy/backups/db/xcel_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
0 4 * * * find /home/deploy/backups/db/ -mtime +30 -delete
```

#### Create Backup Directory

```bash
mkdir -p /home/deploy/backups/db
mkdir -p /home/deploy/backups/minio
```

### 8.2 MinIO Backups

MinIO data lives in a Docker volume. Back up via:

```bash
# Add to crontab — weekly MinIO snapshot
0 3 * * 0 docker run --rm -v xcel-minio-data:/data -v /home/deploy/backups/minio:/backup alpine tar czf /backup/minio_$(date +\%Y\%m\%d).tar.gz /data

# Keep last 4 weeks
0 4 * * 0 find /home/deploy/backups/minio/ -mtime +28 -delete
```

### 8.3 Netcup Snapshots

1. Log into **Netcup SCP** (Server Control Panel)
2. Navigate to your VPS → **Snapshots**
3. Create a manual snapshot before major changes
4. Netcup CoW snapshots are instant and free

### 8.4 Offsite Backup (Optional)

For critical redundancy, sync backups to a second location:

```bash
# Example: rsync to another server or Backblaze B2
rsync -avz /home/deploy/backups/ user@backup-server:/xcel-backups/
```

---

## 9. Monitoring & Maintenance

### 9.1 Coolify Built-in Monitoring

Coolify provides container-level metrics in the dashboard:
- CPU usage per container
- Memory usage per container
- Network I/O
- Container health status

### 9.2 Application Health

```bash
# Check all containers are running
docker ps

# Check resource usage
docker stats --no-stream

# Expected ~2.5GB used:
#   Next.js + Payload: ~500MB
#   PostgreSQL:        ~500MB
#   MinIO:             ~200MB
#   Coolify:           ~300MB
#   OS + buffers:      ~1GB
```

### 9.3 Log Access

```bash
# App logs
docker logs xcel-app --tail 100 -f

# PostgreSQL logs
docker logs xcel-postgres --tail 50

# MinIO logs
docker logs xcel-minio --tail 50
```

### 9.4 Updates

| Component | Update Method |
|-----------|--------------|
| **App code** | Push to `main` → Coolify auto-deploys |
| **Coolify** | `curl -fsSL https://cdn.coollabs.io/coolify/install.sh \| bash` |
| **PostgreSQL** | Update version in Coolify → redeploy (backup first!) |
| **MinIO** | Update version in Coolify → redeploy |
| **Ubuntu** | `sudo apt update && sudo apt upgrade -y` monthly |

---

## 10. Troubleshooting

### App won't start

```bash
# Check build logs in Coolify dashboard
# Common fixes:
docker logs xcel-app --tail 200

# Verify env vars are set
docker exec xcel-app env | grep DATABASE
```

### Database connection refused

```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Verify network connectivity
docker exec xcel-app ping xcel-postgres

# Test connection
docker exec xcel-app node -e "
  const { Client } = require('pg');
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  c.connect().then(() => { console.log('OK'); c.end(); }).catch(console.error);
"
```

### MinIO upload fails

```bash
# Verify MinIO is running
docker ps | grep minio

# Test connectivity from app container
docker exec xcel-app curl http://xcel-minio:9000/minio/health/live

# Check bucket exists
docker exec xcel-minio mc ls local/xcel-media
```

### SSL not working

1. Ensure DNS A records point to your server IP
2. Ensure Cloudflare proxy is **OFF** (gray cloud)
3. Check Coolify SSL logs: **xcel-app → Settings → SSL**
4. Wait up to 5 minutes for Let's Encrypt provisioning

### Out of memory

```bash
# Check current usage
free -h
docker stats --no-stream

# If tight, add swap (temporary fix)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Quick Reference

| Resource | Internal URL | External URL |
|----------|-------------|-------------|
| **App** | `http://xcel-app:3000` | `https://yourdomain.com` |
| **Payload Admin** | — | `https://yourdomain.com/admin` |
| **PostgreSQL** | `xcel-postgres:5432` | Not exposed |
| **MinIO API** | `http://xcel-minio:9000` | Not exposed |
| **MinIO Console** | `http://xcel-minio:9001` | SSH tunnel or `minio.yourdomain.com` |
| **Coolify** | — | `http://YOUR_SERVER_IP:8000` |

---

## Cost Summary

| Item | Cost |
|------|------|
| Netcup VPS 500 G12 | ~€5.28/mo |
| Resend (email) | Free |
| Cloudflare DNS | Free |
| Domain (~€10/yr) | ~€0.83/mo |
| **Total** | **~€6.11/mo** |
