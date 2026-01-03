# AI Newsroom - Quick Reference Card

## Deployment Information

**Domain**: https://cloudmindai.in
**VPS IP**: 147.93.107.103
**SSH Access**: `ssh root@147.93.107.103`

---

## Common Commands

### Check Service Status
```bash
# Backend
systemctl status ainews-backend

# Nginx
systemctl status nginx

# Both
systemctl status ainews-backend nginx
```

### Restart Services
```bash
# Backend only
systemctl restart ainews-backend

# Nginx only
systemctl restart nginx

# Both
systemctl restart ainews-backend nginx
```

### View Logs
```bash
# Backend logs (live)
journalctl -u ainews-backend -f

# Backend logs (last 50 lines)
journalctl -u ainews-backend -n 50

# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## Update Application

### Quick Update
```bash
# Connect to VPS
ssh root@147.93.107.103

# Update code
su - ainews
cd /home/ainews/AI-News-Prod
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
exit

# Restart backend
systemctl restart ainews-backend

# Update frontend
su - ainews
cd /home/ainews/AI-News-Prod/client
npm install
npm run build
exit

# Restart Nginx
systemctl restart nginx
```

### Backend Only Update
```bash
su - ainews
cd /home/ainews/AI-News-Prod
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
exit
systemctl restart ainews-backend
```

### Frontend Only Update
```bash
su - ainews
cd /home/ainews/AI-News-Prod
git pull origin main
cd client
npm install
npm run build
exit
systemctl restart nginx
```

---

## Troubleshooting

### Website Shows 500 Error

**Check Nginx logs:**
```bash
tail -n 50 /var/log/nginx/error.log
```

**If you see "Permission denied":**
```bash
chmod 755 /home/ainews
chmod 755 /home/ainews/AI-News-Prod
chmod 755 /home/ainews/AI-News-Prod/client
chmod -R 755 /home/ainews/AI-News-Prod/client/dist
systemctl restart nginx
```

### Backend Not Working

**Check status:**
```bash
systemctl status ainews-backend
```

**View logs:**
```bash
journalctl -u ainews-backend -n 100
```

**Test manually:**
```bash
su - ainews
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Press Ctrl+C to stop
exit
```

**Restart service:**
```bash
systemctl restart ainews-backend
```

### SSL Certificate Issues

**Check certificate:**
```bash
certbot certificates
```

**Renew manually:**
```bash
certbot renew
```

**Test auto-renewal:**
```bash
certbot renew --dry-run
```

### Database Connection Issues

**Test connection:**
```bash
su - ainews
cd /home/ainews/AI-News-Prod/backend
source venv/bin/activate
python3 -c "from app.database import engine; print('Connected!' if engine else 'Failed')"
exit
```

**Check .env file:**
```bash
cat /home/ainews/AI-News-Prod/backend/.env
```

---

## File Locations

### Application
- **Project Root**: `/home/ainews/AI-News-Prod`
- **Backend**: `/home/ainews/AI-News-Prod/backend`
- **Frontend**: `/home/ainews/AI-News-Prod/client`
- **Built Frontend**: `/home/ainews/AI-News-Prod/client/dist`

### Configuration Files
- **Nginx Config**: `/etc/nginx/sites-available/ainews`
- **Backend Service**: `/etc/systemd/system/ainews-backend.service`
- **Environment Variables**: `/home/ainews/AI-News-Prod/backend/.env`

### Logs
- **Backend Logs**: `journalctl -u ainews-backend`
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`
- **SSL Certificates**: `/var/log/letsencrypt/letsencrypt.log`

---

## Important URLs

- **Website**: https://cloudmindai.in
- **Admin Login**: https://cloudmindai.in/admin/login
- **API Docs**: https://cloudmindai.in/api/docs
- **GitHub Repo**: https://github.com/shivanshusoni185/AI-News-Prod

---

## Admin Credentials

**Email**: shivanshusoni1111@gmail.com
**Password**: jujAxu9r#12

---

## Firewall Ports

```bash
# View firewall status
ufw status

# Allowed ports:
# 22/tcp - SSH
# 80/tcp - HTTP
# 443/tcp - HTTPS
```

---

## System Maintenance

### Update System
```bash
apt update && apt upgrade -y
```

### Check Disk Space
```bash
df -h
```

### Check Memory
```bash
free -h
```

### Check Server Load
```bash
htop
```

---

## Emergency Commands

### Stop Everything
```bash
systemctl stop ainews-backend
systemctl stop nginx
```

### Start Everything
```bash
systemctl start ainews-backend
systemctl start nginx
```

### Disable Firewall (Emergency Only!)
```bash
ufw disable
```

### Re-enable Firewall
```bash
ufw enable
```

---

## DNS Information

**Domain Registrar**: Hostinger
**DNS Management**: Hostinger hPanel → Domains → DNS/Nameservers

**A Records:**
- `@` → 147.93.107.103
- `www` → 147.93.107.103

---

## SSL Certificate

**Provider**: Let's Encrypt (Free)
**Auto-Renewal**: Enabled (every 90 days)
**Certificate Location**: `/etc/letsencrypt/live/cloudmindai.in/`

---

## Need Help?

1. Check logs first (see "View Logs" section above)
2. Review main documentation: `COMPLETE_DEPLOYMENT_GUIDE.md`
3. Check Hostinger support for VPS issues
4. Review error messages carefully

---

**Last Updated**: December 18, 2024
