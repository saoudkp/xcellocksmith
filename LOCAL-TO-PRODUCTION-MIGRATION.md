# Migrate Local CMS to Production (Exact Copy)

This guide copies everything from your local computer to your Contabo VPS
so production looks exactly like your localhost.

We will copy two things:
1. The database (all your settings, services, reviews, team members, etc.)
2. The media files (all your images)

---

## Before You Start — What You Need

- Your local computer with the project running
- Your VPS IP address (replace `YOUR_VPS_IP` everywhere below)
- SSH access to your VPS (you should be able to run `ssh root@YOUR_VPS_IP`)
- Your production Postgres password (the one you set in Coolify)

---

## PART 1: Export the Database from Your Local Computer

Open a terminal (Command Prompt, PowerShell, or Git Bash) on your LOCAL computer.

### Step 1.1 — Check Postgres is running locally

```bash
pg_isready
```

You should see something like: `localhost:5432 - accepting connections`

If you get an error, make sure your local PostgreSQL is running.

### Step 1.2 — Export the database

```bash
pg_dump -U postgres -d xcel-cms -F c -f xcel-local-backup.dump
```

It will ask for a password. Type: `admin` (your local DB password) and press Enter.

> Note: You won't see the password as you type — that's normal, just type it and press Enter.

This creates a file called `xcel-local-backup.dump` in your current folder.

### Step 1.3 — Verify the file was created

```bash
ls -la xcel-local-backup.dump
```

You should see the file with a size greater than 0. If the file is missing or 0 bytes, something went wrong in Step 1.2.

---

## PART 2: Export the Media Files from Your Local Computer

Your local CMS stores uploaded images on disk (not in S3). We need to grab those files.

### Step 2.1 — Find your local media folder

The media files are stored by Payload in the `media` folder inside the CMS app:

```
xcel-locksmith-hub-main/apps/cms/media/
```

### Step 2.2 — Create a zip of the media folder

On Windows (PowerShell):
```powershell
Compress-Archive -Path "xcel-locksmith-hub-main\apps\cms\media\*" -DestinationPath media-backup.zip
```

On Mac/Linux:
```bash
cd xcel-locksmith-hub-main/apps/cms
zip -r ../../../media-backup.zip media/
cd ../../..
```

You should now have `media-backup.zip` in your project root.

---

## PART 3: Upload Files to Your VPS

### Step 3.1 — Upload the database dump

```bash
scp xcel-local-backup.dump root@YOUR_VPS_IP:/tmp/
```

It will ask for your VPS root password. Type it and press Enter.

### Step 3.2 — Upload the media zip

```bash
scp media-backup.zip root@YOUR_VPS_IP:/tmp/
```

> If `scp` doesn't work on Windows, you can use WinSCP (free app) to drag and drop
> the files to `/tmp/` on your server. Download it at: https://winscp.net

---

## PART 4: Restore the Database on Production

Now SSH into your VPS:

```bash
ssh root@YOUR_VPS_IP
```

### Step 4.1 — Find your Postgres container name

```bash
docker ps | grep postgres
```

Look for the container name. It's probably `xcel_postgres` or something Coolify generated.
Write it down — you'll use it in the next steps. We'll use `xcel_postgres` below;
replace it with your actual container name if different.

### Step 4.2 — Copy the dump file into the Postgres container

```bash
docker cp /tmp/xcel-local-backup.dump xcel_postgres:/tmp/
```

### Step 4.3 — Stop the CMS so it doesn't interfere

```bash
docker stop xcel_cms
```

### Step 4.4 — Drop the existing production database and recreate it

```bash
docker exec -it xcel_postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"xcel-cms\";"
docker exec -it xcel_postgres psql -U postgres -c "CREATE DATABASE \"xcel-cms\";"
```

### Step 4.5 — Restore your local database into production

```bash
docker exec -it xcel_postgres pg_restore -U postgres -d xcel-cms --no-owner --no-privileges /tmp/xcel-local-backup.dump
```

You might see some warnings — that's OK. As long as you don't see "FATAL" errors, it worked.

### Step 4.6 — Verify the data is there

```bash
docker exec -it xcel_postgres psql -U postgres -d xcel-cms -c "SELECT COUNT(*) FROM services;"
```

You should see a number matching how many services you have locally.

---

## PART 5: Upload Media Files to MinIO (Production Storage)

Production uses MinIO (S3-compatible storage) for images, not the local disk.
We need to upload your local media files into the MinIO bucket.

