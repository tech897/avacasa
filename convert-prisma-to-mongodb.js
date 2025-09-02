#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Critical files that are causing build errors (highest priority)
const criticalFiles = [
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/blog/route.ts',
  'src/app/api/admin/blog/[id]/route.ts', // Already converted
  'src/lib/auth.ts',
  'src/lib/auth-config.ts'
];

// Common Prisma patterns and their MongoDB replacements
const conversions = [
  // Import replacements
  {
    pattern: /import\s*{\s*prisma\s*}\s*from\s*['"]@\/lib\/db['"]/g,
    replacement: 'import { getDatabase } from "@/lib/db"\nimport { ObjectId } from "mongodb"'
  },
  {
    pattern: /import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"]/g,
    replacement: ''
  },
  
  // Basic CRUD operations
  {
    pattern: /prisma\.(\w+)\.findUnique\(\s*{\s*where:\s*{\s*id:\s*([^}]+)\s*}\s*}\s*\)/g,
    replacement: 'db.collection("$1s").findOne({ _id: new ObjectId($2) })'
  },
  {
    pattern: /prisma\.(\w+)\.findMany\(\)/g,
    replacement: 'db.collection("$1s").find({}).toArray()'
  },
  {
    pattern: /prisma\.(\w+)\.count\(\)/g,
    replacement: 'db.collection("$1s").countDocuments()'
  },
  {
    pattern: /prisma\.(\w+)\.create\(\s*{\s*data:\s*([^}]+)\s*}\s*\)/g,
    replacement: 'db.collection("$1s").insertOne({ ...$2, createdAt: new Date(), updatedAt: new Date() })'
  },
  {
    pattern: /prisma\.(\w+)\.update\(\s*{\s*where:\s*{\s*id:\s*([^}]+)\s*},\s*data:\s*([^}]+)\s*}\s*\)/g,
    replacement: 'db.collection("$1s").updateOne({ _id: new ObjectId($2) }, { $set: { ...$3, updatedAt: new Date() } })'
  },
  {
    pattern: /prisma\.(\w+)\.delete\(\s*{\s*where:\s*{\s*id:\s*([^}]+)\s*}\s*}\s*\)/g,
    replacement: 'db.collection("$1s").deleteOne({ _id: new ObjectId($2) })'
  }
];

// Table name mappings (Prisma model names to MongoDB collection names)
const tableNameMappings = {
  'blogPost': 'blog_posts',
  'admin': 'admins', 
  'user': 'users',
  'property': 'properties',
  'location': 'locations',
  'rating': 'ratings',
  'contactSubmission': 'contact_submissions',
  'subscriber': 'subscribers',
  'inquiry': 'inquiries'
};

function convertFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  console.log(`Converting ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply basic conversions
  conversions.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  // Apply table name mappings
  Object.entries(tableNameMappings).forEach(([prismaName, mongoName]) => {
    const regex = new RegExp(`collection\\("${prismaName}s"\\)`, 'g');
    content = content.replace(regex, `collection("${mongoName}")`);
  });
  
  // Add database connection at the beginning of functions that use db
  if (content.includes('db.collection(')) {
    const hasDbConnection = /const\s+db\s*=\s*await\s+getDatabase\(\)/.test(content);
    if (!hasDbConnection) {
      // Find first db.collection usage and add db connection before it
      const match = content.match(/(export\s+async\s+function\s+\w+[^{]*{[\s\S]*?)(\s+)(db\.collection)/);
      if (match) {
        content = content.replace(match[0], `${match[1]}${match[2]}const db = await getDatabase()\n${match[2]}${match[3]}`);
      }
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Converted ${filePath}`);
}

// Convert critical files first
console.log('🚀 Starting Prisma to MongoDB conversion...\n');

criticalFiles.forEach(convertFile);

console.log('\n✅ Critical files conversion complete!');
console.log('📝 You may need to manually adjust some complex queries and add proper error handling.');
