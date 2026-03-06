#!/bin/bash
# Quick Update Script for AI Newsroom
# Run this script to update your application after pushing to GitHub

set -e  # Exit on error

echo "🚀 Updating AI Newsroom..."

# Navigate to project directory
cd /home/ainews/AI-News-Prod

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Update Backend
echo "🔧 Updating backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt --quiet
cd ..

# Update Frontend
echo "🎨 Building frontend..."
cd client
npm install --silent
npm run build
cd ..

# Restart services
echo "♻️  Restarting services..."
sudo systemctl restart ainews-backend
sudo systemctl restart nginx

# Check status
echo "✅ Checking service status..."
sudo systemctl status ainews-backend --no-pager -l

echo ""
echo "✨ Update complete! Your application is now running the latest version."
echo "🌐 Visit your site: https://cloudmindai.in"
