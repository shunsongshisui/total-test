'use strict';
const fs = require('fs');
const path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const ids = new Set();
const re = /\$\('([^']+)'\)/g;   // $('id')
let m;
while ((m = re.exec(app))) ids.add(m[1]);

const htmlIds = new Set();
const re2 = /id="([^"]+)"/g;
while ((m = re2.exec(html))) htmlIds.add(m[1]);

const missing = [...ids].filter(id => !htmlIds.has(id));
console.log('app.js 引用的 id 数:', ids.size);
console.log('index.html 中缺的 id:', missing.length ? missing : '无 ✔');
