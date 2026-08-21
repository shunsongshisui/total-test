global.window = global;
require('../data.js');
require('../data-cold.js');
require('../data-guns.js');
require('../data-exp.js');
require('../data-mythic.js');
const D = global.window.WEAPON_DATA;
const SC = D.scoring;
const DIM_KEYS = D.dims.map(d=>d.key);
const weapons = D.weapons.map((w,i)=>{const sub=D.subs[w.sub];return{id:w.id,cat:sub.cat,sub:w.sub,stats:Object.assign({},sub.stats,w.stats||{})};});
const W={};DIM_KEYS.forEach(k=>W[k]=1);W.era=SC.eraWeight;
function distSq(p,s){let sum=0,wsum=0;DIM_KEYS.forEach(k=>{const delta=p[k]-s[k];sum+=W[k]*delta*delta;wsum+=W[k];});return sum/wsum;}
function top(p,n){const r=weapons.map(w=>({id:w.id,cat:w.cat,d:Math.sqrt(distSq(p,w.stats))})).sort((a,b)=>a.d-b.d);return r.slice(0,n);}
const cases = {
  '全50': {power:50,speed:50,precision:50,range:50,mobility:50,toughness:50,era:50},
  '偏热era90': {power:50,speed:50,precision:50,range:50,mobility:50,toughness:50,era:90},
  '偏冷era5': {power:50,speed:50,precision:50,range:50,mobility:50,toughness:50,era:5},
  '迅捷型': {power:30,speed:90,precision:50,range:50,mobility:80,toughness:30,era:50},
  '狙击型': {power:80,speed:30,precision:95,range:95,mobility:30,toughness:50,era:90},
  '刚猛型': {power:95,speed:40,precision:40,range:30,mobility:40,toughness:90,era:20},
};
for(const [name,p] of Object.entries(cases)){
  const t = top(p,3);
  console.log(name, '->', t.map(x=>x.id+'('+x.cat+'):'+x.d.toFixed(1)).join('  '));
}
let cold=0,gun=0,exp=0,myth=0;
const seen={};
for(let i=0;i<1000;i++){
  let p; do{ p={}; DIM_KEYS.forEach(k=>p[k]=Math.floor(Math.random()*101)); }while(Math.max(...DIM_KEYS.map(k=>p[k]))-Math.min(...DIM_KEYS.map(k=>p[k]))<15);
  const w=top(p,1)[0];
  if(w.cat==='cold')cold++; else if(w.cat==='gun')gun++; else if(w.cat==='exp')exp++; else myth++;
  seen[w.id]=(seen[w.id]||0)+1;
}
console.log('1000随机 -> cold:',cold,'gun:',gun,'exp:',exp,'mythic:',myth);
const sorted=Object.entries(seen).sort((a,b)=>b[1]-a[1]);
console.log('赢家前10:', sorted.slice(0,10).map(([k,v])=>k+':'+v).join(' '));
