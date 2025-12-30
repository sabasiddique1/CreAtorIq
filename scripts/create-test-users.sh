#!/bin/bash

# Script to create test users for production testing
# Usage: ./scripts/create-test-users.sh [local|prod]

ENV=${1:-local}

if [ "$ENV" = "prod" ]; then
  API_URL="https://crreator-iq.vercel.app"
  echo "Creating users in PRODUCTION: $API_URL"
else
  API_URL="http://localhost:3001"
  echo "Creating users in LOCAL: $API_URL"
fi

echo ""
echo "Creating test users..."
echo ""

# 1. Create Admin User
echo "1. Creating Admin user..."
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Register($email: String!, $password: String!, $name: String!, $role: String) { register(email: $email, password: $password, name: $name, role: $role) { user { _id email name role } } }",
    "variables": {
      "email": "admin@test.com",
      "password": "admin123",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }')

if echo "$ADMIN_RESPONSE" | grep -q "errors"; then
  echo "❌ Admin user creation failed:"
  echo "$ADMIN_RESPONSE" | grep -o '"message":"[^"]*"' | head -1
else
  echo "✅ Admin user created successfully!"
  echo "   Email: admin@test.com"
  echo "   Password: admin123"
  echo "   Role: ADMIN"
fi

echo ""

# 2. Create Creator User
echo "2. Creating Creator user..."
CREATOR_RESPONSE=$(curl -s -X POST "$API_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Register($email: String!, $password: String!, $name: String!, $role: String) { register(email: $email, password: $password, name: $name, role: $role) { user { _id email name role } } }",
    "variables": {
      "email": "creator@test.com",
      "password": "creator123",
      "name": "Creator User",
      "role": "CREATOR"
    }
  }')

if echo "$CREATOR_RESPONSE" | grep -q "errors"; then
  echo "❌ Creator user creation failed:"
  echo "$CREATOR_RESPONSE" | grep -o '"message":"[^"]*"' | head -1
else
  echo "✅ Creator user created successfully!"
  echo "   Email: creator@test.com"
  echo "   Password: creator123"
  echo "   Role: CREATOR"
fi

echo ""

# 3. Create Subscriber User
echo "3. Creating Subscriber user..."
SUBSCRIBER_RESPONSE=$(curl -s -X POST "$API_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Register($email: String!, $password: String!, $name: String!, $role: String) { register(email: $email, password: $password, name: $name, role: $role) { user { _id email name role } } }",
    "variables": {
      "email": "subscriber@test.com",
      "password": "subscriber123",
      "name": "Subscriber User",
      "role": "SUBSCRIBER_T1"
    }
  }')

if echo "$SUBSCRIBER_RESPONSE" | grep -q "errors"; then
  echo "❌ Subscriber user creation failed:"
  echo "$SUBSCRIBER_RESPONSE" | grep -o '"message":"[^"]*"' | head -1
else
  echo "✅ Subscriber user created successfully!"
  echo "   Email: subscriber@test.com"
  echo "   Password: subscriber123"
  echo "   Role: SUBSCRIBER_T1"
fi

echo ""
echo "=========================================="
echo "Test Users Created!"
echo "=========================================="
echo ""
echo "Admin:"
echo "  Email: admin@test.com"
echo "  Password: admin123"
echo ""
echo "Creator:"
echo "  Email: creator@test.com"
echo "  Password: creator123"
echo ""
echo "Subscriber:"
echo "  Email: subscriber@test.com"
echo "  Password: subscriber123"
echo ""

