#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to convert (all files with Prisma imports/usage)
const sourceFiles = [
  'src/app/api/**/*.ts',
  'src/lib/**/*.ts',
  'src/app/**/*.tsx',
  '!node_modules/**'
];

// Mass replacements for common patterns
const massReplacements = [
  // Remove Prisma imports completely
  {
    pattern: /import\s*{\s*prisma\s*}\s*from\s*['"]@?\/lib\/db['"];\s*\n?/g,
    replacement: ''
  },
  {
    pattern: /import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"];\s*\n?/g,
    replacement: ''
  },
  
  // Add MongoDB imports where needed
  {
    pattern: /(import.*from\s*['"]next\/server['"];\s*\n)/,
    replacement: '$1import { getDatabase } from "@/lib/db";\nimport { ObjectId } from "mongodb";\n'
  },
  
  // Replace common Prisma patterns
  {
    pattern: /const\s+(\w+)\s*=\s*await\s+prisma\.(\w+)\.findUnique\(\s*{\s*where:\s*{\s*id:\s*([^}]+)\s*}\s*}\s*\)/g,
    replacement: 'const db = await getDatabase();\n    const $1 = await db.collection("$2s").findOne({ _id: new ObjectId($3) })'
  },
  
  {
    pattern: /const\s+(\w+)\s*=\s*await\s+prisma\.(\w+)\.findMany\(\s*\)/g,
    replacement: 'const db = await getDatabase();\n    const $1 = await db.collection("$2s").find({}).toArray()'
  },
  
  {
    pattern: /const\s+(\w+)\s*=\s*await\s+prisma\.(\w+)\.count\(\s*\)/g,
    replacement: 'const db = await getDatabase();\n    const $1 = await db.collection("$2s").countDocuments()'
  },
  
  {
    pattern: /await\s+prisma\.(\w+)\.create\(\s*{\s*data:\s*([^}]+)\s*}\s*\)/g,
    replacement: 'await db.collection("$1s").insertOne({ ...$2, createdAt: new Date(), updatedAt: new Date() })'
  },
  
  {
    pattern: /await\s+prisma\.(\w+)\.update\(\s*{\s*where:\s*{\s*id:\s*([^}]+)\s*},\s*data:\s*([^}]+)\s*}\s*\)/g,
    replacement: 'await db.collection("$1s").updateOne({ _id: new ObjectId($2) }, { $set: { ...$3, updatedAt: new Date() } })'
  },
  
  {
    pattern: /await\s+prisma\.(\w+)\.delete\(\s*{\s*where:\s*{\s*id:\s*([^}]+)\s*}\s*}\s*\)/g,
    replacement: 'await db.collection("$1s").deleteOne({ _id: new ObjectId($2) })'
  }
];

// Collection name mappings
const collectionMappings = {
  'blogPosts': 'blog_posts',
  'userActivities': 'user_activities', 
  'pageViews': 'page_views',
  'contactSubmissions': 'contact_submissions',
  'userFavorites': 'user_favorites'
};

function getAllFiles() {
  let allFiles = [];
  sourceFiles.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: '!node_modules/**' });
    allFiles = allFiles.concat(files);
  });
  return [...new Set(allFiles)]; // Remove duplicates
}

function convertFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Skip if file doesn't contain prisma
  if (!content.includes('prisma')) {
    return;
  }
  
  console.log(`Converting ${filePath}...`);
  
  // Apply mass replacements
  massReplacements.forEach(({ pattern, replacement }) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) hasChanges = true;
  });
  
  // Apply collection mappings
  Object.entries(collectionMappings).forEach(([original, mapped]) => {
    const pattern = new RegExp(`collection\\("${original}"\\)`, 'g');
    content = content.replace(pattern, `collection("${mapped}")`);
  });
  
  // Remove remaining prisma references that couldn't be auto-converted
  content = content.replace(/\bprisma\.\w+/g, '/* TODO: Convert this Prisma call */');
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Converted ${filePath}`);
  }
}

// Run conversion
console.log('🚀 Starting mass Prisma to MongoDB conversion...\n');

const allFiles = getAllFiles();
console.log(`Found ${allFiles.length} files to process\n`);

allFiles.forEach(convertFile);

console.log('\n✅ Mass conversion complete!');
console.log('⚠️  Please review files with "TODO: Convert this Prisma call" comments');
