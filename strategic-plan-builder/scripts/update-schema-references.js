#!/usr/bin/env node

/**
 * Script to update all database table references to use the new strategic_plan_builder schema
 * 
 * This script will:
 * 1. Find all .from('tablename') calls
 * 2. Update them to use the new schema if needed
 * 3. Report all changes made
 * 
 * Usage: node scripts/update-schema-references.js
 */

const fs = require('fs');
const path = require('path');

// Files that need to be updated (based on our grep results)
const filesToUpdate = [
  'app/api/districts/[slug]/route.ts',
  'app/api/districts/[slug]/goals/route.ts', 
  'app/api/districts/[slug]/goals/next-number/route.ts',
  'app/api/districts/[slug]/update/route.ts',
  'app/api/districts/[slug]/metrics/route.ts',
  'app/api/districts/route.ts',
  'app/signup/page.tsx',
  'lib/db-service.ts',
  'scripts/cleanup-database.js',
  'scripts/setup-supabase-rls.js'
];

// Table mappings - since we're using schema configuration in client, we just keep table names simple
const tableMappings = {
  'districts': 'districts',
  'goals': 'goals', 
  'metrics': 'metrics'
};

function updateFileReferences(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  let changes = [];

  // Update .from() calls - these should remain the same since we configured schema in client
  // But let's make sure they're clean
  const fromRegex = /\.from\(['"](districts|goals|metrics)['"]\)/g;
  content = content.replace(fromRegex, (match, tableName) => {
    const newTableName = tableMappings[tableName];
    if (newTableName && newTableName !== tableName) {
      changes.push(`${tableName} -> ${newTableName}`);
      modified = true;
      return `.from('${newTableName}')`;
    }
    return match;
  });

  // For cleanup script, we need to handle direct SQL table references
  if (filePath.includes('cleanup-database.js') || filePath.includes('setup-supabase-rls.js')) {
    // Update direct table references in these scripts to use schema prefix
    const directTableRegex = /(ALTER TABLE|DROP POLICY.*ON|CREATE POLICY.*ON|GRANT.*ON)\s+(districts|goals|metrics)/gi;
    content = content.replace(directTableRegex, (match, command, tableName) => {
      changes.push(`Direct table reference: ${tableName} -> strategic_plan_builder.${tableName}`);
      modified = true;
      return `${command} strategic_plan_builder.${tableName}`;
    });
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
    changes.forEach(change => console.log(`   - ${change}`));
  } else {
    console.log(`✓ No changes needed for ${filePath}`);
  }
}

function main() {
  console.log('🔄 Updating schema references...\n');
  
  filesToUpdate.forEach(updateFileReferences);
  
  console.log('\n🎉 Schema reference update completed!');
  console.log('\nNext steps:');
  console.log('1. Run the SQL script in Supabase Dashboard: scripts/create-schema.sql');
  console.log('2. Restart your application to use the new schema');
  console.log('3. Test the application functionality');
}

if (require.main === module) {
  main();
}

module.exports = { updateFileReferences };