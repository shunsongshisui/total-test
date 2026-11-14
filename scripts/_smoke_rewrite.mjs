// 抽卡「命运执笔 / 规则改写 + 预言」无头冒烟测试
// 用法：node scripts/_smoke_rewrite.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const HTML_PATH = new URL('../tryagain.html', import.meta.url);
const html = fs.readFileSync(HTML_PATH, 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);

let pass = 0, fail = 0;
const ok = (cond, label, extra) => {
    if (cond) { pass++; console.log('  ✅ ' + label); }
    else { fail++; console.log('  ❌ ' + label + (extra !== undefined ? '  → ' + JSON.stringify(extra) : '')); }
};
const flush = () => new Promise(r => setTimeout(r, 0));   // 让改写演出的 Promise 链跑完，解除 busy

function makeEl(id) {
    const el = {
        id, textContent: '', innerHTML: '', className: '', value: '', disabled: false, title: '',
        style: {}, onclick: null, children: [], offsetWidth: 0,
        classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
        appendChild(c) { el.children.push(c); return c; },
        querySelector() { return makeEl('sub'); },
        querySelectorAll() { return []; },
        setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
        addEventListener() {}
    };
    return el;
}
function makeContext(store, broken) {
    const elements = new Map(ids.map(i => [i, makeEl(i)]));
    const errors = [];
    const sandbox = {
        document: {
            getElementById: id => elements.get(id) || null,
            createElement: t => makeEl(t),
            querySelector: sel => makeEl(sel)
        },
        localStorage: broken ? {
            getItem: () => { throw new Error('denied'); },
            setItem: () => { throw new Error('denied'); },
            removeItem: () => { throw new Error('denied'); }
        } : {
            getItem: k => (k in store ? store[k] : null),
            setItem: (k, v) => { store[k] = String(v); },
            removeItem: k => { delete store[k]; }
        },
        console, Math, JSON, Date, Promise, Object, Array, String, Number, Boolean, isNaN, parseInt, parseFloat,
        encodeURIComponent, decodeURIComponent, btoa, atob, TextEncoder, TextDecoder, Uint8Array,
        setTimeout: fn => { try { fn(); } catch (e) { errors.push(e); } return 0; },
        clearTimeout() {},
        confirm: () => true,
        fetch: () => Promise.resolve({ ok: true }),
        window: { open() {}, AudioContext: undefined, webkitAudioContext: undefined, addEventListener() {} }
    };
    sandbox.globalThis = sandbox;
    const ctx = vm.createContext(sandbox);
    vm.runInContext(code, ctx, { filename: 'tryagain-inline.js' });
    return { ctx, elements, errors, run: src => vm.runInContext(src, ctx) };
}

const store = {};
const A = makeContext(store);

console.log('\n[1] 初始渲染 & 卡池 & 塔罗会保底已移除');
ok(A.run('CARDS.length') === 461, '卡池仍是 461 张', A.run('CARDS.length'));
ok(A.run('CARDS.filter(c=>c.rewrite).length') === 5, '执笔者共 5 张');
ok(A.run('typeof TARO_PITY') === 'undefined', 'TARO_PITY 常量已删除');
ok(A.run('typeof TARO_POOL') === 'undefined', 'TARO_POOL 卡池已删除');
ok(A.run('state.taroPity') === undefined, '存档里不再有 taroPity 字段');
ok(A.run('document.getElementById("taroText")') === null, '塔罗会保底进度条的 DOM 已删除');
ok(A.run('BASE_RULES.TARO_PITY') === undefined && A.run('RULE_META.TARO_PITY') === undefined, '改写规则表里没有塔罗会保底');
ok(A.elements.get('rulesList').innerHTML.includes('命运仍在正轨上'), '未改写时规则面板显示占位文案');

console.log('\n[2] 预言必成真（单抽 200 次 / 十连 200 次）');
let t2 = 0;
for (let i = 0; i < 200; i++) {
    const name = A.run('CARDS[Math.floor(Math.random()*CARDS.length)].name');
    A.run(`state.prophecy = {name: ${JSON.stringify(name)}, by: '测试者'};`);
    if (A.run('drawOne()').name === name) t2++;
}
ok(t2 === 200, '单抽：200/200 全部如约而至', t2 + '/200');
let t2b = 0;
for (let i = 0; i < 200; i++) {
    const name = A.run('CARDS[Math.floor(Math.random()*CARDS.length)].name');
    A.run(`state.prophecy = {name: ${JSON.stringify(name)}, by: '测试者'};`);
    if (A.run('drawN(10, null)')[0].name === name) t2b++;
}
ok(t2b === 200, '十连：预言落在第一张，200/200 命中', t2b + '/200');

