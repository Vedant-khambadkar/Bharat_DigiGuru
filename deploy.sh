
#!/bin/bash

set -Eeuo pipefail

# ==========================================
# Bharat DigiGuru - EC2 Deployment Script
# ==========================================

cd "$(dirname "$0")"

PROJECT_DIR="$(pwd)"
BACKEND_DIR="$PROJECT_DIR/Backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
WEB_ROOT="/var/www/bharat-digiguru"
PM2_APP="bharat-backend"
BRANCH="fix/mobile-performance"

echo "======================================"
echo " Starting Bharat DigiGuru Deployment"
echo "======================================"

# Print useful errors
trap 'echo "ERROR: Deployment failed at line $LINENO. Check the output above."' ERR

# ==========================================
# STEP 1: Validate Git and update code
# ==========================================

echo "[1/6] Checking Git repository..."

CURRENT_BRANCH="$(git branch --show-current)"

if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
    echo "ERROR: Expected branch '$BRANCH', found '$CURRENT_BRANCH'."
    exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "ERROR: Local changes detected."
    echo "Resolve or commit these changes before deployment."
    git status --short
    exit 1
fi

echo "Fetching latest GitHub changes..."
git fetch origin "$BRANCH"

LOCAL_COMMIT="$(git rev-parse HEAD)"
REMOTE_COMMIT="$(git rev-parse "origin/$BRANCH")"

if [[ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]]; then
    echo "Already up to date."
elif git merge-base --is-ancestor HEAD "origin/$BRANCH"; then
    echo "Fast-forwarding to latest GitHub commit..."
    git merge --ff-only "origin/$BRANCH"
elif git merge-base --is-ancestor "origin/$BRANCH" HEAD; then
    echo "Local branch is ahead of GitHub."
    echo "No remote changes to pull. Review your local commits before deploying."
    exit 1
else
    echo "ERROR: Local and remote branches have diverged."
    echo "Resolve the divergence manually before deployment."
    echo "Local-only commits:"
    git log --oneline "origin/$BRANCH..HEAD"
    echo "Remote-only commits:"
    git log --oneline "HEAD..origin/$BRANCH"
    exit 1
fi

# ==========================================
# STEP 2: Install and build backend
# ==========================================

echo "[2/6] Installing backend dependencies..."
cd "$BACKEND_DIR"
npm ci

echo "Building backend..."
npm run build

# ==========================================
# STEP 3: Install and build frontend
# ==========================================

echo "[3/6] Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm ci

echo "Building frontend..."
npm run build

if [[ ! -d "$FRONTEND_DIR/dist" ]]; then
    echo "ERROR: Frontend dist folder not found."
    exit 1
fi

# ==========================================
# STEP 4: Prepare frontend deployment
# ==========================================

echo "[4/6] Preparing frontend files..."

STAGING_DIR="$(mktemp -d /tmp/bharat-digiguru.XXXXXX)"

cleanup() {
    rm -rf "$STAGING_DIR"
}
trap cleanup EXIT

cp -a "$FRONTEND_DIR/dist/." "$STAGING_DIR/"

# ==========================================
# STEP 5: Publish frontend and restart backend
# ==========================================

echo "[5/6] Publishing frontend files..."

sudo mkdir -p "$WEB_ROOT"
sudo rsync -a --delete "$STAGING_DIR/" "$WEB_ROOT/"

echo "Restarting backend..."
pm2 restart "$PM2_APP"

# ==========================================
# STEP 6: Validate and reload Nginx
# ==========================================

echo "[6/6] Testing Nginx..."
sudo nginx -t

echo "Reloading Nginx..."
sudo systemctl reload nginx

echo "======================================"
echo " Deployment completed successfully!"
echo "======================================"
