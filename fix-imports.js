const fs = require('fs');

const files = [
  'src/app/api/contact/route.ts',
  'src/app/api/newsletter/subscribe/route.ts', 
  'src/app/api/ratings/featured/route.ts',
  'src/app/api/track/route.ts',
  'src/app/api/user/delete/route.ts',
  'src/app/api/user/favorites/route.ts',
  'src/app/api/user/profile/route.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /import\s*{\s*prisma\s*}\s*from\s*['"]@\/lib\/db['"]/g,
      'import { getDatabase } from "@/lib/db"\nimport { ObjectId } from "mongodb"'
    );
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});

console.log('All imports fixed!');
