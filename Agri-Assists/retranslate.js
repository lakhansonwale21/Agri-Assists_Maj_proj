const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the background URL escaping issue caused by Cheerio
    const newContent = content.replace(/&amp;w=2000&amp;auto=format&amp;fit=crop/g, '&w=2000&auto=format&fit=crop');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Fixed background in ${file}`);
    }
});

const langDir = path.join(__dirname, 'public', 'lang');
const en = JSON.parse(fs.readFileSync(path.join(langDir, 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(langDir, 'hi.json'), 'utf8'));
const mr = JSON.parse(fs.readFileSync(path.join(langDir, 'mr.json'), 'utf8'));

// Keys to ignore because they contain JS code that got erroneously extracted
const ignoreKeys = Object.keys(en).filter(key => key.startsWith('documentaddeventlist'));
ignoreKeys.forEach(k => {
    delete en[k];
    delete hi[k];
    delete mr[k];
});

async function run() {
    const keys = Object.keys(en);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const text = en[key];
        
        let needsSave = false;
        
        // If it equals English and isn't a naturally same word
        if (hi[key] === text && text.length > 2 && !['Pune', 'Maharashtra', 'Agri-Assists'].includes(text)) {
            try {
                const resHi = await translate(text, { to: 'hi' });
                hi[key] = resHi.text;
                console.log(`[hi] Fixed: ${text} -> ${resHi.text}`);
                needsSave = true;
            } catch(e) { console.error('hi fail', text); }
            await new Promise(r => setTimeout(r, 1500)); // Sleep to avoid rate limiting
        }
        
        if (mr[key] === text && text.length > 2 && !['Pune', 'Maharashtra', 'Agri-Assists'].includes(text)) {
            try {
                const resMr = await translate(text, { to: 'mr' });
                mr[key] = resMr.text;
                console.log(`[mr] Fixed: ${text} -> ${resMr.text}`);
                needsSave = true;
            } catch(e) { console.error('mr fail', text); }
            await new Promise(r => setTimeout(r, 1500));
        }
        
        if (needsSave && i % 5 === 0) {
            fs.writeFileSync(path.join(langDir, 'hi.json'), JSON.stringify(hi, null, 2));
            fs.writeFileSync(path.join(langDir, 'mr.json'), JSON.stringify(mr, null, 2));
        }
    }
    
    fs.writeFileSync(path.join(langDir, 'en.json'), JSON.stringify(en, null, 2));
    fs.writeFileSync(path.join(langDir, 'hi.json'), JSON.stringify(hi, null, 2));
    fs.writeFileSync(path.join(langDir, 'mr.json'), JSON.stringify(mr, null, 2));
    console.log('Retranslation and background fixing complete.');
}

run();
