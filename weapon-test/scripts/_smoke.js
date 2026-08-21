/* 浏览器级冒烟测试：极简 DOM stub 加载 app.js，模拟四个版本完整作答流程。
   用法：node scripts/_smoke.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
global.window = global;

['data.js', 'data-cold.js', 'data-guns.js', 'data-exp.js', 'data-mythic.js', 'data-specs.js', 'data-story.js']
  .forEach(f => require(path.join(dir, f)));

/* ---------- 极简 DOM stub ---------- */
const els = new Map();
const ctx = new Proxy({}, { get: (t, k) => () => { }, set: (t, k, v) => { t[k] = v; return true; } });
function makeEl() {
  const e = {
    _handlers: {}, children: [],
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, on) { if (on === undefined) on = !this._s.has(c); on ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    style: {}, hidden: false, disabled: false, checked: false, value: '',
    textContent: '', setAttribute(k, v) { this[k] = v; },
    addEventListener(t, fn) { this._handlers[t] = fn; }, fire(t) { if (this._handlers[t]) this._handlers[t](); },
    appendChild(c) { this.children.push(c); return c; },
    querySelectorAll() { return [makeEl()]; }, querySelector() { return makeEl(); },
    getBoundingClientRect() { return { width: 400, height: 340, left: 0, top: 0 }; },
    getContext() { return ctx; }, focus() {}
  };
  // innerHTML 赋值要清空 children（真实浏览器语义），否则反复渲染会堆积
  Object.defineProperty(e, 'innerHTML', {
    get() { return this._html || ''; },
    set(v) { this._html = v; this.children.length = 0; }
  });
  Object.defineProperty(e, 'parentElement', { get() { return e._parent || (e._parent = makeEl()); } });
  return e;
}
let versionSel = 'classic', typeSel = 'likert', perDimSel = '6';
function radio(sel, name, val) { return { value: val, checked: true, addEventListener() {}, fire() {}, disabled: false }; }
global.document = {
  getElementById(id) { if (!els.has(id)) els.set(id, makeEl()); return els.get(id); },
  createElement() { return makeEl(); },
  querySelector(sel) {
    if (sel.indexOf('optVersion') !== -1 && sel.indexOf(':checked') !== -1) return radio(sel, 'optVersion', versionSel);
    if (sel.indexOf('optType') !== -1 && sel.indexOf(':checked') !== -1) return radio(sel, 'optType', typeSel);
    if (sel.indexOf('optPerDim') !== -1 && sel.indexOf(':checked') !== -1) return radio(sel, 'optPerDim', perDimSel);
    if (sel.indexOf('optVersion') !== -1) { const r = makeEl(); r.name = 'optVersion'; r.value = /value="([^"]+)"/.exec(sel)[1]; return r; }
    return makeEl();
  },
  querySelectorAll() { return [makeEl()]; },
  documentElement: { setAttribute() {}, getAttribute() { return null; }, style: {} },
  body: { style: {} }, addEventListener() {}
};
global.setTimeout = (fn) => fn();          // 答题自动跳下一题立即执行
global.requestAnimationFrame = (fn) => fn();
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
global.addEventListener = () => {};
global.scrollTo = () => {};
global.devicePixelRatio = 1;
global.location = { hash: '' };

require(path.join(dir, 'app.js'));

const el = (id) => els.get(id);
const pass = (c, m) => console.log((c ? '  ✔ ' : '  ✘ ') + m);

/* 经典版 howto 默认 = 时代 */
pass(el('howToList').children[0] && el('howToList').children[0].textContent.indexOf('时代') !== -1, '加载后 howTo 讲「时代」（classic 默认）');

/* ---------- 经典版完整作答（likert, 42 题） ---------- */
function run(version, expectName) {
  versionSel = version;
  // 清掉上一轮的结果，防止循环在真正 submit 前就因旧结果而提前跳出
  const prevName = el('weaponHeroName');
  if (prevName) prevName.textContent = '—';
  el('btnStart').fire('click');
  let guard = 0;
  while (guard++ < 200) {
    const box = el('likertBtns');
    const n = box.children.length;
    if (!n) break;
    box.children[Math.floor(n / 2)].fire('click');
    const nameEl = el('weaponHeroName');
    if (nameEl && nameEl.textContent !== '—') break;
  }
  const nameEl = el('weaponHeroName');
  return nameEl ? nameEl.textContent : '—';
}

const classicName = run('classic');
pass(classicName !== '—', 'classic 42 题作答→出结果（本命:' + classicName + '）');

/* ---------- 天命版 ---------- */
el('btnFate').fire('click');
pass(el('weaponHeroName').textContent !== '—', '天命版掷骰→出结果');
pass(el('versionBanner').hidden === true, '天命版版本横幅隐藏');

/* ---------- 单独版（6 道手癖题，三维） ---------- */
const dexName = run('dexterity');
pass(dexName !== '—', 'dexterity 6 题作答→出结果（本命:' + dexName + '）');
pass(el('statsTitle').textContent === '三维 · 巧手属性', '单独版属性标题 = 三维·巧手属性');
pass(!el('versionBanner').hidden && el('versionBanner').textContent.indexOf('手癖') !== -1, '单独版版本横幅显示');
pass(el('howToList').children[0] && el('howToList').children[0].textContent.indexOf('手癖') !== -1, '单独版 howTo 讲手癖');

/* ---------- 混合版（forced 42 + 6 习惯 = 48 题，含强制二选一） ---------- */
typeSel = 'forced';
versionSel = 'mixed';
el('weaponHeroName').textContent = '—';
el('btnStart').fire('click');
let guard = 0;
while (guard++ < 200) {
  const box = el('likertBtns');
  const n = box.children.length;
  if (!n) break;
  box.children[Math.floor(n / 2)].fire('click');   // forced n=2 → B；习惯 n=5 → 中间频率
  const nameEl = el('weaponHeroName');
  if (nameEl && nameEl.textContent !== '—') break;
}
pass(el('weaponHeroName').textContent !== '—', 'mixed forced 48 题作答→出结果（本命:' + el('weaponHeroName').textContent + '）');
pass(el('statsTitle').textContent === '七维属性（含「补给」）', '混合版属性标题含「补给」');
pass(el('howToList').children[0].textContent.indexOf('补给') !== -1, '混合版 howTo 讲「补给」');
pass(!el('versionBanner').hidden && el('versionBanner').textContent.indexOf('补给') !== -1, '混合版版本横幅显示');

/* ---------- 混合版 likert 70 + 6 题 ---------- */
typeSel = 'likert'; versionSel = 'mixed';
el('weaponHeroName').textContent = '—';
el('btnStart').fire('click');
guard = 0;
while (guard++ < 300) {
  const box = el('likertBtns');
  const n = box.children.length;
  if (!n) break;
  box.children[Math.floor(n / 2)].fire('click');
  const nameEl = el('weaponHeroName');
  if (nameEl && nameEl.textContent !== '—') break;
}
pass(el('weaponHeroName').textContent !== '—', 'mixed likert 76 题（70+6）作答→出结果');
pass(el('statsTitle').textContent === '七维属性（含「补给」）', '混合版 likert 走完属性标题仍是补给版');

console.log('冒烟测试结束');
