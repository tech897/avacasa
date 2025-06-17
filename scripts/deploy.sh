#!/bin/bash

# Deployment script for Vercel
echo "🚀 Starting deployment process..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (for SQLite this creates the database file)
echo "🗄️  Setting up database..."
npx prisma db push --accept-data-loss

echo "✅ Deployment setup complete!" 