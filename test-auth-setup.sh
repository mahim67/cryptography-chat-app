#!/bin/bash

# Authentication Middleware Test Script
echo "🔐 Testing Authentication Middleware Setup..."
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if API server is running
check_api_server() {
    echo -e "${YELLOW}Checking API server...${NC}"
    
    if curl -s -f "http://localhost:3033/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API Server is running on port 3033${NC}"
        return 0
    else
        echo -e "${RED}❌ API Server is not running on port 3033${NC}"
        echo -e "${YELLOW}💡 Start the API server with: cd /var/www/criptography && npm run dev${NC}"
        return 1
    fi
}

# Function to check Next.js dependencies
check_dependencies() {
    echo -e "${YELLOW}Checking Next.js dependencies...${NC}"
    
    cd /var/www/cryptography-chat-app
    
    if npm list jsonwebtoken > /dev/null 2>&1; then
        echo -e "${GREEN}✅ jsonwebtoken package installed${NC}"
    else
        echo -e "${RED}❌ jsonwebtoken package missing${NC}"
        echo -e "${YELLOW}💡 Install with: npm install jsonwebtoken${NC}"
    fi
    
    if npm list axios > /dev/null 2>&1; then
        echo -e "${GREEN}✅ axios package installed${NC}"
    else
        echo -e "${RED}❌ axios package missing${NC}"
        echo -e "${YELLOW}💡 Install with: npm install axios${NC}"
    fi
}

# Function to check environment variables
check_env_vars() {
    echo -e "${YELLOW}Checking environment variables...${NC}"
    
    if [ -f "/var/www/cryptography-chat-app/.env.local" ]; then
        echo -e "${GREEN}✅ .env.local file exists${NC}"
        
        if grep -q "NEXT_PUBLIC_API_BASE_URL" /var/www/cryptography-chat-app/.env.local; then
            echo -e "${GREEN}✅ NEXT_PUBLIC_API_BASE_URL is set${NC}"
        else
            echo -e "${RED}❌ NEXT_PUBLIC_API_BASE_URL is missing${NC}"
        fi
    else
        echo -e "${RED}❌ .env.local file missing${NC}"
        echo -e "${YELLOW}💡 Create .env.local with API_BASE_URL${NC}"
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    echo -e "${YELLOW}Testing API endpoints...${NC}"
    
    # Test health endpoint
    if curl -s -f "http://localhost:3033/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health endpoint working${NC}"
    else
        echo -e "${RED}❌ Health endpoint not accessible${NC}"
    fi
    
    # Test profile endpoint (should return 401 without token)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3033/api/profile")
    if [ "$HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}✅ Profile endpoint properly protected${NC}"
    else
        echo -e "${RED}❌ Profile endpoint protection issue (got $HTTP_CODE)${NC}"
    fi
}

# Function to check file structure
check_file_structure() {
    echo -e "${YELLOW}Checking file structure...${NC}"
    
    FILES=(
        "/var/www/cryptography-chat-app/middleware.js"
        "/var/www/cryptography-chat-app/lib/auth-utils.js"
        "/var/www/cryptography-chat-app/lib/api-health.js"
        "/var/www/cryptography-chat-app/contexts/AuthContext.js"
        "/var/www/cryptography-chat-app/services/auth-service.js"
        "/var/www/cryptography-chat-app/hooks/useAuthExtended.js"
    )
    
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}✅ $(basename $file) exists${NC}"
        else
            echo -e "${RED}❌ $(basename $file) missing${NC}"
        fi
    done
}

# Main execution
echo -e "${YELLOW}Starting comprehensive auth middleware test...${NC}"
echo ""

check_file_structure
echo ""

check_dependencies
echo ""

check_env_vars
echo ""

check_api_server
API_RUNNING=$?
echo ""

if [ $API_RUNNING -eq 0 ]; then
    test_api_endpoints
    echo ""
fi

echo -e "${YELLOW}======================================"
echo -e "🏁 Test Summary:"
echo -e "======================================"

if [ $API_RUNNING -eq 0 ]; then
    echo -e "${GREEN}✅ Authentication middleware setup appears to be working!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Start Next.js dev server: ${GREEN}cd /var/www/cryptography-chat-app && npm run dev${NC}"
    echo -e "2. Test login/logout functionality"
    echo -e "3. Check middleware protection on protected routes"
else
    echo -e "${RED}❌ Issues found. Please fix the API server connection first.${NC}"
fi

echo ""
