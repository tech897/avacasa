#!/bin/bash

# Fix all route files to use await params
find src/app/api -name "route.ts" -exec sed -i '' 's/params\.id/id/g' {} \;
find src/app/api -name "route.ts" -exec sed -i '' 's/params\.slug/slug/g' {} \;

# Add const { id } = await params where needed
files_with_id_params=$(find src/app/api -name "route.ts" -exec grep -l "Promise<{ id: string }>" {} \;)
for file in $files_with_id_params; do
    if ! grep -q "const { id } = await params" "$file"; then
        sed -i '' '/const admin = await getAdminFromRequest(request)/a\
\
    const { id } = await params' "$file"
    fi
done

# Add const { slug } = await params where needed  
files_with_slug_params=$(find src/app/api -name "route.ts" -exec grep -l "Promise<{ slug: string }>" {} \;)
for file in $files_with_slug_params; do
    if ! grep -q "const { slug } = await params" "$file"; then
        sed -i '' '/const admin = await getAdminFromRequest(request)/a\
\
    const { slug } = await params' "$file"
    fi
done

echo "Fixed all params issues in route files" 