console.log('\n[3] 时效规则会到期，永久规则留存');
A.run('state.temp = []; state.perm = [];');
A.run(`state.temp.push({key:'SSS_PITY',op:'set',v:100,text:'测试-短',tone:'buff',perm:false,left:2,from:'测试'});`);
ok(A.run('ruleVal("SSS_PITY")') === 100, '时效改写立刻生效（保底 300 → 100）');
A.run('drawCards(10)'); await flush();
ok(A.run('state.temp.filter(m=>m.text==="测试-短").length') === 0, '抽满 10 抽后时效到期被清除');
ok(A.run('ruleVal("SSS_PITY")') === 300, '到期后规则自动还原为 300');
A.run(`state.temp.push({key:'SSS_PITY',op:'set',v:150,text:'测试-长',tone:'buff',perm:false,left:20,from:'测试'});`);
A.run('drawCards(10)'); await flush();
ok(A.run('state.temp.find(m=>m.text==="测试-长").left') === 10, '时效 20 抽抽掉 10 抽后剩 10 抽');
A.run('state.temp = []');

console.log('\n[4] 抽到 0-08 的完整链路：改写 + 重新预言 + 下一抽应验');
A.run('state.perm = []; state.temp = []; state.rewrites = 0; state.prophecy = {name:"0-08 阿勒苏霍德之笔", by:"测试者"};');
A.run('drawCards(1)'); await flush();
ok(A.run('state.rewrites') === 1, '抽到 0-08 触发 1 次规则改写', A.run('state.rewrites'));
ok(A.run('state.perm.length + state.temp.length') === 1, '改写被记录（永久或时效）');
ok(A.run('state.prophecy !== null'), '0-08 同时写下了新的预言');
ok(A.elements.get('rulesList').innerHTML.includes('rule-row'), '规则面板出现被改写的条目');
ok(A.elements.get('prophecyBox').className.includes('show'), '预言条已显示');
ok(A.elements.get('banner').innerHTML.includes('规则改写'), '抽卡横幅里显示了规则改写事件');
const promised = A.run('state.prophecy.name');
A.run('drawCards(1)'); await flush();
ok(A.elements.get('banner').innerHTML.includes(promised), '端到端：下一抽真的抽到了预言之卡「' + promised + '」');

console.log('\n[5] 存档持久化（模拟刷新页面）');
const snap = A.run('JSON.stringify({perm:state.perm,temp:state.temp,rewrites:state.rewrites,prophecy:state.prophecy})');
const B = makeContext(store);
const snap2 = B.run('JSON.stringify({perm:state.perm,temp:state.temp,rewrites:state.rewrites,prophecy:state.prophecy})');
ok(snap === snap2, '刷新后 永久/时效/预言 全部还原');
ok(B.run('ruleVal("SSS_PITY")') === A.run('ruleVal("SSS_PITY")'), '重载后保底抽数一致');

console.log('\n[6] 改写池：正负成对、按指定概率抽幅度');
A.run('state.perm = []; state.temp = [];');
const N = 200000;
const stats = JSON.parse(A.run(`(() => {
  const tone = { buff: 0, nerf: 0 }, keys = {}, setV = {}, addV = {};
  for (let i = 0; i < ${N}; i++) {
    const r = rollRewrite();
    tone[r.tone] = (tone[r.tone] || 0) + 1;
    keys[r.key] = (keys[r.key] || 0) + 1;
    if (r.key === 'SSS_PITY' && r.op === 'set') setV[r.v] = (setV[r.v] || 0) + 1;
    if (r.key === 'SSS_PITY' && r.op === 'add') addV[r.v] = (addV[r.v] || 0) + 1;
  }
  return JSON.stringify({ tone, keys, setV, addV });
})()`));
ok(!('TARO_PITY' in stats.keys), '改写池里不再出现塔罗会保底');
const buffShare = stats.tone.buff / N;
ok(buffShare > 0.50 && buffShare < 0.57, '正负大致各半（有利 ' + (buffShare * 100).toFixed(1) + '%）', buffShare.toFixed(3));
const p100 = stats.setV[100] / N, p1000 = stats.setV[1000] / N, p10000 = stats.setV[10000] / N;
ok(Math.abs(p100 - 0.10) < 0.005 && Math.abs(p1000 - 0.02375) < 0.004 && Math.abs(p10000 - 0.00125) < 0.001,
   'SSS 保底三档概率 ≈ 80 / 19 / 1（实测 ' + (p100 * 100).toFixed(2) + '% / ' + (p1000 * 100).toFixed(2) + '% / ' + (p10000 * 100).toFixed(2) + '%）',
   [p100, p1000, p10000]);
