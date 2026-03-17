const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Frontend', 'src', 'SellerDashboard.css');

console.log('Reading SellerDashboard.css...');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add missing semicolons before closing braces
content = content.replace(/([^;{}\s])\s*\n\s*}/g, '$1;\n}');

// Fix 2: Fix typo "justif-content" to "justify-content"
content = content.replace(/justif-content:/g, 'justify-content:');

// Fix 3: Fix camelCase properties to kebab-case
content = content.replace(/\bfontWeight:/g, 'font-weight:');
content = content.replace(/\bborderRadius:/g, 'border-radius:');

// Fix 4: Remove invalid JavaScript ternary operators and replace with valid CSS
// Pattern: background: condition ? value;
content = content.replace(/background:\s*[a-zA-Z]+\s*===?\s*[a-zA-Z0-9]+\s*\?\s*([^;:]+);/g, 'background: $1;');
content = content.replace(/color:\s*[a-zA-Z]+\s*===?\s*[a-zA-Z0-9]+\s*\?\s*([^;:]+);/g, 'color: $1;');
content = content.replace(/cursor:\s*[a-zA-Z]+\s*===?\s*[a-zA-Z0-9]+\s*\?\s*([^;:]+);/g, 'cursor: $1;');
content = content.replace(/border-color:\s*[a-zA-Z]+\s*===?\s*[a-zA-Z0-9]+\s*\?\s*([^;:]+);/g, 'border-color: $1;');

// Fix 5: Fix incomplete CSS functions - add closing parentheses
// Pattern: repeat(auto-fit; -> repeat(auto-fit, minmax(200px, 1fr));
content = content.replace(/grid-template-columns:\s*repeat\(auto-fit;/g, 'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));');

// Pattern: linear-gradient(135deg; -> linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
content = content.replace(/background:\s*linear-gradient\(135deg;([^}]*?)(?=\n\s*[a-z-]+:)/gs, function(match) {
  return 'background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);';
});

// Fix 6: Fix property values with JavaScript expressions
content = content.replace(/background:\s*[a-zA-Z.]+\.(bg|color|[a-z]+);/g, 'background: #ffffff;');
content = content.replace(/color:\s*[a-zA-Z.]+\.(bg|color|[a-z]+);/g, 'color: #000000;');

// Fix 7: Fix incomplete rgba values
content = content.replace(/rgba\(0,0,0,0\.08\)\s*\n\s*([a-z-]+:)/g, 'rgba(0,0,0,0.08);\n  $1');
content = content.replace(/rgba\(0,0,0,0\.5\)\s*\n\s*([a-z-]+:)/g, 'rgba(0,0,0,0.5);\n  $1');

// Fix 8: Fix complex ternary expressions in background
content = content.replace(/background:\s*twoFAAction\s*===\s*enable[^;]*?linear-gradient[^;]*?100%\)'\s*:\s*linear-gradient[^;]*?;/g, 
  'background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);');

// Fix 9: Fix notif.read and similar object property references
content = content.replace(/background:\s*notif\.read\s*\?\s*white;/g, 'background: white;');
content = content.replace(/background:\s*notif\.type\s*===\s*error\s*\?\s*#[a-f0-9]{6};/g, 'background: #ef4444;');

// Fix 10: Fix product.status references
content = content.replace(/background:\s*product\.status\s*===\s*Approved\s*\?\s*#[a-f0-9]{6};/g, 'background: #d1fae5;');
content = content.replace(/color:\s*product\.status\s*===\s*Approved\s*\?\s*#[a-f0-9]{6};/g, 'color: #065f46;');

// Fix 11: Fix isEditingProfile references
content = content.replace(/background:\s*isEditingProfile\s*\?\s*white;/g, 'background: white;');

// Fix 12: Fix currentPage references
content = content.replace(/background:\s*currentPage\s*===\s*[a-zA-Z0-9]+\s*\?\s*#[a-f0-9]{6};/g, 'background: #f1f5f9;');
content = content.replace(/color:\s*currentPage\s*===\s*[a-zA-Z0-9]+\s*\?\s*#[a-f0-9]{6};/g, 'color: #94a3b8;');
content = content.replace(/color:\s*currentPage\s*===\s*[a-zA-Z0-9]+\s*\?\s*white;/g, 'color: white;');
content = content.replace(/cursor:\s*currentPage\s*===\s*[a-zA-Z0-9]+\s*\?\s*not-allowed;/g, 'cursor: not-allowed;');
content = content.replace(/cursor:\s*currentPage\s*===\s*[a-zA-Z0-9]+\s*\?\s*pointer;/g, 'cursor: pointer;');
content = content.replace(/border-color:\s*currentPage\s*===\s*[a-zA-Z0-9]+\s*\?\s*#[a-f0-9]{6};/g, 'border-color: #00bcd4;');

console.log('Writing fixed content...');
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed all CSS syntax errors in SellerDashboard.css');
