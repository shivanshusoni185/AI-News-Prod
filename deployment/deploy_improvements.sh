#!/bin/bash

# ============================================================================
# TheCloudMind.ai - Production Deployment Script with New Features
# ============================================================================
# This script deploys all the new improvements to your production VPS
# Run this ON YOUR VPS at 147.93.107.103
# ============================================================================

set -e  # Exit on any error

echo "=========================================="
echo "🚀 Deploying TheCloudMind.ai Improvements"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/ainews"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/client"
DEPLOY_USER="ainews"

echo -e "${YELLOW}📋 Deployment Checklist:${NC}"
echo "   - Backing up current version"
echo "   - Pulling latest code from GitHub"
echo "   - Installing new dependencies"
echo "   - Building frontend"
echo "   - Migrating database (new tables will be auto-created)"
echo "   - Restarting services"
echo ""

# Function to print success messages
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root (use sudo)"
fi

# Step 1: Backup current version
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
BACKUP_DIR="/var/backups/ainews/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
if [ -d "$APP_DIR" ]; then
    cp -r $APP_DIR $BACKUP_DIR/
    success "Backup created at $BACKUP_DIR"
else
    echo "No existing installation found, skipping backup"
fi

# Step 2: Navigate to app directory
cd $APP_DIR || error "Failed to navigate to $APP_DIR"

# Step 3: Pull latest code
echo -e "${YELLOW}Step 2: Pulling latest code from GitHub...${NC}"
sudo -u $DEPLOY_USER git fetch origin
sudo -u $DEPLOY_USER git pull origin main || error "Failed to pull latest code"
success "Latest code pulled successfully"

# Step 4: Install backend dependencies
echo -e "${YELLOW}Step 3: Installing backend dependencies...${NC}"
cd $BACKEND_DIR
if [ -f "requirements.txt" ]; then
    sudo -u $DEPLOY_USER python3 -m venv venv
    sudo -u $DEPLOY_USER ./venv/bin/pip install --upgrade pip
    sudo -u $DEPLOY_USER ./venv/bin/pip install -r requirements.txt
    success "Backend dependencies installed"
else
    error "requirements.txt not found in $BACKEND_DIR"
fi

# Step 5: Check/Create .env file
echo -e "${YELLOW}Step 4: Checking environment configuration...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from your Supabase credentials..."
    cat > $BACKEND_DIR/.env << 'EOF'
# PostgreSQL (Supabase - Production)
DATABASE_URL=postgresql://postgres:jujAxu9r%2312@db.ikbokwmzujjmpodflktg.supabase.co:5432/postgres
ADMIN_USERNAME=shivanshusoni1111@gmail.com
ADMIN_PASSWORD=jujAxu9r#12
JWT_SECRET=supersecretjwtkey2024ainews
EOF
    chown $DEPLOY_USER:$DEPLOY_USER $BACKEND_DIR/.env
    chmod 600 $BACKEND_DIR/.env
    success ".env file created with production credentials"
else
    success ".env file exists"
fi

# Step 6: Test database connection and auto-migrate
echo -e "${YELLOW}Step 5: Testing database connection & migrating new tables...${NC}"
cd $BACKEND_DIR
sudo -u $DEPLOY_USER ./venv/bin/python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/var/www/ainews/backend')

try:
    from app.database import engine, Base
    from app.models import News, Contact, Newsletter, ArticleView, ArticleReaction
    
    # Test connection
    connection = engine.connect()
    connection.close()
    print("✓ Database connection successful")
    
    # Create all tables (existing tables won't be affected)
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created/updated successfully")
    print("  - News (existing)")
    print("  - Contact (existing)")
    print("  - Newsletter (NEW)")
    print("  - ArticleView (NEW)")
    print("  - ArticleReaction (NEW)")
    
except Exception as e:
    print(f"✗ Database error: {str(e)}")
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    success "Database migration completed"
else
    error "Database migration failed"
fi

# Step 7: Install frontend dependencies
echo -e "${YELLOW}Step 6: Installing frontend dependencies...${NC}"
cd $FRONTEND_DIR
if [ -f "package.json" ]; then
    sudo -u $DEPLOY_USER npm install || sudo -u $DEPLOY_USER yarn install
    success "Frontend dependencies installed"
else
    error "package.json not found in $FRONTEND_DIR"
fi

