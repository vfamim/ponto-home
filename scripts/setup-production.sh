#!/bin/bash
set -e

echo "🔧 Setup Ponto Home - Production Ready"
echo "======================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Supabase config
SUPABASE_URL="https://cylsqbmtglvdfubbarqe.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bHNxYm10Z2x2ZGZ1YmJhcnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwOTQyOTUsImV4cCI6MjA2MDY3MDI5NX0.dQfG3qXJ8K9YqJLZ5VqKJxQJ7xQJ8xQJ9xQJ0xQJ1xQ"

echo -e "\n${YELLOW}Step 1: Creating .env files...${NC}"

# Web .env
cat > apps/web/.env << EOF
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EOF
echo -e "${GREEN}✓ Web .env created${NC}"

# Mobile .env
cat > apps/mobile/.env << EOF
EXPO_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EXPO_PUBLIC_QR_CODE_VALUE=PONTO_KITCHEN_2026
EOF
echo -e "${GREEN}✓ Mobile .env created${NC}"

echo -e "\n${YELLOW}Step 2: Deploying Edge Function...${NC}"
echo "⚠️  Run manually: supabase functions deploy create-worker"

echo -e "\n${YELLOW}Step 3: Creating test user (boss)...${NC}"
echo "⚠️  Go to Supabase Dashboard → Authentication → Users"
echo "   Create user: admin@ponto.home / YourPassword123!"

echo -e "\n${YELLOW}Step 4: Creating storage bucket...${NC}"
echo "⚠️  Go to Supabase Dashboard → Storage → Buckets"
echo "   Create bucket: time-photos (public: false)"

echo -e "\n${YELLOW}Step 5: Testing database connection...${NC}"

# Test SQL connection
if command -v psql &> /dev/null; then
  PSQL_RESULT=$(psql "${SUPABASE_URL//https:\/\//postgresql://anon:${SUPABASE_ANON_KEY}@${SUPABASE_URL//https:\/\//}:5432/postgres}" -c "SELECT 1;" 2>&1)
  if [[ $PSQL_RESULT == *"1 row"* ]]; then
    echo -e "${GREEN}✓ Database connection OK${NC}"
  else
    echo -e "${RED}✗ Database connection failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  psql not found, skipping DB test${NC}"
fi

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy Edge Function: supabase functions deploy create-worker"
echo "2. Create storage bucket: time-photos"
echo "3. Create boss user in Supabase Auth"
echo "4. Run: pnpm dev:web"
echo "5. Run: pnpm dev:mobile"
echo ""
