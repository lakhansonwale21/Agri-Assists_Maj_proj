const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(viewsDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    html = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/g, (match, content) => {
        let fixed = content.replace(/<span data-i18n="[^"]+">([\s\S]*?)<\/span>/gi, '$1');
        fixed = fixed.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        return match.replace(content, fixed);
    });
    
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, (match, content) => {
        let fixed = content.replace(/<span data-i18n="[^"]+">([\s\S]*?)<\/span>/gi, '$1');
        fixed = fixed.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        return match.replace(content, fixed);
    });
    
    fs.writeFileSync(filePath, html);
    console.log(`Fixed ${file}`);
});