# Step 8: Build frontend
echo -e "${YELLOW}Step 7: Building frontend for production...${NC}"
cd $FRONTEND_DIR
sudo -u $DEPLOY_USER npm run build || sudo -u $DEPLOY_USER yarn build
if [ $? -eq 0 ]; then
    success "Frontend built successfully"
else
    error "Frontend build failed"
fi

# Step 9: Update Nginx configuration if needed
echo -e "${YELLOW}Step 8: Checking Nginx configuration...${NC}"
if [ -f "/etc/nginx/sites-available/ainews" ]; then
    nginx -t
    if [ $? -eq 0 ]; then
        success "Nginx configuration is valid"
    else
        error "Nginx configuration has errors"
    fi
else
    echo "⚠️  Nginx configuration not found, you may need to set it up"
fi

# Step 10: Restart backend service
echo -e "${YELLOW}Step 9: Restarting backend service...${NC}"
if systemctl is-active --quiet ainews-backend; then
    systemctl restart ainews-backend
    sleep 3
    if systemctl is-active --quiet ainews-backend; then
        success "Backend service restarted successfully"
    else
        error "Backend service failed to start. Check logs: journalctl -u ainews-backend -n 50"
    fi
else
    echo "⚠️  Backend service not found. Starting it..."
    systemctl start ainews-backend
    if [ $? -eq 0 ]; then
        success "Backend service started"
    else
        error "Failed to start backend service"
    fi
fi

# Step 11: Reload Nginx
echo -e "${YELLOW}Step 10: Reloading Nginx...${NC}"
systemctl reload nginx
success "Nginx reloaded"

# Step 12: Verify deployment
echo ""
echo -e "${YELLOW}Step 11: Verifying deployment...${NC}"

# Check backend health
BACKEND_HEALTH=$(curl -s http://localhost:8000/health | grep -o '"status":"running"' || echo "")
if [ -n "$BACKEND_HEALTH" ]; then
    success "Backend is running"
else
    error "Backend health check failed"
fi

# Check if frontend files exist
if [ -d "$FRONTEND_DIR/dist" ] && [ "$(ls -A $FRONTEND_DIR/dist)" ]; then
    success "Frontend build files present"
else
    error "Frontend build files missing"
fi

# Step 13: Show new features summary
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Successful!${NC}"
echo "=========================================="
echo ""
echo "✨ NEW FEATURES DEPLOYED:"
echo ""
echo "📱 Frontend:"
echo "   • Dark mode with toggle"
echo "   • Pagination system"
echo "   • Tag filtering"
echo "   • Loading skeletons"
echo "   • Reading progress bar"
echo "   • Social share buttons"
echo "   • Article reactions (likes & bookmarks)"
echo "   • Related articles"
echo "   • Newsletter subscription form"
echo "   • Back to top button"
echo "   • Reading time display"
echo "   • Enhanced animations"
echo ""
echo "🔧 Backend:"
echo "   • Pagination API"
echo "   • Article analytics (views, likes, bookmarks)"
echo "   • Newsletter subscriptions"
echo "   • RSS feed (/api/news/feed/rss)"
echo "   • Sitemap (/api/news/sitemap/xml)"
echo "   • Related articles API"
echo "   • Reading time calculation"
echo ""
echo "🌐 Your site: https://cloudmindai.in"
echo ""
echo "📊 Check new endpoints:"
echo "   • https://cloudmindai.in/api/news?page=1&limit=12"
echo "   • https://cloudmindai.in/api/news/tags/all"
echo "   • https://cloudmindai.in/api/news/feed/rss"
echo "   • https://cloudmindai.in/api/news/sitemap/xml"
echo ""
echo "💡 Tips:"
echo "   • Test dark mode toggle in header"
echo "   • Try filtering by tags on home page"
echo "   • Check article reactions (likes/bookmarks)"
echo "   • Subscribe to newsletter in footer"
echo ""
echo "📝 Backup location: $BACKUP_DIR"
echo ""
echo "=========================================="
echo ""

# Optional: Show service status
echo "Service Status:"
systemctl status ainews-backend --no-pager -l | head -5
echo ""

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo "If you encounter any issues, check:"
echo "  • Backend logs: journalctl -u ainews-backend -f"
echo "  • Nginx logs: tail -f /var/log/nginx/error.log"
echo ""
