# AI Newsroom - Hostinger VPS Deployment Guide

This guide will help you deploy your AI Newsroom application to Hostinger VPS.

## Prerequisites

- Hostinger VPS hosting account
- Domain name configured in Hostinger
- SSH access to your VPS
- Basic Linux command knowledge

## Architecture

- **Frontend**: React (Vite) - served as static files via Nginx
- **Backend**: FastAPI (Python) - running with Uvicorn
- **Database**: PostgreSQL (Supabase) - already configured
- **Web Server**: Nginx - reverse proxy and static file serving
- **Process Manager**: systemd - keeps backend running

## Step-by-Step Deployment

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
```

Or use Hostinger's web-based SSH terminal from hPanel.

### 2. Update System and Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y python3.11 python3.11-venv python3-pip nginx git postgresql-client nodejs npm

# Install PM2 (optional, for process management)
npm install -g pm2
```

### 3. Create Application User (Security Best Practice)

```bash
# Create a dedicated user for the application
useradd -m -s /bin/bash ainews
usermod -aG sudo ainews

# Switch to the application user
su - ainews
```

### 4. Clone Your Repository

```bash
# Clone your repository
cd /home/ainews
git clone https://github.com/shivanshusoni185/AI-News-Prod.git
cd AI-News-Prod
```

### 5. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create production .env file
nano .env
```

**Add your environment variables:**
```env
DATABASE_URL=postgresql://postgres:jujAxu9r%2312@db.ikbokwmzujjmpodflktg.supabase.co:5432/postgres
ADMIN_USERNAME=shivanshusoni1111@gmail.com
ADMIN_PASSWORD=jujAxu9r#12
JWT_SECRET=supersecretjwtkey2024ainews
```

**Run database migration to add image columns:**
```bash
# Test backend is working
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Press Ctrl+C to stop
```

### 6. Setup Frontend

```bash
# Navigate to frontend directory
cd ../client

# Install dependencies
npm install

# Build for production
npm run build

# The production files will be in the 'dist' folder
```

### 7. Configure Nginx

Exit back to root user:
```bash
exit  # exit from ainews user
```

Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/ainews
```

See `nginx.conf` file in deployment folder for configuration.

```bash
# Enable the site
ln -s /etc/nginx/sites-available/ainews /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 8. Create Systemd Service for Backend

```bash
nano /etc/systemd/system/ainews-backend.service
```

See `ainews-backend.service` file in deployment folder for configuration.

```bash
# Reload systemd
systemctl daemon-reload

# Enable and start the service
systemctl enable ainews-backend
systemctl start ainews-backend

# Check status
systemctl status ainews-backend
```

### 9. Configure Firewall

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH

# Enable firewall
ufw enable
```

### 10. Setup SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

### 11. Configure Domain in Hostinger

1. Go to Hostinger hPanel
2. Navigate to Domains → DNS/Nameservers
3. Add/Update A Record:
   - Type: A
   - Name: @ (or yourdomain.com)
   - Points to: Your VPS IP address
   - TTL: 3600
4. Add WWW Record:
   - Type: A
   - Name: www
   - Points to: Your VPS IP address
   - TTL: 3600

Wait 5-30 minutes for DNS propagation.

### 12. Test Deployment

```bash
# Check backend service
systemctl status ainews-backend

# Check Nginx
systemctl status nginx

# View backend logs
journalctl -u ainews-backend -f

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

Visit your domain: `https://yourdomain.com`

## Updating Your Application

When you make changes and push to GitHub:

```bash
# SSH into your VPS
ssh ainews@your-vps-ip

# Navigate to project
cd /home/ainews/AI-News-Prod

# Pull latest changes
git pull origin main

# Update Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt  # if dependencies changed
systemctl restart ainews-backend

# Update Frontend
cd ../client
npm install  # if dependencies changed
npm run build

# Restart Nginx
sudo systemctl restart nginx
```

## Troubleshooting

### Backend not starting
```bash
# Check logs
journalctl -u ainews-backend -n 50

# Check if port 8000 is available
netstat -tulpn | grep 8000

# Manually test backend
su - ainews
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend not loading
```bash
# Check Nginx configuration
nginx -t

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Verify build directory exists
ls -la /home/ainews/AI-News-Prod/client/dist
```

### Database connection issues
```bash
# Test database connection
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
python3 -c "from app.database import engine; print('Connected!' if engine else 'Failed')"
```

### SSL Certificate issues
```bash
# Renew certificate manually
certbot renew

# Check certificate status
certbot certificates
```

## Monitoring and Maintenance

### Setup Automatic Backups

Create backup script:
```bash
nano /home/ainews/backup.sh
```

Add to crontab for daily backups:
```bash
crontab -e
# Add: 0 2 * * * /home/ainews/backup.sh
```

### Monitor Resources
```bash
# Check CPU and memory
htop

# Check disk space
df -h

# Monitor backend process
systemctl status ainews-backend
```

## Security Best Practices

1. **Keep system updated**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Change default SSH port** (optional)
   ```bash
   nano /etc/ssh/sshd_config
   # Change Port 22 to something else
   systemctl restart sshd
   ```

3. **Setup fail2ban** (brute force protection)
   ```bash
   apt install -y fail2ban
   systemctl enable fail2ban
   systemctl start fail2ban
   ```

4. **Regular security audits**
   ```bash
   # Check for security updates
   apt list --upgradable
   ```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs: `journalctl -u ainews-backend -f`
3. Check Nginx logs: `tail -f /var/log/nginx/error.log`
4. Verify database connection in Supabase dashboard

## Performance Optimization

### Enable Gzip compression (already in nginx.conf)
### Enable caching for static assets (already in nginx.conf)
### Use CDN for images (optional, for better performance)

---

**Congratulations!** Your AI Newsroom is now deployed on Hostinger VPS! 🎉
