const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Frontend', 'src', 'SellerDashboard.css');

console.log('Reading SellerDashboard.css...');
let content = fs.readFileSync(filePath, 'utf8');

// Remove all .inline-style-* blocks
content = content.replace(/\.seller-container\s+\.inline-style-\d+\s*\{[^}]*\}/gs, '');

// Clean up multiple empty lines
content = content.replace(/\n{3,}/g, '\n\n');

console.log('Writing cleaned content...');
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Removed all inline-style blocks from SellerDashboard.css');
