const fs = require('fs');

let css = fs.readFileSync('Frontend/src/SellerDashboard.css', 'utf8');

console.log('Original file size:', css.length);

// Fix all incomplete rgba values
// Replace "rgba(0;" with "rgba(0,0,0,0.08);"
css = css.replace(/rgba\(0;/g, 'rgba(0,0,0,0.08)');

// Fix any other incomplete rgba patterns
css = css.replace(/rgba\(0\s*,\s*0\s*,\s*0\s*;/g, 'rgba(0,0,0,0.08)');

console.log('Fixed file size:', css.length);

// Count remaining issues
const remaining = (css.match(/rgba\([^)]*;/g) || []).length;
console.log('Remaining incomplete rgba:', remaining);

fs.writeFileSync('Frontend/src/SellerDashboard.css', css, 'utf8');

console.log('CSS file fixed!');
