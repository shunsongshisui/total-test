/* 出场率模拟基线：加载数据文件，跑现有匹配逻辑，统计每把武器出场率。
   用法：node scripts/sim-draw.js [N] [alpha] [biasOn]
   N      抽样数（默认 20000）
   alpha  均衡强度 0=关闭（默认 0）
   biasOn 是否应用均衡（默认 false，配合 alpha 用）
*/
'use strict';
const path = require('path');
const dir = path.join(__dirname, '..');

// shim window
global.window = global;
require(path.join(dir, 'data.js'));
require(path.join(dir, 'data-cold.js'));
require(path.join(dir, 'data-guns.js'));
require(path.join(dir, 'data-exp.js'));
require(path.join(dir, 'data-mythic.js'));

const D = global.window.WEAPON_DATA;
const SC = D.scoring;
const DIM_KEYS = D.dims.map(d => d.key);

// 复刻 app.js 的 buildWeaponList / distSq / matchAll
function buildWeaponList() {
  return D.weapons.map((w, i) => {
    const sub = D.subs[w.sub];
    return {
      id: w.id, order: i, cat: sub.cat, group: sub.group, label: sub.label,
      stats: Object.assign({}, sub.stats, w.stats || {})
    };
  });
}
const weapons = buildWeaponList();

const W = {};
DIM_KEYS.forEach(k => W[k] = 1);
W.era = SC.eraWeight;

function distSq(profile, stats) {
  let sum = 0, wsum = 0;
  DIM_KEYS.forEach(k => {
    const delta = profile[k] - stats[k];
    const w = W[k];
    sum += w * delta * delta;
    wsum += w;
  });
  return sum / wsum;
}
function isFlat(profile) {
  const vals = DIM_KEYS.map(k => profile[k]);
  return Math.max(...vals) - Math.min(...vals) < SC.flatRange;
}
function matchAll(profile, bias) {
  return weapons.slice().map((w) => {
    const d = Math.sqrt(distSq(profile, w.stats)) + (bias ? (bias[w.id] || 0) : 0) + (w.noise || 0);
    return { id: w.id, dist: d };
  }).sort((a, b) => a.dist - b.dist);
}

function randProfile() {
  let p;
  do {
    p = {};
    DIM_KEYS.forEach(k => p[k] = Math.floor(Math.random() * 101));
  } while (isFlat(p));
  return p;
}

// 每把武器一个确定性微小噪声，拆开同子类的并列
weapons.forEach(w => {
  let h = 0;
  for (let i = 0; i < w.id.length; i++) h = (h * 31 + w.id.charCodeAt(i)) >>> 0;
  w.noise = ((h % 1000) / 1000 - 0.5) * 1.2;   // ±0.6
});

// 计算出场率偏置：alpha>0 时迭代收敛
function computeBias(N, alpha) {
  let bias = {};  // id -> 距离修正（正=推远）
  for (let iter = 0; iter < 6; iter++) {
    const counts = {};
    weapons.forEach(w => counts[w.id] = 0);
    for (let i = 0; i < N; i++) {
      const p = randProfile();
      const ranked = matchAll(p, bias);
      counts[ranked[0].id]++;
    }
    const target = N / weapons.length;
    let maxDev = 0;
    weapons.forEach(w => {
      const dev = counts[w.id] - target;
      if (Math.abs(dev) > maxDev) maxDev = Math.abs(dev);
      const k = (iter < 2) ? alpha : alpha * 0.3;  // 前两轮快，之后减速
      bias[w.id] = (bias[w.id] || 0) + dev * k;
    });
    if (iter === 0) console.log('iter0 maxDev:', Math.round(maxDev), 'target:', Math.round(target));
  }
  return bias;
}

function report(bias, N) {
  const counts = {};
  weapons.forEach(w => counts[w.id] = 0);
  for (let i = 0; i < N; i++) {
    const p = randProfile();
    const ranked = matchAll(p, bias);
    counts[ranked[0].id]++;
  }
  const rows = weapons.map(w => ({ id: w.id, label: w.label, cat: w.cat, count: counts[w.id] }))
    .sort((a, b) => b.count - a.count);
  const nonzero = rows.filter(r => r.count > 0).length;
  const max = rows[0].count, min = rows[rows.length - 1].count;
  // 简单不均匀度：归一化 counts 的方差（均匀=0，全给一把=1）
  const total = N;
  let varSum = 0;
  rows.forEach(r => { const p = r.count / total; varSum += (p - 1 / weapons.length) * (p - 1 / weapons.length); });
  const uneven = Math.sqrt(varSum * weapons.length);
  console.log('--- ' + (bias ? '均衡后' : '基线') + ' ---');
  console.log('总数', total, '武器数', weapons.length, '平均', Math.round(total / weapons.length));
  console.log('出场武器数:', nonzero + '/' + weapons.length, ' 极差 max/min:', max + '/' + min, ' 比值:', (max / Math.max(min, 1)).toFixed(1));
  console.log('不均匀度(0均匀~1极不均):', uneven.toFixed(3));
  console.log('Top8:', rows.slice(0, 8).map(r => r.id + '(' + r.cat + '):' + r.count).join(' '));
  console.log('Bottom8:', rows.slice(-8).map(r => r.id + ':' + r.count).join(' '));
}

const N = parseInt(process.argv[2], 10) || 20000;
const alpha = parseFloat(process.argv[3]) || 0;
const biasOn = process.argv[4] === 'bias';

let bias = null;
if (biasOn) bias = computeBias(N, alpha);
report(bias, N);
