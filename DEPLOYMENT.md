# 🚀 Still Autos — Deployment Guide

Complete instructions for deploying to multiple platforms.

---

## Prerequisites

Before deploying, ensure:
1. `npm install` works locally
2. `npm start` runs without errors
3. Admin credentials are changed in `backend/data/settings.json`
4. All test vehicles updated with your real inventory

---

## Option 1: Railway (Recommended — Free Tier Available)

Railway is the easiest deployment option with automatic SSL.

### Steps

1. **Create GitHub Repository**
```bash
git init
git add .
git commit -m "Initial commit — Still Autos platform"
git remote add origin https://github.com/YOUR_USERNAME/still-autos.git
git push -u origin main
```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `still-autos` repository
   - Railway auto-detects Node.js

3. **Set Environment Variables** (Railway Dashboard → Variables)
```
PORT=3000
NODE_ENV=production
```

4. **Add Start Command**
   Railway reads `package.json` `scripts.start` automatically → `node backend/server.js`

5. **Get your URL**
   Railway assigns: `https://still-autos-production.up.railway.app`

6. **Set Custom Domain** (Optional)
   Railway Dashboard → Settings → Custom Domain
   → Add: `stillautos.ng`
   → Point your domain's CNAME to Railway

---

## Option 2: Render (Free Tier)

1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub repo
3. **Settings:**
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
   - Environment: Node
4. Add Environment Variable: `PORT=10000`
5. Deploy → Get URL

**Persistent Storage (Important for Render):**
Render's free tier has ephemeral storage. Use Render Disk:
- Dashboard → Your Service → Disks → Add Disk
- Mount Path: `/data`
- Update `backend/data/` paths to `/data/vehicles.json` etc.

---

## Option 3: VPS / DigitalOcean Droplet

For full control and production-grade deployment.

### 1. Create Droplet
- Ubuntu 22.04 LTS
- 2GB RAM minimum recommended
- Lagos or London region (lowest latency)

### 2. Initial Server Setup
```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Update packages
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

### 3. Deploy Application
```bash
# Create app directory
mkdir -p /var/www/still-autos
cd /var/www/still-autos

# Upload files (from your local machine)
# Using scp:
scp -r ./still-autos/* root@YOUR_SERVER_IP:/var/www/still-autos/

# Or using git:
git clone https://github.com/YOUR_USERNAME/still-autos.git .

# Install dependencies
npm install --production

# Start with PM2
pm2 start backend/server.js --name "still-autos"
pm2 save
pm2 startup  # Auto-restart on reboot
```

### 4. Configure Nginx
```bash
nano /etc/nginx/sites-available/stillautos.ng
```

```nginx
server {
    listen 80;
    server_name stillautos.ng www.stillautos.ng;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/stillautos.ng /etc/nginx/sites-enabled/
nginx -t  # Test config
systemctl restart nginx
```

### 5. SSL Certificate
```bash
certbot --nginx -d stillautos.ng -d www.stillautos.ng
# Follow prompts — auto-renews every 90 days
```

### 6. Firewall
```bash
ufw allow 22   # SSH
ufw allow 80   # HTTP
ufw allow 443  # HTTPS
ufw enable
```

### 7. Database Backups
```bash
# Create backup script
nano /root/backup-stillautos.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/root/backups/stillautos"
mkdir -p $BACKUP_DIR
cp -r /var/www/still-autos/backend/data $BACKUP_DIR/data-$DATE
# Keep last 30 days
find $BACKUP_DIR -mtime +30 -delete
echo "Backup complete: $DATE"
```

```bash
chmod +x /root/backup-stillautos.sh
# Run daily at 3am
crontab -e
# Add: 0 3 * * * /root/backup-stillautos.sh
```

---

## Option 4: Hostinger VPS (Budget-friendly for Nigeria)

1. Order VPS plan on [hostinger.com](https://hostinger.com)
2. Follow VPS setup above
3. Use Hostinger's domain for `stillautos.ng`

---

## GitHub Workflow

### Branching Strategy
```
main          ← Production (auto-deploys)
develop       ← Development integration
feature/*     ← Individual features
hotfix/*      ← Emergency fixes
```

### Deploy on Push to Main
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/still-autos
            git pull origin main
            npm install --production
            pm2 restart still-autos
            echo "Deployed successfully!"
```

Add secrets in GitHub: Settings → Secrets → `SERVER_IP`, `SSH_PRIVATE_KEY`

---

## Environment Variables

For production, use environment variables instead of hardcoded values:

Create `.env`:
```env
PORT=3000
NODE_ENV=production
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
ADMIN_TOKEN_SECRET=your-64-char-random-string
WHATSAPP_NUMBER=2348012345678
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Install dotenv:
```bash
npm install dotenv
```

Add to `backend/server.js` top:
```javascript
require('dotenv').config();
```

---

## Domain Setup for `.ng`

1. Register `stillautos.ng` at [nira.com.ng](https://nira.com.ng) or through Namecheap
2. Point DNS to your server:
   - Type A: `@` → Your Server IP
   - Type A: `www` → Your Server IP
   - Type CNAME: `www` → `stillautos.ng`

DNS propagation: 24–48 hours

---

## Post-Deployment Checklist

- [ ] Website loads on domain
- [ ] HTTPS works (green padlock)
- [ ] Admin dashboard accessible at `/admin-panel`
- [ ] WhatsApp links open correctly
- [ ] Finance calculator works
- [ ] Contact form submits
- [ ] Vehicle images load
- [ ] Mobile version looks correct
- [ ] Dark/light theme switches work
- [ ] Backups scheduled
- [ ] Google Analytics installed
- [ ] Admin password changed from default

---

## Monitoring

### PM2 Commands
```bash
pm2 status              # Check app status
pm2 logs still-autos    # View logs
pm2 restart still-autos # Restart app
pm2 stop still-autos    # Stop app
pm2 monit               # Real-time monitoring
```

### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

*For support, contact your development team or open a GitHub issue.*
