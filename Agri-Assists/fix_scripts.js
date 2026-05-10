const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the one in the head (used for chart.js in dashboard and finance)
    if (file === 'dashboard.html' || file === 'finance.html') {
        content = content.replace(/<script><\/script>(\s*<link rel="stylesheet" href="\/css\/style\.css">)/, '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>$1');
    }

    // Replace the two empty script tags at the bottom with bootstrap and app.js
    content = content.replace(/<script><\/script>\s*<script><\/script>/, '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n    <script src="/js/app.js"></script>');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
});
