# Quick Start - Deploy AI Newsroom to Hostinger VPS

**Domain**: cloudmindai.in
**Repository**: https://github.com/shivanshusoni185/AI-News-Prod

## Quick Deployment Steps

### 1. Connect to Your Hostinger VPS

Login to Hostinger hPanel → VPS → Access → SSH Access

```bash
ssh root@your-vps-ip
```

### 2. Run Initial Setup (Copy and paste this entire block)

```bash
# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y python3.11 python3.11-venv python3-pip nginx git nodejs npm curl ufw

# Create application user
useradd -m -s /bin/bash ainews
usermod -aG sudo ainews

# Switch to ainews user
su - ainews
```

### 3. Clone and Setup Application

```bash
# Clone repository
cd /home/ainews
git clone https://github.com/shivanshusoni185/AI-News-Prod.git
cd AI-News-Prod

# Setup Backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:jujAxu9r%2312@db.ikbokwmzujjmpodflktg.supabase.co:5432/postgres
ADMIN_USERNAME=shivanshusoni1111@gmail.com
ADMIN_PASSWORD=jujAxu9r#12
JWT_SECRET=supersecretjwtkey2024ainews
EOF

# Test backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Press Ctrl+C after confirming it starts successfully

# Setup Frontend
cd ../client
npm install
npm run build

# Exit to root user
exit
```

### 4. Configure Nginx

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/ainews << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name cloudmindai.in www.cloudmindai.in;

    root /home/ainews/AI-News-Prod/client/dist;
    index index.html;

    client_max_body_size 10M;

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
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/ainews /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
```

### 5. Create Backend Service

```bash
cat > /etc/systemd/system/ainews-backend.service << 'EOF'
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
EOF

# Start backend service
systemctl daemon-reload
systemctl enable ainews-backend
systemctl start ainews-backend
systemctl status ainews-backend
```

### 6. Configure Firewall

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 7. Setup SSL (HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d cloudmindai.in -d www.cloudmindai.in --non-interactive --agree-tos -m shivanshusoni1111@gmail.com
```

### 8. Configure DNS in Hostinger

1. Login to Hostinger hPanel
2. Go to **Domains** → **cloudmindai.in** → **DNS/Nameservers**
3. Update/Add these records:

**A Records:**
- **Type**: A
  **Name**: @ (or cloudmindai.in)
  **Points to**: YOUR_VPS_IP_ADDRESS
  **TTL**: 3600

- **Type**: A
  **Name**: www
  **Points to**: YOUR_VPS_IP_ADDRESS
  **TTL**: 3600

Wait 5-30 minutes for DNS propagation.

### 9. Verify Deployment

```bash
# Check backend
systemctl status ainews-backend

# Check Nginx
systemctl status nginx

# View logs
journalctl -u ainews-backend -f
```

Visit: **https://cloudmindai.in** 🎉

## Update Your Application

When you push changes to GitHub:

```bash
ssh ainews@your-vps-ip
cd /home/ainews/AI-News-Prod
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart ainews-backend

# Update frontend
cd ../client
npm install
npm run build
sudo systemctl restart nginx
```

Or use the automated update script:
```bash
chmod +x /home/ainews/AI-News-Prod/deployment/update.sh
/home/ainews/AI-News-Prod/deployment/update.sh
```

## Troubleshooting

### Check backend logs
```bash
journalctl -u ainews-backend -n 100
```

### Check Nginx logs
```bash
tail -f /var/log/nginx/error.log
```

### Restart services
```bash
sudo systemctl restart ainews-backend
sudo systemctl restart nginx
```

## Important Notes

- Your database is already on Supabase (external), so no local database setup needed
- Images are stored in PostgreSQL, not on the server filesystem
- The application will be accessible at https://cloudmindai.in after DNS propagation
- SSL certificate auto-renews every 90 days

---

Need help? Check the full DEPLOYMENT.md guide or check service logs!
