const fs = require('fs');

let css = fs.readFileSync('Frontend/src/SellerDashboard.css', 'utf8');

console.log('Fixing missing semicolons...');

// Fix rgba values without semicolons at end of line
css = css.replace(/rgba\(0,0,0,0\.08\)(\s*\n)/g, 'rgba(0,0,0,0.08);$1');
css = css.replace(/rgba\(0,0,0,0\.15\)(\s*\n)/g, 'rgba(0,0,0,0.15);$1');
css = css.replace(/rgba\(0,0,0,0\.3\)(\s*\n)/g, 'rgba(0,0,0,0.3);$1');
css = css.replace(/rgba\(0,0,0,0\.5\)(\s*\n)/g, 'rgba(0,0,0,0.5);$1');
css = css.replace(/rgba\(0,0,0,0\.6\)(\s*\n)/g, 'rgba(0,0,0,0.6);$1');

// Fix any rgba without semicolon before closing brace or next property
css = css.replace(/rgba\([^)]+\)(\s*)([\n\r]\s*[a-z\-])/g, (match, space, next) => {
  if (!match.includes(';')) {
    return match.replace(/\)(\s*)([\n\r])/, ');$1$2');
  }
  return match;
});

fs.writeFileSync('Frontend/src/SellerDashboard.css', css, 'utf8');

console.log('CSS semicolons fixed!');