ok(Math.abs(stats.addV[100] - stats.addV[-10]) / N < 0.004, '+100 抽与 -10 抽出现概率相同',
   [stats.addV[100], stats.addV[-10]]);

console.log('\n[7] 爆率被疯狂改写也不崩');
A.run('state.perm = []; state.temp = [];');
A.run(`for (let i=0;i<12;i++) state.perm.push({key:'SSS_RATE',op:'mul',v:2,perm:true,text:'x'});`);
const rates = JSON.parse(A.run('JSON.stringify(effectiveRates())'));
ok(Math.abs(Object.values(rates).reduce((a, b) => a + b, 0) - 1) < 1e-9, '概率总和恒被归一化到 1');
ok(A.run('ruleVal("SSS_RATE")') <= 0.02, 'SSS 概率被夹在上限内', A.run('ruleVal("SSS_RATE")'));
ok(A.run('(()=>{for(let i=0;i<20000;i++){const r=rollRarity(); if(!CARDS_BY_RARITY[r]) return r;}})()') === undefined, '20000 次 rollRarity 都合法');
const clampT = A.run(`(() => {
  state.perm = [{key:'SSS_PITY',op:'add',v:100000,perm:true,text:'x'}];
  const hi = ruleVal('SSS_PITY');
  state.perm = [{key:'SSS_PITY',op:'add',v:-100000,perm:true,text:'x'}];
  const lo = ruleVal('SSS_PITY');
  state.perm = [];
  return JSON.stringify([hi, lo]);
})()`);
ok(clampT === '[20000,50]', '保底抽数夹在 50~20000 之间（10000 抽那档也能生效）', clampT);

console.log('\n[8] 压力测试：2000 次抽卡（含高频改写，带演出）');
A.run('state.perm = []; state.temp = []; state.rewrites = 0; state.prophecy = null;');
A.run(`
const __writerNames = CARDS.filter(c => c.rewrite).map(c => c.name);
window.__stress = (i) => {
  if (i % 5 === 0) state.prophecy = { name: __writerNames[i % __writerNames.length], by: '压力测试' };
  drawCards(Math.random() < 0.5 ? 1 : 10);
};`);
for (let i = 0; i < 2000; i++) { A.run(`window.__stress(${i})`); await flush(); }
ok(A.run('Object.keys(state.inventory).filter(n=>state.inventory[n] <= 0 || !isFinite(state.inventory[n])).length') === 0, '没有负数/异常库存');
ok(A.run('(state.temp||[]).filter(m=>!(m.left>0)).length') === 0, '时效条目剩余抽数恒为正');
ok(A.run('Object.keys(BASE_RULES).filter(k=>k!=="TEN_RARE").every(k=>isFinite(ruleVal(k)) && ruleVal(k) > 0)'), '所有数值规则仍为有限正数');
ok(A.run('state.rewrites') > 100, '压力测试中确实触发了大量改写', A.run('state.rewrites'));
ok(A.errors.length === 0 && B.errors.length === 0, '全程无未捕获异常', A.errors.map(e => e.message));

console.log('\n[9] 自然出货率：10 万次随机单抽');
A.run('state.perm = []; state.temp = []; state.prophecy = null;');
const natural = A.run(`(() => { let hits = 0; for (let i = 0; i < 100000; i++) if (drawOne().rewrite) hits++; return hits; })()`);
ok(natural > 40 && natural < 300, '10 万抽里触发 ' + natural + ' 次', natural);

