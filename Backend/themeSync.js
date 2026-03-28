const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'Frontend', 'src', 'AdminDashboard.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Dashboard Background
css = css.replace(/background: #f0f2f5;/g, 'background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);');

// 2. Sidebar Container
css = css.replace(/background: #1a1d2e;/g, 'background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);\n  border-right: 1px solid #e1e4e8;');

// 3. Sidebar Header (Purple Gradient -> White/Light Cyan header)
// Actually if I make the header cyan, the text needs to be white.
css = css.replace(/background: linear-gradient\(135deg, #667eea 0%, #764ba2 100%\);/g, 'background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);');

// 4. Sidebar Nav Text and Hover
css = css.replace(/color: rgba\(255, 255, 255, 0.7\);/g, 'color: #6b7280;');
css = css.replace(/background: rgba\(255, 255, 255, 0.05\);/g, 'background: #f3f4f6;');

// Custom replace hover color to dark text, and active color to white text
css = css.replace(/\.admin-sidebar \.sidebar-nav button:hover \{\s*background: #f3f4f6;\s*color: #fff;\s*\}/g, '.admin-sidebar .sidebar-nav button:hover {\n  background: #f3f4f6;\n  color: #111827;\n}');
css = css.replace(/background: linear-gradient\(90deg, rgba\(102, 126, 234, 0.2\) 0%, transparent 100%\);/g, 'background: #00bcd4;');

// 5. Replace all other occurrences of the main purple accent (#667eea) to Cyan (#00bcd4)
css = css.replace(/#667eea/gi, '#00bcd4');
css = css.replace(/rgba\(102, 126, 234, /gi, 'rgba(0, 188, 212, ');

// 6. Sidebar logout button specifically
css = css.replace(/\.admin-sidebar \.logout-btn \{\s*width: 100%;\s*padding: 12px;\s*background: #f3f4f6;\s*border: 1px solid rgba\(255, 255, 255, 0.1\);\s*border-radius: 8px;\s*color: #6b7280;/g, 
  '.admin-sidebar .logout-btn {\n  width: 100%;\n  padding: 12px;\n  background: #fef2f2;\n  border: 1px solid #fecaca;\n  border-radius: 8px;\n  color: #ef4444;');
  
// 7. Remove active sidebar line (it doesn't fit the button theme anymore)
css = css.replace(/background: linear-gradient\(135deg, #00bcd4 0%, #764ba2 100%\);/g, 'background: transparent;');

fs.writeFileSync(cssPath, css);
console.log('✅ Admin Theme CSS successfully migrated to Seller Theme!');