### Step 5.1 — Install the MinIO client on your VPS

```bash
curl -O https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
mv mc /usr/local/bin/
```

### Step 5.2 — Configure the MinIO client

Replace `YOUR_MINIO_PASSWORD` with the S3_SECRET_KEY you set in Coolify:

```bash
mc alias set local http://localhost:9000 minioadmin YOUR_MINIO_PASSWORD
```

> If you changed the MinIO username from `minioadmin`, replace that too.

### Step 5.3 — Make sure the bucket exists

```bash
mc mb local/xcel-media --ignore-existing
```

### Step 5.4 — Set the bucket to public read (so images load on the website)

```bash
mc anonymous set download local/xcel-media
```

### Step 5.5 — Unzip and upload the media files

```bash
cd /tmp
apt install -y unzip
unzip media-backup.zip -d media-upload

# Upload all files to MinIO
mc cp --recursive /tmp/media-upload/media/ local/xcel-media/media/
```

### Step 5.6 — Verify files are in MinIO

```bash
mc ls local/xcel-media/media/ | head -20
```

You should see your image files listed.

---

## PART 6: Start the CMS and Verify

### Step 6.1 — Start the CMS back up

```bash
docker start xcel_cms
```

### Step 6.2 — Wait 10 seconds, then check the logs

```bash
sleep 10
docker logs xcel_cms --tail 30
```

You should see `Ready in XXXms` without any database errors.

### Step 6.3 — Open the CMS in your browser

Go to: `https://cms.xcellocksmith.com/admin`

Log in with the same email and password you use locally.

### Step 6.4 — Check that everything is there

- [ ] Services are listed
- [ ] Team members are listed
- [ ] Reviews are listed
- [ ] Gallery items show images
- [ ] Site settings are correct
- [ ] Hero settings are correct

---

## Troubleshooting

### "password authentication failed"
The production Postgres password doesn't match. Run:
```bash
docker exec -it xcel_postgres psql -U postgres -c "ALTER USER postgres PASSWORD 'YOUR_PASSWORD';"
```
Replace `YOUR_PASSWORD` with the password in your CMS's DATABASE_URL env var.

### "relation does not exist"
The restore didn't work. Re-run Steps 4.4 and 4.5.

### Images are broken / not loading
The media files aren't in MinIO or the bucket isn't public. Re-run Part 5.
Also check that your CMS has `S3_ENDPOINT=http://minio:9000` in its env vars.

### "cannot connect to Postgres" (ECONNREFUSED)
The DATABASE_URL hostname is wrong. It should point to the Postgres container name,
not `localhost`. Check with:
```bash
docker exec xcel_cms printenv DATABASE_URL
```
The hostname part should be the Postgres container name (e.g., `xcel_postgres`), not `localhost` or `127.0.0.1`.

### CMS starts but shows "Create first user" screen
The database restore didn't include the users table, or it was overwritten.
Log in and create a new admin user — your other data should still be there.

---

## Quick Reference — All Commands in Order

```bash
# === ON YOUR LOCAL COMPUTER ===
pg_dump -U postgres -d xcel-cms -F c -f xcel-local-backup.dump
# (zip media folder — see Part 2)
scp xcel-local-backup.dump root@YOUR_VPS_IP:/tmp/
scp media-backup.zip root@YOUR_VPS_IP:/tmp/

# === ON YOUR VPS (ssh root@YOUR_VPS_IP) ===
docker cp /tmp/xcel-local-backup.dump xcel_postgres:/tmp/
docker stop xcel_cms
docker exec -it xcel_postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"xcel-cms\";"
docker exec -it xcel_postgres psql -U postgres -c "CREATE DATABASE \"xcel-cms\";"
docker exec -it xcel_postgres pg_restore -U postgres -d xcel-cms --no-owner --no-privileges /tmp/xcel-local-backup.dump
curl -O https://dl.min.io/client/mc/release/linux-amd64/mc && chmod +x mc && mv mc /usr/local/bin/
mc alias set local http://localhost:9000 minioadmin YOUR_MINIO_PASSWORD
mc mb local/xcel-media --ignore-existing
mc anonymous set download local/xcel-media
cd /tmp && apt install -y unzip && unzip media-backup.zip -d media-upload
mc cp --recursive /tmp/media-upload/media/ local/xcel-media/media/
docker start xcel_cms
docker logs xcel_cms --tail 30
```
