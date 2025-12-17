# Deploy AI Newsroom to cloudmindai.in - Step by Step

**VPS IP**: 147.93.107.103
**Domain**: cloudmindai.in
**OS**: Ubuntu 24.04 LTS
**Location**: India - Mumbai

---

## STEP 1: Configure DNS (Do This First!)

1. Login to **Hostinger hPanel**
2. Go to **Domains** → **cloudmindai.in** → **DNS/Nameservers**
3. Add/Update these DNS records:

**A Record 1:**
- Type: `A`
- Name: `@` (or leave empty)
- Points to: `147.93.107.103`
- TTL: `3600`

**A Record 2:**
- Type: `A`
- Name: `www`
- Points to: `147.93.107.103`
- TTL: `3600`

Click **Save**. DNS will take 5-30 minutes to propagate.

---

## STEP 2: Connect to Your VPS

Open Terminal (or PowerShell on Windows) and run:

```bash
ssh root@147.93.107.103
```

Type `yes` when asked about fingerprint, then enter your root password.

---

## STEP 3: Update System & Install Dependencies

Copy and paste this entire block:

```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y python3.11 python3.11-venv python3-pip nginx git nodejs npm curl ufw certbot python3-certbot-nginx

echo "✅ System updated and dependencies installed!"
```

---

## STEP 4: Create Application User

```bash
# Create dedicated user for security
useradd -m -s /bin/bash ainews
usermod -aG sudo ainews

# Switch to ainews user
su - ainews
```

You're now logged in as `ainews` user.

---

## STEP 5: Clone Repository & Setup Backend

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

---

## STEP 6: Setup Frontend

```bash
# Build frontend
cd /home/ainews/AI-News-Prod/client
npm install
npm run build

echo "✅ Frontend built successfully!"

# Exit back to root user
exit
```

You're now back as `root` user.

---

## STEP 7: Configure Nginx

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/ainews << 'EOF'
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
EOF

# Enable the site
ln -s /etc/nginx/sites-available/ainews /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

echo "✅ Nginx configured and running!"
```

---

## STEP 8: Create Backend Service

```bash
# Create systemd service
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

# Reload systemd and start the service
systemctl daemon-reload
systemctl enable ainews-backend
systemctl start ainews-backend

# Check status
systemctl status ainews-backend

echo "✅ Backend service is running!"
```

---

## STEP 9: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# Enable firewall
ufw --force enable

echo "✅ Firewall configured!"
```

---

## STEP 10: Setup SSL Certificate (HTTPS)

Wait for DNS to propagate (check with: `ping cloudmindai.in`)

Then run:

```bash
# Get free SSL certificate from Let's Encrypt
certbot --nginx -d cloudmindai.in -d www.cloudmindai.in --non-interactive --agree-tos -m shivanshusoni1111@gmail.com

echo "✅ SSL certificate installed!"
```

---

## STEP 11: Verify Everything is Working

```bash
# Check backend service
systemctl status ainews-backend

# Check Nginx
systemctl status nginx

# View backend logs
journalctl -u ainews-backend -n 50

# Test the API
curl http://localhost:8000/health
```

---

## 🎉 DEPLOYMENT COMPLETE!

Your website is now live at:
- **http://cloudmindai.in** (will redirect to HTTPS)
- **https://cloudmindai.in** (secure)
- **https://www.cloudmindai.in**

---

## 📊 Useful Commands

### Check Service Status
```bash
systemctl status ainews-backend
systemctl status nginx
```

### View Logs
```bash
# Backend logs
journalctl -u ainews-backend -f

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
systemctl restart ainews-backend
systemctl restart nginx
```

### Update Application (After pushing to GitHub)
```bash
su - ainews
cd /home/ainews/AI-News-Prod
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
exit

# Update frontend
cd /home/ainews/AI-News-Prod/client
npm install
npm run build
exit

# Restart services
systemctl restart ainews-backend
systemctl restart nginx
```

---

## 🐛 Troubleshooting

### DNS not propagating?
```bash
# Check DNS
ping cloudmindai.in

# Force DNS cache clear on your computer
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
```

### Backend not starting?
```bash
# Check logs
journalctl -u ainews-backend -n 100

# Test manually
su - ainews
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Can't access website?
```bash
# Check Nginx
nginx -t
systemctl status nginx

# Check firewall
ufw status
```

### Database connection issues?
```bash
# Test database connection
su - ainews
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
python3 -c "from app.database import engine; print('Connected!' if engine else 'Failed')"
```

---

## 🔐 Security Notes

- Keep your `.env` file secure (never commit to Git)
- Regularly update the system: `apt update && apt upgrade -y`
- Monitor logs for suspicious activity
- SSL certificate auto-renews every 90 days

---

## 📱 Access Your Site

After DNS propagates (5-30 minutes):

1. Visit **https://cloudmindai.in**
2. Login to admin: **https://cloudmindai.in** → Click Admin Login
3. Username: `shivanshusoni1111@gmail.com`
4. Password: `jujAxu9r#12`

---

**Need help?** Check the logs or reach out!

Good luck with your deployment! 🚀
