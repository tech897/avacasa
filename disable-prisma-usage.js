#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all TypeScript files that contain prisma usage
const { execSync } = require('child_process');

function disablePrismaInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if file doesn't contain prisma
  if (!content.includes('prisma.')) {
    return;
  }
  
  console.log(`Disabling Prisma usage in ${filePath}...`);
  
  // Comment out any remaining prisma calls
  content = content.replace(/(\s+)(.*prisma\..+)/g, '$1// TODO: Convert to MongoDB - $2');
  
  // Add early return for API routes that heavily use Prisma
  if (filePath.includes('/api/') && content.includes('TODO: Convert to MongoDB')) {
    const functionMatch = content.match(/(export\s+async\s+function\s+\w+[^{]*{)/);
    if (functionMatch) {
      content = content.replace(
        functionMatch[1],
        `${functionMatch[1]}\n  // TODO: This route needs MongoDB conversion\n  return NextResponse.json({ error: 'Route temporarily disabled during MongoDB migration' }, { status: 503 });`
      );
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Disabled Prisma in ${filePath}`);
}

try {
  // Get list of files with Prisma usage
  const result = execSync('grep -r "prisma\\." src/ --include="*.ts" --include="*.tsx" -l', { encoding: 'utf8' });
  const files = result.trim().split('\n').filter(f => f);
  
  console.log(`Found ${files.length} files with Prisma usage to disable:\n`);
  
  files.forEach(disablePrismaInFile);
  
  console.log('\n✅ All Prisma usage disabled!');
  console.log('🚀 The app should now build without Prisma errors.');
  console.log('📝 Admin routes are temporarily disabled with 503 responses.');
  
} catch (error) {
  console.error('Error:', error.message);
}
