const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const dist=path.join(__dirname,'../dist');
for(const name of ['index.html','sources.html']){const html=fs.readFileSync(path.join(dist,name),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){const ref=m[1];if(/^https?:|^#/.test(ref))continue;assert(fs.existsSync(path.join(dist,ref.split('?')[0])),`Missing deployed asset: ${ref}`)}}
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');assert(html.indexOf('data-licensing.js')<html.indexOf('i18n.js'),'licensing must initialize before map boot');
console.log('PASS: source/license page links and local application assets exist in the deployable directory, with licensing loaded before map boot.');
