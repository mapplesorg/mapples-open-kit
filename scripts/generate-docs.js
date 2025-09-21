#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packages = [
  'action',
  'dnd', 
  'form',
  'render',
  'state',
  'style',
  'types',
  'ui'
];

const rootDir = process.cwd();
const docsDir = path.join(rootDir, 'docs');

// Clean docs directory
if (fs.existsSync(docsDir)) {
  fs.rmSync(docsDir, { recursive: true });
}
fs.mkdirSync(docsDir, { recursive: true });

// Generate docs for each package
packages.forEach(packageName => {
  const packageDir = path.join(rootDir, 'packages', '@mapples', packageName);
  const packageDocsDir = path.join(docsDir, packageName);
  
  if (fs.existsSync(packageDir)) {
    console.log(`Generating docs for @mapples/${packageName}...`);
    
    try {
      // Run the docs script for the individual package
      execSync(`cd "${packageDir}" && yarn docs`, { 
        stdio: 'inherit',
        cwd: packageDir 
      });
      
      // Move the generated docs to the main docs directory
      const packageDocsSource = path.join(packageDir, 'docs');
      if (fs.existsSync(packageDocsSource)) {
        fs.renameSync(packageDocsSource, packageDocsDir);
        console.log(`✓ Generated docs for @mapples/${packageName}`);
      }
    } catch (error) {
      console.warn(`⚠ Failed to generate docs for @mapples/${packageName}:`, error.message);
    }
  }
});

// Create main index file
const indexContent = `# Mapples Open Kit Documentation

This directory contains the generated API documentation for all packages in the Mapples Open Kit monorepo.

## Available Documentation

${packages.map(pkg => `- [@mapples/${pkg}](./${pkg}/README.md)`).join('\n')}

## Generating Documentation

To regenerate all documentation:

\`\`\`bash
yarn docs:all
\`\`\`

To generate documentation for a specific package:

\`\`\`bash
cd packages/@mapples/[package-name]
yarn docs
\`\`\`
`;

fs.writeFileSync(path.join(docsDir, 'README.md'), indexContent);

console.log('✓ Documentation generation complete!');
console.log(`📚 Documentation available at: ${docsDir}`);
