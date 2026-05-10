const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const langDir = path.join(__dirname, 'public', 'lang');
const en = JSON.parse(fs.readFileSync(path.join(langDir, 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(langDir, 'hi.json'), 'utf8'));
const mr = JSON.parse(fs.readFileSync(path.join(langDir, 'mr.json'), 'utf8'));

const extras = {
    'js_target_shop': 'Target Shop',
    'js_req_farmer': 'Requesting Farmer',
    'js_unknown': 'Unknown',
    'js_del_prod': 'Deleted Product',
    'js_units': 'unit(s)',
    'js_no_req': 'No requests found.',
    'js_err_req': 'Error loading requests.',
    'js_reg_succ': 'Registration successful! Please login.',
    'js_net_err': 'Network error',
    'js_load_date': 'Loading date...',
    'js_err_weath1': 'Could not load weather data.',
    'js_err_weath2': 'Error fetching weather.',
    'js_no_prices': 'No prices available at the moment',
    'js_err_prices': 'Failed to fetch market rates.',
    'js_humidity': 'Humidity',
    'js_wind': 'Wind',
    'js_weather_err': 'Weather error.',
    'js_load_weath': 'Could not load weather.',
    'add_expense_new': 'Add Expense',
    'add_revenue_new': 'Add Revenue',
    'crop_breakdown_new': 'Crop-wise Breakdown',
    'save_expense_new': 'Save Expense',
    'save_revenue_new': 'Save Revenue',
    'expense_lbl': 'Expense:',
    'revenue_lbl': 'Revenue:',
    'net_profit_lbl': 'Net Profit:',
    'net_loss_lbl': 'Net Loss:',
    'no_crop_data': 'No crop data available.',
    'chart_exp_lbl': 'Expenses (₹)',
    'chart_rev_lbl': 'Revenues (₹)'
};

async function run() {
    for (const [key, text] of Object.entries(extras)) {
        en[key] = text;
        try {
            if (!hi[key]) hi[key] = (await translate(text, { to: 'hi' })).text;
            if (!mr[key]) mr[key] = (await translate(text, { to: 'mr' })).text;
            console.log(`Translated ${key}`);
        } catch(e) {
            console.error(e);
            hi[key] = text;
            mr[key] = text;
        }
        await new Promise(r => setTimeout(r, 100)); // rate limit protection
    }
    fs.writeFileSync(path.join(langDir, 'en.json'), JSON.stringify(en, null, 2));
    fs.writeFileSync(path.join(langDir, 'hi.json'), JSON.stringify(hi, null, 2));
    fs.writeFileSync(path.join(langDir, 'mr.json'), JSON.stringify(mr, null, 2));
    console.log('Extras added.');
}
run();
