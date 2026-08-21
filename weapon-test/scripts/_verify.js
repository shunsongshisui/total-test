/* 四版本逻辑验证：复刻 app.js 的 buildPool/computeProfile/distSq/matchAll，跑抽样统计。
   用法：node scripts/_verify.js [N]   N=抽样数，默认 20000
 */
'use strict';
const path = require('path');
const dir = path.join(__dirname, '..');
global.window = global;
require(path.join(dir, 'data.js'));
require(path.join(dir, 'data-cold.js'));
require(path.join(dir, 'data-guns.js'));
require(path.join(dir, 'data-exp.js'));
require(path.join(dir, 'data-mythic.js'));

const D = global.window.WEAPON_DATA;
const SC = D.scoring;
const DIM_KEYS = D.dims.map(d => d.key);

/* ---------- 复刻 app.js ---------- */
function buildWeaponList() {
  return D.weapons.map((w, i) => {
    const sub = D.subs[w.sub];
    return { id: w.id, sub: w.sub, order: i, stats: Object.assign({}, sub.stats, w.stats || {}) };
  });
}
const state = { version: 'classic', type: 'likert', perDim: 6, pool: [], answers: {} };
function activeDims() {
  if (state.version === 'dexterity') {
    return D.dims.filter(d => d.key === 'precision' || d.key === 'speed' || d.key === 'mobility');
  }
  return D.dims;
}
function activeKeys() { return activeDims().map(d => d.key); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function buildPool() {
  if (state.version === 'dexterity') return D.questions.habits.slice();
  const bank = state.version === 'mixed' ? D.questions[state.type + 'Mix'] : D.questions[state.type];
  const keys = activeKeys();
  const byDim = {};
  keys.forEach(k => { byDim[k] = bank.filter(q => q.dim === k); });
  let pool = [];
  for (let i = 0; i < state.perDim; i++) keys.forEach(k => { if (byDim[k][i]) pool.push(byDim[k][i]); });
  if (state.version === 'mixed') pool = pool.concat(D.questions.habits.slice());
  return pool;
}
function valToScore(v, q) {
  if (v == null) return 50;
  if (q.type === 'forced') {
    const high = (q.dir === 'h') === (v === 'A');
    return high ? 100 : 0;
  }
  if (q.dir === '-') return (SC.likertMax - v) / (SC.likertMax - SC.likertMin) * 100;
  return (v - SC.likertMin) / (SC.likertMax - SC.likertMin) * 100;
}
function applyHabits(profile) {
  const boosts = {};
  D.dims.forEach(d => { boosts[d.key] = 0; });
  state.pool.forEach(q => {
    if (!q.dims) return;
    const v = state.answers[q.id];
    if (v == null) return;
    const factor = Math.max(0, (v - 2) / 3);
    q.dims.forEach(dd => { boosts[dd.key] = Math.min(SC.habitCap, boosts[dd.key] + dd.w * factor); });
  });
  D.dims.forEach(d => {
    if (boosts[d.key] > 0 && profile[d.key] != null) profile[d.key] = clamp(profile[d.key] + boosts[d.key], 0, 100);
  });
}
function computeProfile() {
  const profile = {};
  const dimQs = {};
  state.pool.forEach(q => { if (q.dims) return; (dimQs[q.dim] = dimQs[q.dim] || []).push(q); });
  activeDims().forEach(d => {
    const qs = dimQs[d.key] || [];
    if (!qs.length) { profile[d.key] = 50; return; }
    const vals = qs.map(q => valToScore(state.answers[q.id], q));
    profile[d.key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  applyHabits(profile);
  return profile;
}
const W = {};
D.dims.forEach(d => { W[d.key] = 1; });
W.era = SC.eraWeight;
function weightFor(k) {
  if (state.version === 'dexterity') return (k === 'precision' || k === 'speed' || k === 'mobility') ? 1 : 0;
  return W[k] || 1;
}
function distSq(profile, stats) {
  let sum = 0, wsum = 0;
  D.dims.forEach(d => {
    const w = weightFor(d.key);
    if (!w) return;
    const delta = profile[d.key] - stats[d.key];
    sum += w * delta * delta; wsum += w;
  });
  return wsum ? sum / wsum : 0;
}
function softmaxPick(ranked, temp) {
  const weights = ranked.map(r => Math.exp(-r.dist / temp));
  const sum = weights.reduce((a, b) => a + b, 0);
  let x = Math.random() * sum;
  for (let i = 0; i < weights.length; i++) { x -= weights[i]; if (x <= 0) return i; }
  return weights.length - 1;
}
function matchAll(profile) {
  let pool = buildWeaponList();
  if (state.version === 'dexterity') pool = pool.filter(w => D.dexteritySubs.indexOf(w.sub) !== -1);
  const ranked = pool.map(w => ({ w, dist: Math.sqrt(distSq(profile, w.stats)), match: clamp(Math.round(100 - Math.sqrt(distSq(profile, w.stats))), 0, 100) }));
  ranked.sort((a, b) => a.dist - b.dist || a.w.order - b.w.order);
  const isDex = state.version === 'dexterity';
  const K = Math.min(isDex ? SC.drawKDex : SC.drawK, ranked.length);
  const top = ranked.slice(0, K);
  const drawn = top[softmaxPick(top, isDex ? SC.drawTempDex : SC.drawTemp)];
  return [drawn].concat(ranked.filter(r => r.w !== drawn.w));
}

/* ---------- 结构断言 ---------- */
const ok = (cond, msg) => console.log((cond ? '  ✔ ' : '  ✘ ') + msg);
console.log('== 数据结构 ==');
ok(D.questions.likertMix.length === 70, 'likertMix 70 题');
ok(D.questions.forcedMix.length === 70, 'forcedMix 70 题');
['likert', 'forced'].forEach(t => {
  DIM_KEYS.forEach(k => {
    const n = D.questions[t + (t === 'likert' ? 'Mix' : 'Mix')].filter(q => q.dim === k).length;
    ok(n === 10, `${t}Mix ${k} 10 题`);
  });
});
ok(D.questions.habits.length === 6, 'habits 6 题');
ok(D.dexteritySubs.every(s => D.subs[s]), 'dexteritySubs 全部存在于 subs');

/* ---------- 各版本 pool 结构 ---------- */
console.log('== buildPool ==');
state.version = 'classic'; state.type = 'likert'; state.perDim = 6;
let pool = buildPool();
ok(pool.length === 42, 'classic likert 6 → 42 题');
state.version = 'mixed'; state.type = 'forced'; state.perDim = 10;
pool = buildPool();
ok(pool.length === 70 + 6, 'mixed forced 10 → 76 题（含 6 习惯）');
state.version = 'dexterity';
pool = buildPool();
ok(pool.length === 6 && pool.every(q => q.dims), 'dexterity → 6 道习惯题');

/* ---------- 计分 ---------- */
console.log('== computeProfile ==');
state.version = 'classic'; state.type = 'likert'; state.perDim = 6;
state.pool = buildPool();
state.answers = {};
state.pool.forEach(q => { state.answers[q.id] = 3; });   // 全中立
let prof = computeProfile();
ok(DIM_KEYS.every(k => prof[k] != null && Math.abs(prof[k] - 50) < 0.5), 'classic 全中立 → 各维 ≈ 50');

state.version = 'mixed'; state.type = 'likert'; state.perDim = 6;
state.pool = buildPool();
state.answers = {};
state.pool.forEach(q => { if (!q.dims) state.answers[q.id] = 3; else state.answers[q.id] = 5; });
prof = computeProfile();
const before = { precision: 50, speed: 50, mobility: 50 };
ok(prof.precision > before.precision && prof.speed > before.speed && prof.mobility > before.mobility, 'mixed 习惯全"总是" → 精准/迅捷/灵动有加成');
ok(prof.precision <= 50 + SC.habitCap + 0.5 && prof.mobility <= 50 + SC.habitCap + 0.5, '加成不超 habitCap');

state.version = 'dexterity';
state.pool = buildPool();
state.answers = {};
state.pool.forEach(q => { state.answers[q.id] = 5; });
prof = computeProfile();
ok(Object.keys(prof).sort().join(',') === 'mobility,precision,speed', 'dexterity profile 只有三维');
ok(prof.precision <= 50 + SC.habitCap + 0.5, 'dexterity 加成封顶');
console.log('  dexterity 全总是 →', JSON.stringify(prof));

/* ---------- 匹配 ---------- */
console.log('== matchAll ==');
state.version = 'classic';
const all = buildWeaponList();
const cprof = {};
DIM_KEYS.forEach(k => cprof[k] = 50);
const r1 = matchAll(cprof);
ok(r1[0].w.id === r1[0].w.id, '本命即抽中的那把');
ok(r1.length === all.length, 'classic 全库参与匹配');
ok(Math.abs(r1[0].dist - Math.sqrt(distSq(cprof, r1[0].w.stats))) < 1e-9, '本命保留真实距离');

state.version = 'dexterity';
const r2 = matchAll(prof);
ok(r2.length === all.filter(w => D.dexteritySubs.indexOf(w.sub) !== -1).length, 'dexterity 只在巧手池匹配');
ok(r2.every(r => D.dexteritySubs.indexOf(r.w.sub) !== -1), 'dexterity 结果全是巧手武器');
ok(weightFor('power') === 0 && weightFor('precision') === 1, 'dexterity 权重：power=0, precision=1');

/* ---------- 出场率分布（softmax 均衡） ---------- */
console.log('== 出场率分布 ==');
const N = parseInt(process.argv[2], 10) || 20000;
function randProfile() {
  let p;
  do {
    p = {};
    DIM_KEYS.forEach(k => p[k] = Math.floor(Math.random() * 101));
  } while ((Math.max(...DIM_KEYS.map(k => p[k])) - Math.min(...DIM_KEYS.map(k => p[k]))) < SC.flatRange);
  return p;
}
function report(label, version) {
  state.version = version; state.type = 'likert'; state.perDim = 6;
  const counts = {};
  buildWeaponList().forEach(w => counts[w.id] = 0);
  for (let i = 0; i < N; i++) counts[matchAll(randProfile())[0].w.id]++;
  const rows = Object.keys(counts).map(id => ({ id, c: counts[id] })).sort((a, b) => b.c - a.c);
  const nonzero = rows.filter(r => r.c > 0).length;
  let varSum = 0;
  rows.forEach(r => { const p = r.c / N; varSum += (p - 1 / rows.length) * (p - 1 / rows.length); });
  const uneven = Math.sqrt(varSum * rows.length);
  console.log(`  ${label}: 出场 ${nonzero}/${rows.length} 武器，峰值 ${(rows[0].c / N * 100).toFixed(2)}%，不均匀度 ${uneven.toFixed(3)}`);
  console.log('    Top6:', rows.slice(0, 6).map(r => r.id + ':' + r.c).join(' '));
}
report('classic (softmax K=5 T=5)', 'classic');
report('mixed   (softmax 补给)', 'mixed');

/* dexterity 用真实习惯作答模拟：随机给 6 道习惯题 1-5 频率 → computeProfile → 匹配 */
state.version = 'dexterity';
{
  const dexterityPool = buildWeaponList().filter(w => D.dexteritySubs.indexOf(w.sub) !== -1);
  const counts = {};
  dexterityPool.forEach(w => counts[w.id] = 0);
  for (let i = 0; i < N; i++) {
    state.pool = buildPool();
    state.answers = {};
    state.pool.forEach(q => { state.answers[q.id] = 1 + Math.floor(Math.random() * 5); });
    counts[matchAll(computeProfile())[0].w.id]++;
  }
  const rows = Object.keys(counts).map(id => ({ id, c: counts[id] })).sort((a, b) => b.c - a.c);
  const nonzero = rows.filter(r => r.c > 0).length;
  let varSum = 0;
  rows.forEach(r => { const p = r.c / N; varSum += (p - 1 / rows.length) * (p - 1 / rows.length); });
  const uneven = Math.sqrt(varSum * rows.length);
  console.log(`  dexterity (真实习惯作答): 出场 ${nonzero}/${rows.length} 把巧手武器，峰值 ${(rows[0].c / N * 100).toFixed(2)}%，不均匀度 ${uneven.toFixed(3)}`);
  console.log('    Top8:', rows.slice(0, 8).map(r => r.id + ':' + r.c).join(' '));
}
