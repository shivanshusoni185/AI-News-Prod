# Nginx SSL Certificate Issue - Fix Instructions

## Check if SSL certificates exist:
sudo ls -la /etc/letsencrypt/live/cloudmindai.in/

## If certificates exist, update the nginx config:
sudo nano /etc/nginx/sites-available/ainews

# Find these commented lines (around line 21-22):
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Replace with:
ssl_certificate /etc/letsencrypt/live/cloudmindai.in/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/cloudmindai.in/privkey.pem;

# Save and test:
sudo nginx -t
sudo systemctl reload nginx
