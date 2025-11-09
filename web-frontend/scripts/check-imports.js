/**
 * Script to check for missing Chakra UI imports
 * Run with: node scripts/check-imports.js
 */
const fs = require('fs');
const path = require('path');

const CHAKRA_COMPONENTS = ['Box', 'Button', 'Text', 'Heading', 'Spinner', 'VStack', 'HStack', 'Container', 'Grid', 'SimpleGrid'];
const SRC_DIR = path.join(__dirname, '..', 'src');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = content.match(/from ['"]@chakra-ui\/react['"]/);
  
  if (!imports) return [];
  
  const importLine = content.split('\n').find(line => line.includes('@chakra-ui/react'));
  const importedComponents = importLine
    ? importLine.match(/\{([^}]+)\}/)?.[1].split(',').map(c => c.trim())
    : [];
  
  const usedComponents = [];
  CHAKRA_COMPONENTS.forEach(component => {
    // Check for JSX usage: <Component or Component.
    const jsxPattern = new RegExp(`<${component}[\\s>]|\\b${component}\\.`, 'g');
    if (jsxPattern.test(content) && !importedComponents.includes(component)) {
      usedComponents.push(component);
    }
  });
  
  return usedComponents;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('Checking for missing Chakra UI imports...\n');

const files = walkDir(SRC_DIR);
const issues = [];

files.forEach(file => {
  const missing = checkFile(file);
  if (missing.length > 0) {
    const relativePath = path.relative(SRC_DIR, file);
    issues.push({ file: relativePath, missing });
  }
});

if (issues.length === 0) {
  console.log('✅ All imports are correct!');
} else {
  console.log(`❌ Found ${issues.length} file(s) with missing imports:\n`);
  issues.forEach(({ file, missing }) => {
    console.log(`  ${file}`);
    console.log(`    Missing: ${missing.join(', ')}\n`);
  });
  process.exit(1);
}

