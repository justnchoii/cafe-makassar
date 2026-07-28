#!/bin/bash
set -e

echo "🔧 Installing MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org

echo "🚀 Starting MongoDB..."
sudo mkdir -p /data/db
sudo mongod --fork --logpath /tmp/mongod.log --dbpath /data/db

echo "📦 Installing backend dependencies..."
cd /workspaces/cafe-makassar/backend
cp .env.example .env
sed -i 's|mongodb://mongo:27017|mongodb://localhost:27017|' .env
npm install
node src/seed.js

echo "📦 Installing frontend dependencies..."
cd /workspaces/cafe-makassar/frontend
cp .env.example .env
npm install

echo "✅ Setup complete! Run 'npm run dev' in backend/ and frontend/"
