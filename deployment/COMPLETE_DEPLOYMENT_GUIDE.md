# AI Newsroom - Complete Deployment Guide to Hostinger VPS

**Domain**: cloudmindai.in
**VPS IP**: 147.93.107.103
**OS**: Ubuntu 24.04 LTS
**Repository**: https://github.com/shivanshusoni185/AI-News-Prod

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step-by-Step Deployment](#step-by-step-deployment)
3. [Post-Deployment Configuration](#post-deployment-configuration)
4. [Troubleshooting](#troubleshooting)
5. [Maintenance & Updates](#maintenance--updates)
6. [Useful Commands](#useful-commands)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Hostinger VPS hosting account
- ✅ Domain name (cloudmindai.in) configured in Hostinger
- ✅ SSH access to your VPS
- ✅ Supabase PostgreSQL database credentials
- ✅ GitHub repository with your application code

---

## Step-by-Step Deployment

### Step 1: Configure DNS in Hostinger

1. Login to **Hostinger hPanel**
2. Navigate to **Domains** → **cloudmindai.in** → **DNS/Nameservers**
3. Add/Update these DNS records:

**A Record for Root Domain:**
- Type: `A`
- Name: `@` (or leave empty)
- Points to: `147.93.107.103`
- TTL: `3600`

**A Record for WWW Subdomain:**
- Type: `A`
- Name: `www`
- Points to: `147.93.107.103`
- TTL: `3600`

4. Click **Save**
5. Wait 5-30 minutes for DNS propagation

**Verify DNS propagation:**
```bash
ping cloudmindai.in
# Should return: 147.93.107.103
```

---

### Step 2: Connect to Your VPS

Open your terminal (PowerShell on Windows, Terminal on Mac/Linux):

```bash
ssh root@147.93.107.103
```

Type `yes` when asked about fingerprint, then enter your root password.

---

### Step 3: Update System & Install Dependencies

```bash
# Update system packages
apt update && apt upgrade -y

# Install required packages
apt install -y python3.11 python3.11-venv python3-pip nginx git nodejs npm curl ufw certbot python3-certbot-nginx

echo "✅ System updated and dependencies installed!"
```

**What this does:**
- Updates all system packages to latest versions
- Installs Python 3.11 (for backend)
- Installs Nginx (web server)
- Installs Node.js & npm (for frontend build)
- Installs Certbot (for SSL certificates)
- Installs UFW (firewall)

---

### Step 4: Create Application User (Security Best Practice)

```bash
# Create dedicated user for the application
useradd -m -s /bin/bash ainews

# Add user to sudo group
usermod -aG sudo ainews

# Switch to ainews user
su - ainews
```

**Why?** Running applications as root is a security risk. We create a dedicated user with limited permissions.

---

### Step 5: Clone Repository & Setup Backend

```bash
# Clone your repository
cd /home/ainews
git clone https://github.com/shivanshusoni185/AI-News-Prod.git
cd AI-News-Prod

# Setup Backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file with your credentials
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:jujAxu9r%2312@db.ikbokwmzujjmpodflktg.supabase.co:5432/postgres
ADMIN_USERNAME=shivanshusoni1111@gmail.com
ADMIN_PASSWORD=jujAxu9r#12
JWT_SECRET=supersecretjwtkey2024ainews
EOF

echo "✅ Backend setup complete!"

# Test backend (optional but recommended)
echo "Testing backend... Press Ctrl+C after you see 'Application startup complete.'"
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Press Ctrl+C to stop the test
```

**What this does:**
- Clones your application code from GitHub
- Creates a Python virtual environment
- Installs all Python dependencies
- Creates environment variables file with database credentials
- Tests that the backend starts successfully

---

### Step 6: Setup Frontend

```bash
# Build frontend for production
cd /home/ainews/AI-News-Prod/client
npm install
npm run build

echo "✅ Frontend built successfully!"

# Exit back to root user
exit
```

**What this does:**
- Installs all Node.js dependencies
- Builds the React application for production
- Creates optimized static files in the `dist` folder

You're now back as `root` user.

---

### Step 7: Configure Nginx (Web Server)

Create the Nginx configuration file:

```bash
nano /etc/nginx/sites-available/ainews
```

Paste this configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name cloudmindai.in www.cloudmindai.in;

    root /home/ainews/AI-News-Prod/client/dist;
    index index.html;

    client_max_body_size 10M;

    # API Backend
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Save and exit:
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

Enable the site and restart Nginx:

```bash
# Enable the site
ln -s /etc/nginx/sites-available/ainews /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

echo "✅ Nginx configured and running!"
```

**What this does:**
- Configures Nginx to serve your React frontend
- Sets up reverse proxy to forward API requests to backend
- Enables caching for static assets (images, CSS, JS)

---

### Step 8: Create Backend Service (systemd)

Create the systemd service file:

```bash
nano /etc/systemd/system/ainews-backend.service
```

Paste this configuration:

```ini
[Unit]
Description=AI Newsroom FastAPI Backend
After=network.target

[Service]
Type=simple
User=ainews
Group=ainews
WorkingDirectory=/home/ainews/AI-News-Prod/backend
Environment="PATH=/home/ainews/AI-News-Prod/backend/venv/bin"
EnvironmentFile=/home/ainews/AI-News-Prod/backend/.env
ExecStart=/home/ainews/AI-News-Prod/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Save and exit:
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

Start the backend service:

```bash
# Reload systemd
systemctl daemon-reload

# Enable service to start on boot
systemctl enable ainews-backend

# Start the service
systemctl start ainews-backend

# Check status
systemctl status ainews-backend

echo "✅ Backend service is running!"
```

**What this does:**
- Creates a systemd service to keep backend running
- Automatically restarts backend if it crashes
- Starts backend automatically on server reboot
- Runs 2 worker processes for better performance

---

### Step 9: Fix File Permissions (IMPORTANT!)

**This step is crucial** - without it, Nginx cannot access your frontend files.

```bash
# Allow Nginx to access the directories
chmod 755 /home/ainews
chmod 755 /home/ainews/AI-News-Prod
chmod 755 /home/ainews/AI-News-Prod/client
chmod -R 755 /home/ainews/AI-News-Prod/client/dist

# Restart Nginx to apply changes
systemctl restart nginx

echo "✅ Permissions fixed!"
```

**Why?** Nginx runs as the `www-data` user and needs read access to serve files. By default, user home directories don't allow access to other users.

---

### Step 10: Configure Firewall

```bash
# Allow HTTP traffic
ufw allow 80/tcp

# Allow HTTPS traffic
ufw allow 443/tcp

# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Enable firewall
ufw --force enable

# Check firewall status
ufw status

echo "✅ Firewall configured!"
```

**What this does:**
- Opens port 80 for HTTP
- Opens port 443 for HTTPS
- Opens port 22 for SSH access
- Blocks all other incoming traffic

---

### Step 11: Setup SSL Certificate (HTTPS)

```bash
# Get free SSL certificate from Let's Encrypt
certbot --nginx -d cloudmindai.in -d www.cloudmindai.in --non-interactive --agree-tos -m shivanshusoni1111@gmail.com

echo "✅ SSL certificate installed!"
```

**What this does:**
- Gets a free SSL certificate from Let's Encrypt
- Automatically configures Nginx to use HTTPS
- Sets up auto-renewal (certificate renews every 90 days automatically)
- Redirects HTTP to HTTPS

---

### Step 12: Verify Deployment

```bash
# Check backend service
systemctl status ainews-backend

# Check Nginx
systemctl status nginx

# Check firewall
ufw status

# Test backend API
curl http://localhost:8000/docs

# Test external access
curl -I https://cloudmindai.in
```

**Expected results:**
- Both services should show `active (running)`
- Firewall should show ports 22, 80, 443 allowed
- Backend API docs should be accessible
- Website should return `200 OK`

---

## Post-Deployment Configuration

### Access Your Website

After deployment completes, your website is live at:

- **Primary**: https://cloudmindai.in
- **With WWW**: https://www.cloudmindai.in
- **API Documentation**: https://cloudmindai.in/api/docs
- **Admin Panel**: https://cloudmindai.in/admin/login

**Admin Credentials:**
- Email: `shivanshusoni1111@gmail.com`
- Password: `jujAxu9r#12`

---

## Troubleshooting

### Problem: 500 Internal Server Error

**Symptom:** Website shows "500 Internal Server Error"

**Solution 1: Check Nginx Error Logs**
```bash
tail -n 50 /var/log/nginx/error.log
```

**Common Issue: Permission Denied**
```bash
# Fix permissions
chmod 755 /home/ainews
chmod 755 /home/ainews/AI-News-Prod
chmod 755 /home/ainews/AI-News-Prod/client
chmod -R 755 /home/ainews/AI-News-Prod/client/dist
systemctl restart nginx
```

**Solution 2: Check Backend Logs**
```bash
journalctl -u ainews-backend -n 50
```

---

### Problem: Backend Not Starting

**Check service status:**
```bash
systemctl status ainews-backend
```

**View detailed logs:**
```bash
journalctl -u ainews-backend -n 100
```

**Test backend manually:**
```bash
su - ainews
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Common causes:**
- Database connection issues (check `.env` file)
- Port 8000 already in use
- Missing Python dependencies

---

### Problem: SSL Certificate Failed

**Symptom:** Certbot shows DNS or authorization errors

**Solution:**
1. Verify DNS is configured correctly:
```bash
ping cloudmindai.in
# Should return your VPS IP: 147.93.107.103
```

2. Check Nginx is running:
```bash
systemctl status nginx
```

3. Try certificate for main domain only:
```bash
certbot --nginx -d cloudmindai.in --non-interactive --agree-tos -m shivanshusoni1111@gmail.com
```

4. Check DNS propagation online: https://dnschecker.org

---

### Problem: Can't Access Website

**Check if services are running:**
```bash
systemctl status nginx
systemctl status ainews-backend
```

**Check firewall:**
```bash
ufw status
```

**Test local access:**
```bash
curl http://localhost
```

**Check if Nginx is listening:**
```bash
netstat -tulpn | grep nginx
```

---

### Problem: Database Connection Issues

**Test database connection:**
```bash
su - ainews
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
python3 -c "from app.database import engine; print('Connected!' if engine else 'Failed')"
```

**Check environment variables:**
```bash
cat /home/ainews/AI-News-Prod/backend/.env
```

**Verify Supabase database is accessible:**
- Check Supabase dashboard
- Verify database is not paused
- Check credentials are correct

---

## Maintenance & Updates

### Updating Your Application

When you push changes to GitHub:

```bash
# SSH into your VPS
ssh root@147.93.107.103

# Switch to ainews user
su - ainews

# Navigate to project
cd /home/ainews/AI-News-Prod

# Pull latest changes
git pull origin main

# Update Backend (if backend changed)
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Exit to root user
exit

# Restart backend service
systemctl restart ainews-backend

# Update Frontend (if frontend changed)
su - ainews
cd /home/ainews/AI-News-Prod/client
npm install
npm run build
exit

# Restart Nginx
systemctl restart nginx

echo "✅ Application updated!"
```

**Or use the automated update script:**
```bash
chmod +x /home/ainews/AI-News-Prod/deployment/update.sh
/home/ainews/AI-News-Prod/deployment/update.sh
```

---

### System Maintenance

**Update system packages (monthly recommended):**
```bash
apt update && apt upgrade -y
```

**Check disk space:**
```bash
df -h
```

**Check memory usage:**
```bash
free -h
```

**Monitor server resources:**
```bash
htop
```

---

### SSL Certificate Management

**Check certificate status:**
```bash
certbot certificates
```

**Manually renew certificate:**
```bash
certbot renew
```

**Test auto-renewal:**
```bash
certbot renew --dry-run
```

**Note:** Certificates auto-renew automatically every 90 days. No manual intervention needed.

---

### Backup Strategy

**Backend code:** Already on GitHub (git push regularly)

**Database:** Managed by Supabase (automatic backups)

**Server configuration files to backup:**
- `/etc/nginx/sites-available/ainews`
- `/etc/systemd/system/ainews-backend.service`
- `/home/ainews/AI-News-Prod/backend/.env`

**Create backup script:**
```bash
nano /home/ainews/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ainews/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup configuration files
cp /etc/nginx/sites-available/ainews $BACKUP_DIR/nginx_$DATE.conf
cp /etc/systemd/system/ainews-backend.service $BACKUP_DIR/backend_service_$DATE.service
cp /home/ainews/AI-News-Prod/backend/.env $BACKUP_DIR/env_$DATE.bak

echo "Backup completed: $DATE"
```

```bash
chmod +x /home/ainews/backup.sh
```

**Schedule weekly backups with cron:**
```bash
crontab -e
# Add this line:
0 2 * * 0 /home/ainews/backup.sh
```

---

## Useful Commands

### Service Management

```bash
# Start a service
systemctl start ainews-backend
systemctl start nginx

# Stop a service
systemctl stop ainews-backend
systemctl stop nginx

# Restart a service
systemctl restart ainews-backend
systemctl restart nginx

# Check service status
systemctl status ainews-backend
systemctl status nginx

# Enable service on boot
systemctl enable ainews-backend
systemctl enable nginx

# Disable service on boot
systemctl disable ainews-backend
```

---

### Log Viewing

```bash
# View backend logs (live)
journalctl -u ainews-backend -f

# View last 100 backend log lines
journalctl -u ainews-backend -n 100

# View Nginx access logs
tail -f /var/log/nginx/access.log

# View Nginx error logs
tail -f /var/log/nginx/error.log

# View system logs
journalctl -xe
```

---

### Nginx Commands

```bash
# Test Nginx configuration
nginx -t

# Reload Nginx (without downtime)
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# Check Nginx version
nginx -v

# View Nginx configuration
cat /etc/nginx/sites-available/ainews
```

---

### Firewall Commands

```bash
# Check firewall status
ufw status

# Check verbose status
ufw status verbose

# Allow a port
ufw allow 8080/tcp

# Deny a port
ufw deny 8080/tcp

# Delete a rule
ufw delete allow 8080/tcp

# Disable firewall
ufw disable

# Enable firewall
ufw enable
```

---

### Database Commands

```bash
# Test database connection
su - ainews
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
python3 -c "from app.database import engine; print('Connected!' if engine else 'Failed')"
```

---

### Git Commands

```bash
# Pull latest changes
git pull origin main

# Check current branch
git branch

# Check status
git status

# View recent commits
git log -5
```

---

### Process Management

```bash
# Check what's running on port 8000
netstat -tulpn | grep 8000

# Check all listening ports
netstat -tulpn

# Kill a process by PID
kill -9 <PID>

# Find process by name
ps aux | grep uvicorn
```

---

## Security Best Practices

### 1. Keep System Updated
```bash
# Update regularly (at least monthly)
apt update && apt upgrade -y
```

### 2. Change Default SSH Port (Optional)
```bash
nano /etc/ssh/sshd_config
# Change: Port 22 to Port 2222
systemctl restart sshd

# Don't forget to allow new port in firewall!
ufw allow 2222/tcp
```

### 3. Install Fail2Ban (Brute Force Protection)
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 4. Disable Root Login (After setting up SSH keys)
```bash
nano /etc/ssh/sshd_config
# Change: PermitRootLogin yes to PermitRootLogin no
systemctl restart sshd
```

### 5. Setup SSH Key Authentication
```bash
# On your local machine:
ssh-keygen -t rsa -b 4096

# Copy public key to server:
ssh-copy-id root@147.93.107.103
```

### 6. Monitor Logs Regularly
```bash
# Check for suspicious activity
tail -f /var/log/auth.log
tail -f /var/log/nginx/access.log
```

### 7. Secure Environment Variables
```bash
# Ensure .env file is not world-readable
chmod 600 /home/ainews/AI-News-Prod/backend/.env
```

### 8. Use Strong Passwords
- Database passwords
- Admin panel passwords
- SSH passwords
- Use password managers

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Internet                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS (Port 443)
                     │ HTTP (Port 80)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Nginx Web Server                        │
│  - Serves static files (React frontend)                 │
│  - Reverse proxy for API requests                       │
│  - SSL termination                                       │
│  - Caching                                               │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             │ Static Files          │ API Requests (/api/*)
             │                       │
             ▼                       ▼
┌──────────────────────┐  ┌─────────────────────────────┐
│  React Frontend      │  │  FastAPI Backend            │
│  /home/ainews/       │  │  Port 8000                  │
│  AI-News-Prod/       │  │  2 Worker Processes         │
│  client/dist/        │  │  Managed by systemd         │
└──────────────────────┘  └───────────┬─────────────────┘
                                      │
                                      │ Database Queries
                                      ▼
                          ┌─────────────────────────────┐
                          │  Supabase PostgreSQL        │
                          │  (External/Cloud)           │
                          │  - Users                    │
                          │  - Articles                 │
                          │  - Images (bytea)           │
                          └─────────────────────────────┘
```

---

## Performance Optimization

### 1. Enable Gzip Compression
Already enabled in Nginx configuration for text files.

### 2. Enable Browser Caching
Already enabled in Nginx configuration for static assets (1 year).

### 3. Optimize Images
```bash
# Install optimization tools
apt install -y imagemagick optipng jpegoptim

# Optimize existing images
find /home/ainews/AI-News-Prod/client/dist/assets -name "*.jpg" -exec jpegoptim --strip-all {} \;
find /home/ainews/AI-News-Prod/client/dist/assets -name "*.png" -exec optipng {} \;
```

### 4. Monitor Performance
```bash
# Check server load
uptime

# Check memory usage
free -h

# Check disk I/O
iostat

# Check network usage
iftop
```

### 5. Database Optimization
- Use Supabase dashboard to monitor queries
- Add indexes for frequently queried columns
- Use connection pooling (already configured)

---

## Cost Optimization

### Current Setup Costs:
- **VPS**: Hostinger VPS plan (varies by tier)
- **SSL Certificate**: Free (Let's Encrypt)
- **Database**: Supabase Free tier (upgrade if needed)
- **Domain**: Annual domain registration

### Tips to Reduce Costs:
1. Use Supabase free tier efficiently
2. Optimize images to reduce bandwidth
3. Enable caching to reduce server load
4. Monitor and remove unused resources

---

## Monitoring & Alerts

### Setup Basic Monitoring

**Install monitoring tools:**
```bash
apt install -y htop iotop iftop
```

**Check system health:**
```bash
# CPU and memory
htop

# Disk I/O
iotop

# Network
iftop
```

**Monitor application logs:**
```bash
# Real-time backend logs
journalctl -u ainews-backend -f

# Real-time Nginx logs
tail -f /var/log/nginx/access.log
```

---

## Support & Resources

### Official Documentation
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Nginx**: https://nginx.org/en/docs/
- **Certbot**: https://certbot.eff.org/
- **Supabase**: https://supabase.com/docs

### Community Support
- **FastAPI Discord**: https://discord.gg/fastapi
- **React Community**: https://react.dev/community
- **Stack Overflow**: Tag questions with relevant technologies

### Hostinger Support
- **hPanel**: Login to access support tickets
- **Knowledge Base**: https://support.hostinger.com/

---

## Deployment Checklist

Use this checklist to verify your deployment:

- [ ] DNS configured (A records for @ and www)
- [ ] SSH access to VPS working
- [ ] System packages updated
- [ ] Application user created (ainews)
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Backend .env file created
- [ ] Frontend built successfully
- [ ] Nginx configured
- [ ] Nginx configuration tested (nginx -t)
- [ ] Backend systemd service created
- [ ] Backend service running
- [ ] File permissions fixed (chmod 755)
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] SSL certificate installed
- [ ] Website accessible via HTTPS
- [ ] Admin login working
- [ ] API endpoints working
- [ ] Database connection verified

---

## Conclusion

Your **AI Newsroom** application is now successfully deployed on Hostinger VPS!

**Live URLs:**
- Website: https://cloudmindai.in
- Admin Panel: https://cloudmindai.in/admin/login
- API Docs: https://cloudmindai.in/api/docs

**Key Features:**
✅ HTTPS enabled with auto-renewal
✅ Automatic backend restarts on failure
✅ Firewall protection
✅ Production-optimized React build
✅ 2 backend workers for better performance
✅ Static asset caching
✅ Gzip compression enabled

**Next Steps:**
1. Test all website functionality
2. Create admin account and add news articles
3. Setup regular backups
4. Monitor server performance
5. Plan for scaling if traffic grows

---

**Questions or Issues?**
- Check the Troubleshooting section
- Review application logs
- Consult official documentation
- Contact Hostinger support for VPS-related issues

**Congratulations on your successful deployment! 🎉**

---

*Last Updated: December 18, 2024*
*Version: 1.0*
*Deployed by: Shivanshu Soni*
