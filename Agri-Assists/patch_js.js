const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
let dash = fs.readFileSync(path.join(viewsDir, 'dashboard.html'), 'utf8');

dash = dash.replace(
    /document\.getElementById\('dashName'\)\.textContent = `Hi, \$\{user\.name\.split\(' '\)\[0\]\}! 👋`;/,
    "document.getElementById('dashName').textContent = `${translations['js_hi'] || 'Hi'}, ${user.name.split(' ')[0]}! 👋`;"
);

dash = dash.replace(
    /document\.getElementById\('reqTargetCol'\)\.textContent = role === 'farmer' \? 'Target Shop' : 'Requesting Farmer';/,
    "document.getElementById('reqTargetCol').textContent = role === 'farmer' ? (translations['js_target_shop'] || 'Target Shop') : (translations['js_req_farmer'] || 'Requesting Farmer');"
);

dash = dash.replace(
    /`\s*<tr>\s*<td class="ps-4 fw-bold text-dark"><i class="fas fa-box text-muted me-2"><\/i> \$\{req\.productId \? req\.productId\.productName : 'Deleted Product'\}<\/td>\s*<td><span class="badge bg-light text-dark border">\$\{req\.quantity\} unit\(s\)<\/span><\/td>\s*<td>\$\{targetName \|\| 'Unknown'\}<\/td>\s*<td class="pe-4 text-end"><span class="badge rounded-pill px-3 py-2 shadow-sm \$\{badgeClass\}">\$\{req\.status\.toUpperCase\(\)\}<\/span><\/td>\s*<\/tr>\s*`/g,
    "`\\n<tr>\\n<td class=\\\"ps-4 fw-bold text-dark\\\"><i class=\\\"fas fa-box text-muted me-2\\\"></i> ${req.productId ? req.productId.productName : (translations['js_del_prod'] || 'Deleted Product')}</td>\\n<td><span class=\\\"badge bg-light text-dark border\\\">${req.quantity} ${translations['js_units'] || 'unit(s)'}</span></td>\\n<td>${targetName || (translations['js_unknown'] || 'Unknown')}</td>\\n<td class=\\\"pe-4 text-end\\\"><span class=\\\"badge rounded-pill px-3 py-2 shadow-sm ${badgeClass}\\\">${req.status.toUpperCase()}</span></td>\\n</tr>\\n`"
);

dash = dash.replace(
    /'<tr><td colspan="4" class="text-center py-5 text-muted"><i class="fas fa-folder-open fs-2 mb-3 d-block opacity-25"><\/i> No requests found\.<\/td><\/tr>'/g,
    "`<tr><td colspan=\\\"4\\\" class=\\\"text-center py-5 text-muted\\\"><i class=\\\"fas fa-folder-open fs-2 mb-3 d-block opacity-25\\\"></i> ${translations['js_no_req'] || 'No requests found.'}</td></tr>`"
);

dash = dash.replace(
    /'<tr><td colspan="4" class="text-center py-4 text-danger">Error loading requests\.<\/td><\/tr>'/g,
    "`<tr><td colspan=\\\"4\\\" class=\\\"text-center py-4 text-danger\\\">${translations['js_err_req'] || 'Error loading requests.'}</td></tr>`"
);

dash = dash.replace(
    /'<p class="m-auto text-warning">Could not load weather\.<\/p>'/g,
    "`<p class=\\\"m-auto text-warning\\\">${translations['js_load_weath'] || 'Could not load weather.'}</p>`"
);

dash = dash.replace(
    /'<p class="m-auto text-warning">Weather error\.<\/p>'/g,
    "`<p class=\\\"m-auto text-warning\\\">${translations['js_weather_err'] || 'Weather error.'}</p>`"
);

fs.writeFileSync(path.join(viewsDir, 'dashboard.html'), dash);

let home = fs.readFileSync(path.join(viewsDir, 'home.html'), 'utf8');
home = home.replace(
    /'<p class="text-warning"><i class="fas fa-exclamation-triangle me-2"><\/i> Could not load weather data\.<\/p>'/g,
    "`<p class=\\\"text-warning\\\"><i class=\\\"fas fa-exclamation-triangle me-2\\\"></i> ${translations['js_err_weath1'] || 'Could not load weather data.'}</p>`"
);
home = home.replace(
    /'<p class="text-warning"><i class="fas fa-exclamation-triangle me-2"><\/i> Error fetching weather\.<\/p>'/g,
    "`<p class=\\\"text-warning\\\"><i class=\\\"fas fa-exclamation-triangle me-2\\\"></i> ${translations['js_err_weath2'] || 'Error fetching weather.'}</p>`"
);
home = home.replace(
    /'<tr><td colspan="3" class="text-center py-5 text-muted">No prices available at the moment<\/td><\/tr>'/g,
    "`<tr><td colspan=\\\"3\\\" class=\\\"text-center py-5 text-muted\\\">${translations['js_no_prices'] || 'No prices available at the moment'}</td></tr>`"
);
home = home.replace(
    /'<tr><td colspan="3" class="text-center py-5 text-danger">Failed to fetch market rates\.<\/td><\/tr>'/g,
    "`<tr><td colspan=\\\"3\\\" class=\\\"text-center py-5 text-danger\\\">${translations['js_err_prices'] || 'Failed to fetch market rates.'}</td></tr>`"
);
fs.writeFileSync(path.join(viewsDir, 'home.html'), home);

const appDir = path.join(__dirname, 'public', 'js');
let app = fs.readFileSync(path.join(appDir, 'app.js'), 'utf8');
app = app.replace(
    /'Network error'/g,
    "translations['js_net_err'] || 'Network error'"
);
app = app.replace(
    /'Registration successful! Please login\.'/g,
    "translations['js_reg_succ'] || 'Registration successful! Please login.'"
);
fs.writeFileSync(path.join(appDir, 'app.js'), app);

console.log('JS strings patched.');
