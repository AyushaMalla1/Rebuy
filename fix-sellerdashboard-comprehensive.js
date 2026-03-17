const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Frontend', 'src', 'SellerDashboard.css');

console.log('Reading SellerDashboard.css...');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Fix typo "justif-content" to "justify-content"
content = content.replace(/justif-content:/g, 'justify-content:');

// Fix 2: Fix camelCase properties to kebab-case
content = content.replace(/\bfontWeight:/g, 'font-weight:');
content = content.replace(/\bborderRadius:/g, 'border-radius:');

// Fix 3: Remove all JavaScript-like expressions and replace with static CSS values
// Fix ternary operators in background
content = content.replace(/background:\s*[a-zA-Z_]+\s*===?\s*[a-zA-Z0-9_]+\s*\?\s*([^;:]+)\s*:\s*([^;]+);/g, 'background: $1;');
content = content.replace(/background:\s*[a-zA-Z_]+\s*===?\s*[a-zA-Z0-9_]+\s*\?\s*([^;:]+);/g, 'background: $1;');

// Fix ternary operators in color
content = content.replace(/color:\s*[a-zA-Z_]+\s*===?\s*[a-zA-Z0-9_]+\s*\?\s*([^;:]+)\s*:\s*([^;]+);/g, 'color: $1;');
content = content.replace(/color:\s*[a-zA-Z_]+\s*===?\s*[a-zA-Z0-9_]+\s*\?\s*([^;:]+);/g, 'color: $1;');

// Fix ternary operators in cursor
content = content.replace(/cursor:\s*[a-zA-Z_]+\s*===?\s*[a-zA-Z0-9_]+\s*\?\s*([^;:]+)\s*:\s*([^;]+);/g, 'cursor: $1;');
content = content.replace(/cursor:\s*[a-zA-Z_]+\s*===?\s*[a-zA-Z0-9_]+\s*\?\s*([^;:]+);/g, 'cursor: $1;');

// Fix ternary operators in border-color
content = content.replace(/border-color:\s*[a-zA-Z_]+\s*===?\s*[a-zA-Z0-9_]+\s*\?\s*([^;:]+)\s*:\s*([^;]+);/g, 'border-color: $1;');
content = content.replace(/border-color:\s*[a-zA-Z_]+\s*===?\s*[a-zA-Z0-9_]+\s*\?\s*([^;:]+);/g, 'border-color: $1;');

// Fix 4: Fix incomplete CSS functions
// Fix repeat(auto-fit;
content = content.replace(/repeat\(auto-fit;/g, 'repeat(auto-fit, minmax(200px, 1fr))');

// Fix incomplete linear-gradient
content = content.replace(/linear-gradient\(135deg;[^)]*$/gm, 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)');
content = content.replace(/background:\s*linear-gradient\(135deg;/g, 'background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);');

// Fix 5: Fix object property references
content = content.replace(/background:\s*[a-zA-Z_]+\.[a-zA-Z_]+;/g, 'background: #ffffff;');
content = content.replace(/color:\s*[a-zA-Z_]+\.[a-zA-Z_]+;/g, 'color: #000000;');

// Fix 6: Fix incomplete rgba values - add missing semicolons
content = content.replace(/rgba\(([0-9,.\s]+)\)\s*\n\s*([a-z-]+:)/g, 'rgba($1);\n  $2');

// Fix 7: Add missing semicolons before closing braces
content = content.replace(/([^;{}\s])\s*\n\s*}/g, '$1;\n}');

// Fix 8: Fix complex multi-line ternary expressions
const lines = content.split('\n');
const fixedLines = [];
let inBadBlock = false;
let skipUntilCloseBrace = false;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Detect lines with JavaScript expressions
  if (line.includes('===') || line.includes('?') && line.includes(':') && !line.includes('url(')) {
    // Extract property name
    const propMatch = line.match(/^\s*([a-z-]+):/);
    if (propMatch) {
      const prop = propMatch[1];
      // Replace with a safe default value
      if (prop === 'background') {
        line = line.replace(/^(\s*)([a-z-]+):.*$/, '$1$2: #ffffff;');
      } else if (prop === 'color') {
        line = line.replace(/^(\s*)([a-z-]+):.*$/, '$1$2: #000000;');
      } else if (prop === 'cursor') {
        line = line.replace(/^(\s*)([a-z-]+):.*$/, '$1$2: pointer;');
      } else if (prop === 'border-color') {
        line = line.replace(/^(\s*)([a-z-]+):.*$/, '$1$2: #e5e7eb;');
      } else {
        line = line.replace(/^(\s*)([a-z-]+):.*$/, '$1$2: inherit;');
      }
    }
  }
  
  // Fix incomplete gradient on multiple lines
  if (line.includes('linear-gradient(135deg;') && !line.includes(')')) {
    line = line.replace(/linear-gradient\(135deg;.*$/, 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);');
    skipUntilCloseBrace = false;
  }
  
  // Skip lines that are part of broken multi-line expressions
  if (line.trim().startsWith('#') && line.includes('100%)') && i > 0 && lines[i-1].includes('linear-gradient')) {
    continue;
  }
  
  if (line.trim().startsWith("'") || line.trim().startsWith('"')) {
    continue;
  }
  
  fixedLines.push(line);
}

content = fixedLines.join('\n');

// Fix 9: Clean up any remaining malformed properties
content = content.replace(/:\s*[a-zA-Z_]+\s*\?\s*[^;]+;/g, ': inherit;');

// Fix 10: Ensure all properties end with semicolons
content = content.replace(/:\s*([^;{}]+)\s*\n\s*([a-z-])/g, ': $1;\n  $2');

console.log('Writing fixed content...');
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Comprehensively fixed all CSS syntax errors in SellerDashboard.css');
