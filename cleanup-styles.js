const fs = require('fs');

let jsContent = fs.readFileSync('Frontend/src/SellerDashboard.js', 'utf8');
let cssContent = fs.readFileSync('Frontend/src/SellerDashboard.css', 'utf8');

// Map of inline styles to CSS classes
const styleMap = new Map();
let classCounter = 1;

// Extract and replace inline styles
function extractAndReplace(content) {
  const styleRegex = /style=\{\{([^}]+(?:\{[^}]*\}[^}]*)*)\}\}/g;
  
  return content.replace(styleRegex, (match, styleContent) => {
    // Generate a unique class name
    const className = `inline-style-${classCounter++}`;
    
    // Convert JS object notation to CSS
    const cssRules = styleContent
      .split(',')
      .map(rule => {
        const [key, value] = rule.split(':').map(s => s.trim());
        if (!key || !value) return '';
        
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        // Remove quotes from value
        const cssValue = value.replace(/['"]/g, '');
        
        return `  ${cssKey}: ${cssValue};`;
      })
      .filter(r => r)
      .join('\n');
    
    // Store the CSS rule
    styleMap.set(className, cssRules);
    
    return `className="${className}"`;
  });
}

// Process the JS file
const newJsContent = extractAndReplace(jsContent);

// Generate CSS
let newCssRules = '\n\n/* Auto-generated from inline styles */\n';
styleMap.forEach((rules, className) => {
  newCssRules += `.seller-container .${className} {\n${rules}\n}\n\n`;
});

// Write files
fs.writeFileSync('Frontend/src/SellerDashboard.js', newJsContent, 'utf8');
fs.writeFileSync('Frontend/src/SellerDashboard.css', cssContent + newCssRules, 'utf8');

console.log(`Converted ${styleMap.size} inline styles to CSS classes`);
console.log('Files updated successfully!');
