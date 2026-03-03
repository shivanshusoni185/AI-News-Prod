# 🚀 DEPLOYMENT - Quick Commands

## Before You Start
- [ ] All code committed to GitHub
- [ ] Supabase credentials ready
- [ ] SSH access to VPS confirmed

---

## 🎯 One-Command Deploy (Easiest)

```bash
# 1. SSH into your VPS
ssh root@147.93.107.103

# 2. Run this single command
cd /var/www/ainews && git pull origin main && chmod +x deployment/deploy_improvements.sh && ./deployment/deploy_improvements.sh
```

**That's it!** The script handles everything automatically.

---

## ⚡ Manual Deploy (If needed)

```bash
# SSH into VPS
ssh root@147.93.107.103

# Pull latest code
cd /var/www/ainews
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../client
npm install && npm run build

# Restart
sudo systemctl restart ainews-backend
sudo systemctl reload nginx
```

---

## ✅ Quick Test

```bash
# Test backend
curl https://cloudmindai.in/api/health

# Test pagination
curl https://cloudmindai.in/api/news?page=1

# Test new endpoints
curl https://cloudmindai.in/api/news/feed/rss
curl https://cloudmindai.in/api/news/sitemap/xml
```

---

## 🔍 Check Status

```bash
# Backend service
sudo systemctl status ainews-backend

# Backend logs
journalctl -u ainews-backend -f

# Nginx logs
tail -f /var/log/nginx/error.log
```

---

## 🎉 New Features to Test

Visit: https://cloudmindai.in

1. Click **dark mode toggle** (moon icon in header)
2. Scroll down - see **pagination**
3. Click a **tag** to filter
4. Open an **article**:
   - See reading progress bar
   - Try like/bookmark buttons
   - Click share button
   - Check related articles
5. Subscribe to **newsletter** (footer)
6. Scroll down - see **back to top** button

---

## 🆘 Rollback (If needed)

```bash
ssh root@147.93.107.103
cd /var/www/ainews

# Find your backup
ls -lt /var/backups/ainews/

# Restore (replace with your backup timestamp)
sudo rm -rf /var/www/ainews
sudo cp -r /var/backups/ainews/backup_YYYYMMDD_HHMMSS/ainews /var/www/

# Restart
sudo systemctl restart ainews-backend
sudo systemctl reload nginx
```

---

## 📊 Monitor Analytics

```bash
# Check newsletter signups
sudo -u postgres psql postgres -c "SELECT COUNT(*) FROM newsletter WHERE active=true;"

# Check article views
sudo -u postgres psql postgres -c "SELECT COUNT(*) FROM article_views;"

# Check reactions
sudo -u postgres psql postgres -c "SELECT reaction_type, COUNT(*) FROM article_reactions GROUP BY reaction_type;"
```

---

## 🔗 Important URLs

- **Website:** https://cloudmindai.in
- **Admin:** https://cloudmindai.in/admin/login
- **RSS:** https://cloudmindai.in/api/news/feed/rss
- **Sitemap:** https://cloudmindai.in/api/news/sitemap/xml
- **Health:** https://cloudmindai.in/api/health

---

**Questions?** Check the full guide: `/app/deployment/DEPLOYMENT_GUIDE_NEW_FEATURES.md`
