const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { translate } = require('@vitalets/google-translate-api');
const crypto = require('crypto');

const viewsDir = path.join(__dirname, 'views');
const langDir = path.join(__dirname, 'public', 'lang');

if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

let enDict = {}; let hiDict = {}; let mrDict = {};
try { enDict = JSON.parse(fs.readFileSync(path.join(langDir, 'en.json'), 'utf8')); } catch(e) {}
try { hiDict = JSON.parse(fs.readFileSync(path.join(langDir, 'hi.json'), 'utf8')); } catch(e) {}
try { mrDict = JSON.parse(fs.readFileSync(path.join(langDir, 'mr.json'), 'utf8')); } catch(e) {}

function getSlug(text) {
    let clean = text.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().substring(0, 20);
    if (!clean) clean = 'txt';
    const hash = crypto.createHash('md5').update(text.trim()).digest('hex').substring(0, 5);
    return `${clean}_${hash}`;
}

async function run() {
    const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));
    const newKeys = new Set();
    
    for (const file of files) {
        const filePath = path.join(viewsDir, file);
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html, { decodeEntities: false });
        
        const walk = (node) => {
            if (node.type === 'tag') {
                const tag = node.name.toLowerCase();
                if (['script', 'style', 'head', 'meta', 'link', 'title'].includes(tag)) return;
                
                if ($(node).attr('data-i18n') || $(node).attr('data-i18n-placeholder')) {
                    const key = $(node).attr('data-i18n');
                    if (key && !enDict[key]) {
                        // try to extract inner text cautiously
                        let inner = $(node).text().trim() || key;
                        enDict[key] = inner;
                        newKeys.add(key);
                    }
                    return; 
                }
                
                if (tag === 'input' || tag === 'textarea') {
                    const placeholder = $(node).attr('placeholder');
                    if (placeholder && placeholder.trim() && /[a-zA-Z]/.test(placeholder)) {
                        const txt = placeholder.trim();
                        const key = getSlug(txt);
                        $(node).attr('data-i18n-placeholder', key);
                        if (!enDict[key]) { enDict[key] = txt; newKeys.add(key); }
                    }
                }
            }
            
            if (node.type === 'text') {
                const text = node.data;
                if (/[a-zA-Z]/.test(text) && text.trim().length > 0) {
                    const txt = text.trim();
                    const key = getSlug(txt);
                    if (!enDict[key]) { enDict[key] = txt; newKeys.add(key); }
                    
                    const span = $(`<span data-i18n="${key}"></span>`).text(txt);
                    
                    let newHtml = '';
                    const matchStart = text.match(/^\s+/);
                    const matchEnd = text.match(/\s+$/);
                    if (matchStart) newHtml += matchStart[0];
                    newHtml += $.html(span);
                    if (matchEnd) newHtml += matchEnd[0];
                    
                    $(node).replaceWith(newHtml);
                }
                return;
            }
            
            if (node.children) {
                const children = [...node.children];
                for (let child of children) {
                    walk(child);
                }
            }
        };
        
        walk($.root()[0]);
        
        if ($('#langSelect').length === 0) {
            $('body').append(`
            <div class="lang-selector-floating" style="position:fixed; bottom:20px; right:20px; z-index:9999; background:rgba(255,255,255,0.9); padding:5px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                <select id="langSelect" class="form-select form-select-sm border-0 shadow-none fw-bold text-success">
                    <option value="en">English (EN)</option>
                    <option value="hi">हिंदी (HI)</option>
                    <option value="mr">मराठी (MR)</option>
                </select>
            </div>
            `);
        }
        
        fs.writeFileSync(filePath, $.html());
    }
    
    console.log(`Found ${newKeys.size} new keys to translate...`);
    let cnt = 0;
    
    // We will batch translations with a slight delay to avoid rate limiting
    for (let key of newKeys) {
        const textToTranslate = enDict[key];
        
        if (!hiDict[key]) {
            try {
                const resHi = await translate(textToTranslate, { to: 'hi' });
                hiDict[key] = resHi.text;
                console.log(`[hi] ${textToTranslate} -> ${resHi.text}`);
            } catch(e) {
                console.error("Translation fail [hi]:", textToTranslate);
                hiDict[key] = textToTranslate; 
            }
        }
        
        if (!mrDict[key]) {
            try {
                const resMr = await translate(textToTranslate, { to: 'mr' });
                mrDict[key] = resMr.text;
                console.log(`[mr] ${textToTranslate} -> ${resMr.text}`);
            } catch(e) {
                console.error("Translation fail [mr]:", textToTranslate);
                mrDict[key] = textToTranslate; 
            }
        }
        cnt++;
        if (cnt % 5 === 0) console.log(`Progress: ${cnt} / ${newKeys.size}`);
        
        // Small delay to prevent ban from google translate free API
        await new Promise(r => setTimeout(r, 100));
    }
    
    fs.writeFileSync(path.join(langDir, 'en.json'), JSON.stringify(enDict, null, 2));
    fs.writeFileSync(path.join(langDir, 'hi.json'), JSON.stringify(hiDict, null, 2));
    fs.writeFileSync(path.join(langDir, 'mr.json'), JSON.stringify(mrDict, null, 2));
    console.log('All translations applied globally!');
}

run().catch(console.error);