console.log('\n[10] 存档码导出 / 导入');
A.run(`
state = { total: 12, pity: 30, singlePity: 2, inventory: {"克莱恩·莫雷蒂": 2, "0-08 阿勒苏霍德之笔": 1}, hunt: false,
          perm: [{key:'SSS_PITY',op:'set',v:1000,perm:true,text:'永久测试'}],
          temp: [{key:'SSS_RATE',op:'mul',v:0.5,perm:false,left:5,text:'时效测试'}],
          rewrites: 3, prophecy: {name:'阿蒙', by:'0-08'} };
save();`);
const saveCode = A.run('encodeSave()');
ok(saveCode.indexOf('LOM-1:') === 0, '存档码带 LOM-1: 前缀', saveCode.slice(0, 12));
const decoded = JSON.parse(A.run(`JSON.stringify(decodeSave(${JSON.stringify(saveCode)}))`));
ok(decoded.total === 12 && decoded.inventory['克莱恩·莫雷蒂'] === 2, '解回来抽数与卡数对得上');
ok(decoded.perm.length === 1 && decoded.temp.length === 1 && decoded.temp[0].left === 5, '永久/时效改写都带回来');
ok(decoded.prophecy && decoded.prophecy.name === '阿蒙', '未兑现的预言也带回来');
const rawJson = A.run('JSON.stringify({v:1,t:1,state:state})');
ok(JSON.parse(A.run(`JSON.stringify(decodeSave(${JSON.stringify(rawJson)}))`)).total === 12, '下载下来的原始 JSON 也能直接导入');
const pretty = A.run(`JSON.stringify({v:1,t:1,state:{total:1,pity:0,singlePity:0,inventory:{"0-08 阿勒苏霍德之笔":1},perm:[],temp:[],rewrites:0,prophecy:null}}, null, 2)`);
const prettyDecoded = JSON.parse(A.run(`JSON.stringify(decodeSave(${JSON.stringify(pretty)}))`));
ok(prettyDecoded.inventory['0-08 阿勒苏霍德之笔'] === 1, '带缩进换行的 JSON 也能导入，卡名里的空格没被吃掉');
const fenceWrapped = '```\n' + saveCode + '\n```';
ok(JSON.parse(A.run(`JSON.stringify(decodeSave(${JSON.stringify(fenceWrapped)}))`)).total === 12, '带反引号的存档码也能导入');
const zeroWrapped = saveCode.slice(0, 12) + String.fromCharCode(0x200b) + saveCode.slice(12);
ok(JSON.parse(A.run(`JSON.stringify(decodeSave(${JSON.stringify(zeroWrapped)}))`)).total === 12, '带零宽字符的存档码也能导入');
const foreign = A.run(`JSON.stringify({v:1,t:1,state:{total:0,pity:0,singlePity:0,inventory:{"不存在的卡":3,"克莱恩·莫雷蒂":1},perm:[],temp:[],rewrites:0,prophecy:null}})`);
const filtered = JSON.parse(A.run(`JSON.stringify(decodeSave(${JSON.stringify(foreign)}))`));
ok(!('不存在的卡' in filtered.inventory) && filtered.inventory['克莱恩·莫雷蒂'] === 1, '不认识的卡名会被丢掉，不虚增图鉴');
A.elements.get('saveText').value = '这不是存档';
const beforeTotal = A.run('state.total');
A.run('confirmImport()');
ok(A.run('state.total') === beforeTotal, '坏存档码不改动当前进度');
ok(A.elements.get('saveStatus').textContent.indexOf('❌') === 0, '坏码会给出提示');
A.run('state = { total: 0, pity: 0, singlePity: 0, inventory: {}, perm: [], temp: [], rewrites: 0, prophecy: null };');
A.elements.get('saveText').value = saveCode;
A.run('confirmImport()');
ok(A.run('state.total') === 12 && A.run('state.inventory["克莱恩·莫雷蒂"]') === 2, '覆盖导入把进度换成存档里的');
ok(A.elements.get('saveStatus').textContent.indexOf('已导入') >= 0, '导入成功后状态栏有提示');

console.log('\n[11] 本地存储不可用时给出警告');
ok(A.elements.get('saveWarn').style.display === 'none', '正常环境下隐藏警告');
const C = makeContext({}, true);
ok(C.elements.get('saveWarn').style.display === 'block', 'localStorage 被禁用时显示警告');
ok(C.elements.get('saveWarn').textContent.indexOf('本地存储') >= 0, '警告文案说明原因', C.elements.get('saveWarn').textContent.slice(0, 30));

console.log('\n' + (fail ? '❌' : '✅') + ' 通过 ' + pass + ' 项，失败 ' + fail + ' 项\n');
process.exit(fail ? 1 : 0);
