const fs = require('fs');

// Routes with Prisma usage that need to be temporarily disabled
const problematicRoutes = [
  'src/app/api/blog/[slug]/route.ts',
  'src/app/api/blog/categories/route.ts', 
  'src/app/api/blog/route.ts',
  'src/app/api/contact/route.ts',
  'src/app/api/newsletter/subscribe/route.ts',
  'src/app/api/ratings/featured/route.ts',
  'src/app/api/track/route.ts',
  'src/app/api/user/delete/route.ts',
  'src/app/api/user/favorites/route.ts',
  'src/app/api/user/profile/route.ts'
];

const createDisabledRoute = (methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) => {
  return `import { NextRequest, NextResponse } from 'next/server';

// TEMPORARILY DISABLED: This route is being migrated from Prisma to MongoDB
// TODO: Convert Prisma calls to MongoDB and re-enable

${methods.map(method => `
export async function ${method}(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This feature is temporarily unavailable during database migration',
      message: 'We are upgrading our systems. This feature will be restored soon.',
      status: 'maintenance'
    }, 
    { status: 503 }
  );
}`).join('\n')}
`;
};

console.log('🚀 Disabling problematic routes for immediate deployment...\n');

problematicRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    // Backup the original file
    const backupPath = route.replace('/route.ts', '/route.ts.backup');
    fs.copyFileSync(route, backupPath);
    
    // Determine which HTTP methods this route probably uses
    const content = fs.readFileSync(route, 'utf8');
    const methods = [];
    if (content.includes('export async function GET')) methods.push('GET');
    if (content.includes('export async function POST')) methods.push('POST');
    if (content.includes('export async function PUT')) methods.push('PUT');
    if (content.includes('export async function DELETE')) methods.push('DELETE');
    if (content.includes('export async function PATCH')) methods.push('PATCH');
    
    // If no methods found, default to GET and POST
    if (methods.length === 0) {
      methods.push('GET', 'POST');
    }
    
    // Create disabled route
    const disabledContent = createDisabledRoute(methods);
    fs.writeFileSync(route, disabledContent);
    
    console.log(`✅ Disabled ${route} (backed up to ${backupPath})`);
  } else {
    console.log(`⚠️  ${route} not found, skipping...`);
  }
});

console.log('\n🎯 All problematic routes disabled!');
console.log('📝 Original files backed up with .backup extension');
console.log('🚀 The application should now build and deploy successfully!');
console.log('⚙️  These routes will return 503 "Service Unavailable" during maintenance');
