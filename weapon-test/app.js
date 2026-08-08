/* =====================================================================
   本命武器测试 · 逻辑层
   模型：7 维 × N 题（Likert 情境量表 或 forced 二选一快答，两种题量可选）
   → 理想武器画像 profile（7 维 0–100）
   → 与全库 341 件加权欧氏距离，最近者为本命武器，其次为候补。
   题型 × 题量六组合：likert/forced × 42/56/70（perDim 6/8/10），同一题库按维切分。
   视图：开始 / 答题 / 结果 / 图鉴（第 4 个视图）+ 详情弹层。
   模式：test（答题）或 fate（随机天命：随机生成非扁平 profile 走同一匹配）。
   ===================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const D = window.WEAPON_DATA;
  const SC = D.scoring;
  const DIM_KEYS = D.dims.map((d) => d.key);
  const LIKERT_LABELS = ['非常不同意', '不同意', '中立', '同意', '非常同意'];

  const state = {
    type: 'likert',        // 'likert' | 'forced'
    perDim: 6,             // 每维题数 6（42 题）| 8（56 题）| 10（70 题）
    shuffle: false,
    skip: true,
    pool: [],              // 当前轮抽出的题目数组（含对象引用）
    order: [],
    answers: {},
    answerSum: 0,          // 答案和，用于文案模板的确定性取模
    qi: 0,
    profile: null,
    results: null,
    mode: 'test',          // 'test' | 'fate'
    weapons: [],           // buildWeaponList 解析后的全库
    radarVerts: [],
    gallery: { cat: 'all', sub: 'all', query: '' },
    returnView: 'view-start'
  };

  /* ---------------- 武器库解析（启动时一次） ----------------
     将子类基础七维、icon、lore、phrase 合入每个条目并缓存，
     缺失字段继承子类，保证 341 件都有完整数据。 */
  function buildWeaponList() {
    state.weapons = D.weapons.map((w, i) => {
      const sub = D.subs[w.sub];
      return {
        id: w.id, n: w.n, en: w.en || '', sub: w.sub, order: i,
        cat: sub.cat, group: sub.group, label: sub.label,
        icon: w.icon || sub.icon,
        lore: w.lore || sub.lore || '',
        phrase: w.phrase || sub.phrase || '',
        stats: Object.assign({}, sub.stats, w.stats || {}),
        specs: w.specs || sub.specs || (D.specs && D.specs[w.id]) || null,  // 性能参数 [{k,v}...]，缺则弹层显示"待收录"
        img: w.img || sub.img || ''              // 图片路径，缺则用 emoji 占位
      };
    });
  }

  /* ---------------- 视图切换 ---------------- */
  const VIEWS = ['view-start', 'view-test', 'view-result', 'view-gallery'];
  function show(id) {
    VIEWS.forEach((v) => { $(v).hidden = v !== id; });
    window.scrollTo(0, 0);
  }

  /* ---------------- 主题 ---------------- */
  let theme = null;
  $('themeToggle').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (state.results) drawRadar();
    renderGallery();
  });

  /* ---------------- 开始页 ---------------- */
  function readType() {
    const t = document.querySelector('input[name="optType"]:checked');
    state.type = t ? t.value : 'likert';
    const n = document.querySelector('input[name="optPerDim"]:checked');
    state.perDim = n ? parseInt(n.value, 10) : 6;
  }

  $('btnStart').addEventListener('click', () => {
    readType();
    state.shuffle = $('optShuffle').checked;
    state.skip = $('optSkip').checked;
    state.mode = 'test';
    begin(false);
  });

  $('btnFate').addEventListener('click', () => {
    state.mode = 'fate';
    fate();
  });

  $('btnGallery').addEventListener('click', () => {
    state.returnView = 'view-start';
    openGallery();
  });

  /* 按维抽题：每维取前 perDim 道（likert 前 6/8/10 题恰好含 1/2/3 道反向题，
     forced 前 6/8/10 题恰好 3h+3l / 4h+4l / 5h+5l 平衡），跨维交替排列避免同一维连排。 */
  function buildPool() {
    const src = D.questions[state.type];
    const byDim = {};
    DIM_KEYS.forEach((k) => { byDim[k] = src.filter((q) => q.dim === k); });
    let pool = [];
    for (let i = 0; i < state.perDim; i++) {
      DIM_KEYS.forEach((k) => { if (byDim[k][i]) pool.push(byDim[k][i]); });
    }
    return pool;
  }

  function begin(forceShuffle) {
    state.answers = {};
    state.answerSum = 0;
    state.qi = 0;
    state.results = null;
    state.profile = null;
    if (forceShuffle) state.shuffle = true;

    state.pool = buildPool();
    if (state.shuffle) state.pool = shuffle(state.pool);
    state.order = state.pool.map((q) => q.id);
    show('view-test');
    renderQ(0);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------------- 答题页 ---------------- */
  function renderQ(i) {
    const q = state.pool[i];
    const qid = q.id;
    const total = state.order.length;
    $('qCounter').textContent = '第 ' + (i + 1) + ' / ' + total + ' 题';
    $('progressFill').style.width = ((i + 1) / total) * 100 + '%';
    $('btnPrev').disabled = i === 0;
    $('btnSkip').hidden = !state.skip;

    const isForced = q.type === 'forced';
    $('qText').textContent = q.text || (isForced ? '下面两种情况，你本能上更靠哪一种？' : '');
    $('btnNext').textContent = '下一题';
    $('dimAbout').textContent = isForced
      ? '别权衡，凭本能选，二选一没有对错'
      : '凭第一直觉作答，无需反复权衡';

    const scale = $('scaleLeft').parentElement;
    if (isForced) {
      scale.classList.add('forced-mode');
      // 把原 likert 三件套隐藏，改用两个大按钮
      const left = $('scaleLeft'), right = $('scaleRight');
      left.style.display = 'none';
      right.style.display = 'none';
      const box = $('likertBtns');
      box.classList.add('forced-btns');
      box.innerHTML = '';
      ['A', 'B'].forEach((key, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'forced-opt';
        b.textContent = (idx === 0 ? q.a : q.b) || '';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', state.answers[qid] === key ? 'true' : 'false');
        if (state.answers[qid] === key) b.classList.add('selected');
        b.addEventListener('click', () => answer(qid, key));
        box.appendChild(b);
      });
    } else {
      scale.classList.remove('forced-mode');
      const left = $('scaleLeft'), right = $('scaleRight');
      left.style.display = '';
      right.style.display = '';
      const box = $('likertBtns');
      box.classList.remove('forced-btns');
      box.innerHTML = '';
      const current = state.answers[qid];
      LIKERT_LABELS.forEach((label, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', current === idx + 1 ? 'true' : 'false');
        if (current === idx + 1) b.classList.add('selected');
        b.addEventListener('click', () => answer(qid, idx + 1));
        box.appendChild(b);
      });
    }

    const answered = state.answers[qid] != null;
    $('btnNext').disabled = !state.skip && !answered;
  }

  function answer(qid, val) {
    state.answers[qid] = val;
    const box = $('likertBtns');
    if (state.type === 'forced') {
      Array.from(box.children).forEach((b, idx) => {
        const key = ['A', 'B'][idx];
        b.classList.toggle('selected', key === val);
        b.setAttribute('aria-checked', key === val ? 'true' : 'false');
      });
    } else {
      Array.from(box.children).forEach((b, idx) => {
        b.classList.toggle('selected', idx + 1 === val);
        b.setAttribute('aria-checked', idx + 1 === val ? 'true' : 'false');
      });
    }
    $('btnNext').disabled = false;
    setTimeout(next, 150);
  }

  function next() {
    if (state.qi < state.order.length - 1) { state.qi++; renderQ(state.qi); }
    else submit();
  }
  function prev() { if (state.qi > 0) { state.qi--; renderQ(state.qi); } }
  function skip() {
    if (!state.skip) return;
    const qid = state.order[state.qi];
    state.answers[qid] = null;
    if (state.qi < state.order.length - 1) { state.qi++; renderQ(state.qi); }
    else submit();
  }

  $('btnNext').addEventListener('click', next);
  $('btnPrev').addEventListener('click', prev);
  $('btnSkip').addEventListener('click', skip);
  $('btnQuit').addEventListener('click', () => { show('view-start'); });

  /* ---------------- 计分：profile ---------------- */
  function valToScore(v, q) {
    if (v == null) return 50;                       // 跳过 → 中立
    if (q.type === 'forced') {
      // dir:'h' 选 A 推高该维 → 100；dir:'l' 选 A 压低该维 → 0
      const high = (q.dir === 'h') === (v === 'A');
      return high ? 100 : 0;
    }
    if (q.dir === '-') return (SC.likertMax - v) / (SC.likertMax - SC.likertMin) * 100;
    return (v - SC.likertMin) / (SC.likertMax - SC.likertMin) * 100;
  }

  function computeProfile() {
    const profile = {};
    const dimQs = {};
    state.pool.forEach((q) => { (dimQs[q.dim] = dimQs[q.dim] || []).push(q); });
    D.dims.forEach((d) => {
      const qs = dimQs[d.key] || [];
      if (!qs.length) { profile[d.key] = 50; return; }
      const vals = qs.map((q) => valToScore(state.answers[q.id], q));
      profile[d.key] = vals.reduce((a, b) => a + b, 0) / vals.length;
    });
    return profile;
  }

  /* ---------------- 匹配 ---------------- */
  const W = {};
  D.dims.forEach((d) => { W[d.key] = 1; });
  W.era = SC.eraWeight;

  function distSq(profile, stats) {
    let sum = 0, wsum = 0;
    D.dims.forEach((d) => {
      const delta = profile[d.key] - stats[d.key];
      const w = W[d.key];
      sum += w * delta * delta;
      wsum += w;
    });
    return sum / wsum;
  }

  function isFlat(profile) {
    const vals = DIM_KEYS.map((k) => profile[k]);
    return Math.max(...vals) - Math.min(...vals) < SC.flatRange;
  }

  function matchAll(profile) {
    const ranked = state.weapons.slice().map((w) => {
      const d = Math.sqrt(distSq(profile, w.stats));
      return { w: w, dist: d, match: clamp(Math.round(100 - d), 0, 100) };
    });
    ranked.sort((a, b) => a.dist - b.dist || a.w.order - b.w.order);
    return ranked;
  }

  function computeResults(profile) {
    const ranked = matchAll(profile);
    const flat = isFlat(profile);
    return { profile, ranked, flat };
  }

  function submit() {
    state.profile = computeProfile();
    // forced 答案是 'A'/'B' 字符串，统一折算成数值，保证 answerSum 为数字
    state.answerSum = Object.keys(state.answers).reduce((s, id) => {
      const v = state.answers[id];
      if (v == null) return s;
      return s + (typeof v === 'string' ? (v === 'A' ? 7 : 3) : v);
    }, 0);
    state.results = computeResults(state.profile);
    renderResult(state.results);
    show('view-result');
    requestAnimationFrame(() => drawRadar());
  }

  /* ---------------- 随机天命 ---------------- */
  function fate() {
    state.mode = 'fate';
    let profile;
    do {
      profile = {};
      DIM_KEYS.forEach((k) => { profile[k] = Math.floor(Math.random() * 101); });
    } while (isFlat(profile));                       // 排除扁平，保证气质"自洽"
    state.profile = profile;
    state.answerSum = Math.floor(Math.random() * 100000);
    state.results = computeResults(profile);
    renderResult(state.results);
    show('view-result');
    requestAnimationFrame(() => drawRadar());
  }

  /* ---------------- "为什么是你"（模板生成，不逐把手写） ---------------- */
  function dimName(key) { const d = D.dims.find((x) => x.key === key); return d ? d.name : key; }
  function pick(arr, salt) { return arr[salt % arr.length]; }
  function fill(tpl, map) {
    return tpl.replace(/\{(\w+)\}/g, (_, k) => map[k] !== undefined ? map[k] : '');
  }

  function whyText(profile, weapon) {
    const seed = state.answerSum || 1;
    const deltas = {};
    DIM_KEYS.forEach((k) => { deltas[k] = profile[k] - weapon.stats[k]; });
    const resonance = DIM_KEYS.filter((k) => weapon.stats[k] >= 60 && profile[k] >= 55 && Math.abs(deltas[k]) <= 15);
    const edge = DIM_KEYS.filter((k) => weapon.stats[k] - profile[k] >= 25);
    const gap = DIM_KEYS.filter((k) => Math.abs(deltas[k]) >= 35);
    const native = DIM_KEYS.filter((k) => profile[k] >= 60 && weapon.stats[k] < 55);

    const out = [];
    out.push(fill(pick(D.whyTemplates.opening, seed), { name: weapon.n }));

    if (resonance.length) {
      out.push(fill(pick(D.whyTemplates.resonance, seed + 1), { dim: dimName(resonance[0]) }));
      if (resonance.length > 1 && out.length < 4) {
        out.push(fill(pick(D.whyTemplates.resonance, seed + 2), { dim: dimName(resonance[1]) }));
      }
    } else if (native.length) {
      out.push(fill(pick(D.whyTemplates.native, seed + 1), { dim: dimName(native[0]) }));
    } else {
      out.push(fill(pick(D.whyTemplates.resonance, seed + 1), { dim: dimName(DIM_KEYS[seed % DIM_KEYS.length]) }));
    }

    if (edge.length && out.length < 4) {
      out.push(fill(pick(D.whyTemplates.edge, seed + 3), { dim: dimName(edge[0]) }));
    }
    if (gap.length && out.length < 4) {
      out.push(fill(pick(D.whyTemplates.gap, seed + 4), { dim: dimName(gap[0]) }));
    }
    out.push(fill(pick(D.whyTemplates.closing, seed + 5), { phrase: weapon.phrase }));

    return out;
  }

  /* ---------------- 结果渲染 ---------------- */
  function chipsFor(w) {
    const sub = D.subs[w.sub];
    const cat = D.cats.find((c) => c.key === w.cat);
    return [cat.name, w.group, sub.label];
  }

  function renderStatBars(container, stats, highlight) {
    const box = $(container);
    box.innerHTML = '';
    D.dims.forEach((d) => {
      const v = Math.round(stats[d.key]);
      const hl = highlight && highlight[d.key] != null ? Math.round(highlight[d.key]) : null;
      const row = document.createElement('div');
      row.className = 'wbar-row';
      row.innerHTML =
        '<span class="wbar-name">' + d.name + '<small>' + d.desc + '</small></span>' +
        '<div class="wbar-track"><div class="wbar-fill" style="width:' + v + '%"></div>' +
        (hl != null ? '<div class="wbar-marker" style="left:' + hl + '%"></div>' : '') +
        '</div>' +
        '<span class="wbar-val">' + v + '</span>';
      box.appendChild(row);
    });
  }

  function renderBackup(ranked) {
    const box = $('backupList');
    box.innerHTML = '';
    [1, 2].forEach((idx) => {
      const r = ranked[idx];
      if (!r) return;
      const w = r.w;
      const div = document.createElement('div');
      div.className = 'backup-item';
      div.innerHTML =
        '<span class="backup-icon">' + w.icon + '</span>' +
        '<div class="backup-mid"><b>' + w.n + '</b><span>' + w.group + ' · ' + w.label + '</span></div>' +
        '<span class="backup-match">' + r.match + '%</span>';
      div.addEventListener('click', () => openModal(w.id));
      box.appendChild(div);
    });
  }

  function renderResult(r) {
    const top = r.ranked[0];
    const w = top.w;
    const sub = D.subs[w.sub];

    // 大卡
    $('weaponHeroEmoji').textContent = w.icon;
    $('weaponHeroName').textContent = w.n;
    $('weaponHeroEn').textContent = w.en;
    const chips = chipsFor(w);
    $('weaponHeroChips').innerHTML = chips.map((c) => '<span class="chip-mini">' + c + '</span>').join('');
    $('weaponHeroMatch').textContent = '契合度 ' + top.match + '%';
    $('weaponHeroMatch').style.color = matchColor(top.match);

    // 横幅
    const fateEl = $('fateBanner');
    if (state.mode === 'fate') {
      fateEl.hidden = false;
      fateEl.textContent = '🎲 命运替你掷骰：它随机翻出一套战斗气质，再从全库挑中了它。';
    } else {
      fateEl.hidden = true;
    }
    const flatEl = $('flatBanner');
    if (r.flat) {
      flatEl.hidden = false;
      flatEl.textContent = '🕊️ 白纸之境：你的画像在各维度几乎一致，任何武器都可能认领你，这把它只是抢了先。';
    } else {
      flatEl.hidden = true;
    }

    // 雷达 + 属性条
    renderStatBars('statBars', w.stats, r.profile);

    // 小传 + 心声
    $('weaponLore').innerHTML = '<b>' + w.n + ' · 小传</b><br>' + (w.lore || '传世之器，待主而鸣。');
    $('weaponPhrase').innerHTML = '<b>' + w.n + ' · 心声</b><br>' + (w.phrase || '我等的，就是你这样的人。');

    // 为什么是你
    const sentences = whyText(r.profile, w);
    $('whyBody').innerHTML = sentences.map((s) => '<p class="why-line">' + s + '</p>').join('');

    // 候补
    renderBackup(r.ranked);

    // 子类名
    $('subfamilyNote').textContent = '你的本命落在「' + sub.label + '」这一类，同一类下，还有 ' +
      (state.weapons.filter((x) => x.sub === w.sub).length - 1) + ' 位同门与你气质相仿。';

    $('galleryFromResult').onclick = () => {
      state.returnView = 'view-result';
      openGallery();
    };
  }

  function matchColor(m) {
    if (m >= 85) return 'var(--gold)';
    if (m >= 70) return 'var(--aqua-strong)';
    return 'var(--muted)';
  }

  /* ---------------- 雷达（你的 profile vs 本命武器 stats） ---------------- */
  function drawRadar() {
    const canvas = $('radar');
    if (!canvas || !state.results) return;
    const rect = canvas.getBoundingClientRect();
    const Wc = rect.width, H = rect.height;
    if (Wc < 10) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(Wc * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const css = getComputedStyle(document.documentElement);
    const C = {
      accent: css.getPropertyValue('--accent').trim() || '#2a78d6',
      gold: css.getPropertyValue('--gold').trim() || '#b8860b',
      grid: css.getPropertyValue('--grid').trim() || '#e1e0d9',
      ink2: css.getPropertyValue('--ink-2').trim() || '#52514e',
      card: css.getPropertyValue('--card').trim() || '#ffffff'
    };

    const r = state.results;
    const weapon = r.ranked[0].w;
    const profile = r.profile;
    const N = DIM_KEYS.length;
    const cx = Wc / 2, cy = H / 2;
    const R = Math.min(Wc, H) / 2 - 46;
    const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
    const pt = (a, v) => {
      const rad = R * (clamp(v, 0, 100) / 100);
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    };
    const poly = (points) => {
      ctx.beginPath();
      points.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
    };

    [20, 40, 60, 80].forEach((v) => {
      ctx.beginPath();
      ctx.arc(cx, cy, R * v / 100, 0, Math.PI * 2);
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.font = '12px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    DIM_KEYS.forEach((k, i) => {
      const a = ang(i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      const d = D.dims.find((x) => x.key === k);
      ctx.fillText(d.short, cx + (R + 18) * Math.cos(a), cy + (R + 18) * Math.sin(a));
    });

    // 武器 stats 多边形（虚线 · gold）
    poly(DIM_KEYS.map((k, i) => pt(ang(i), weapon.stats[k])));
    ctx.fillStyle = hexToRgba(C.gold, 0.10);
    ctx.fill();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 你的 profile 多边形（实线 · accent）
    poly(DIM_KEYS.map((k, i) => pt(ang(i), profile[k])));
    ctx.fillStyle = hexToRgba(C.accent, 0.12);
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    const verts = [];
    DIM_KEYS.forEach((k, i) => {
      const a = ang(i);
      const p = pt(a, profile[k]);
      verts.push({ name: D.dims.find((x) => x.key === k).name + ' · 你', pct: Math.round(profile[k]), x: p[0], y: p[1] });
      ctx.beginPath();
      ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = C.accent;
      ctx.fill();
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const wp = pt(a, weapon.stats[k]);
      ctx.beginPath();
      ctx.arc(wp[0], wp[1], 3.5, 0, Math.PI * 2);
      ctx.fillStyle = C.gold;
      ctx.fill();
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    state.radarVerts = verts;
  }

  const radar = $('radar');
  radar.addEventListener('mousemove', (e) => {
    const rect = radar.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let best = null, bd = 24;
    state.radarVerts.forEach((v) => {
      const dd = Math.hypot(mx - v.x, my - v.y);
      if (dd < bd) { bd = dd; best = v; }
    });
    const tip = $('radarTip');
    if (best && tip) {
      tip.hidden = false;
      tip.textContent = best.name + ' · ' + best.pct + ' / 100';
      tip.style.left = best.x + 'px';
      tip.style.top = (best.y - 8) + 'px';
    } else if (tip) tip.hidden = true;
  });
  radar.addEventListener('mouseleave', () => { const tip = $('radarTip'); if (tip) tip.hidden = true; });
  window.addEventListener('resize', () => { if (state.results) drawRadar(); });

  /* ---------------- 图鉴 ---------------- */
  function openGallery() {
    renderGallery();
    show('view-gallery');
  }

  function galleryFiltered() {
    const g = state.gallery;
    let list = state.weapons;
    if (g.cat !== 'all') list = list.filter((w) => w.cat === g.cat);
    if (g.sub !== 'all') list = list.filter((w) => w.sub === g.sub);
    if (g.query) {
      const q = g.query.toLowerCase();
      list = list.filter((w) => w.n.toLowerCase().indexOf(q) !== -1 || (w.en || '').toLowerCase().indexOf(q) !== -1);
    }
    return list;
  }

  function renderGallery() {
    // 大类 tabs
    const tabs = $('galleryCatTabs');
    tabs.innerHTML = '';
    const cats = [{ key: 'all', name: '全部', icon: '🗂️' }].concat(D.cats);
    cats.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab-pill' + (state.gallery.cat === c.key ? ' active' : '') + ' cat-' + c.key;
      b.textContent = c.icon + ' ' + c.name;
      b.addEventListener('click', () => { state.gallery.cat = c.key; state.gallery.sub = 'all'; renderGallery(); });
      tabs.appendChild(b);
    });

    // 子类 chips（当前大类下）
    const chips = $('gallerySubChips');
    chips.innerHTML = '';
    const subKeys = Object.keys(D.subs)
      .filter((k) => state.gallery.cat === 'all' || D.subs[k].cat === state.gallery.cat)
      .sort((a, b) => {
        const sa = D.subs[a], sb = D.subs[b];
        return sa.group.localeCompare(sb.group, 'zh') || sa.label.localeCompare(sb.label, 'zh');
      });
    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.className = 'chip-pill' + (state.gallery.sub === 'all' ? ' active' : '');
    allChip.textContent = '全部分类';
    allChip.addEventListener('click', () => { state.gallery.sub = 'all'; renderGallery(); });
    chips.appendChild(allChip);
    subKeys.forEach((k) => {
      const s = D.subs[k];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip-pill' + (state.gallery.sub === k ? ' active' : '');
      b.textContent = s.label;
      b.addEventListener('click', () => { state.gallery.sub = k; renderGallery(); });
      chips.appendChild(b);
    });

    // 数量
    const list = galleryFiltered();
    $('galleryCount').textContent = '共 ' + state.weapons.length + ' 件 · 当前显示 ' + list.length + ' 件';

    // 网格
    const grid = $('galleryGrid');
    grid.innerHTML = '';
    list.forEach((w) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'wtile cat-' + w.cat;
      tile.innerHTML = '<span class="wtile-icon">' + w.icon + '</span><span class="wtile-name">' + w.n + '</span><span class="wtile-sub">' + w.label + '</span>';
      tile.addEventListener('click', () => openModal(w.id));
      grid.appendChild(tile);
    });
  }

  $('gallerySearch').addEventListener('input', (e) => {
    state.gallery.query = e.target.value.trim();
    renderGallery();
  });
  $('galleryBack').addEventListener('click', () => {
    show(state.returnView === 'view-result' && state.results ? 'view-result' : 'view-start');
  });

  /* ---------------- 详情弹层 ---------------- */
  function openModal(id) {
    const w = state.weapons.find((x) => x.id === id);
    if (!w) return;
    const chips = chipsFor(w);
    $('modalIcon').textContent = w.icon;
    $('modalName').textContent = w.n;
    $('modalEn').textContent = w.en;
    $('modalChips').innerHTML = chips.map((c) => '<span class="chip-mini">' + c + '</span>').join('');
    renderStatBars('modalStats', w.stats, null);

    // 性能参数表
    const specBox = $('modalSpecs');
    if (w.specs && w.specs.length) {
      specBox.hidden = false;
      specBox.innerHTML = w.specs.map(function (s) {
        return '<div class="spec-row"><span class="spec-k">' + s.k + '</span><span class="spec-v">' + s.v + '</span></div>';
      }).join('');
    } else {
      specBox.hidden = false;
      specBox.innerHTML = '<div class="spec-row spec-pending">详细参数待收录，先看个大概。</div>';
    }

    // 图片位
    const imgBox = $('modalImg');
    if (w.img) {
      imgBox.hidden = false;
      imgBox.classList.add('has-img');
      imgBox.innerHTML = '<img src="' + w.img + '" alt="' + w.n + '">';
    } else {
      imgBox.hidden = false;
      imgBox.classList.remove('has-img');
      imgBox.innerHTML = '<div class="img-placeholder">' + w.icon + '<span>暂无实拍图</span></div>';
    }

    // 来龙去脉：优先独立故事，退回子类背景
    const storyBox = $('modalStory');
    const st = (D.stories && D.stories[w.id]) || (D.subStories && D.subStories[w.sub]);
    if (st) {
      storyBox.innerHTML = [
        '<div class="story-row"><span class="story-k">起源</span><span class="story-v">' + st.origin + '</span></div>',
        '<div class="story-row"><span class="story-k">历史</span><span class="story-v">' + st.history + '</span></div>',
        '<div class="story-row"><span class="story-k">性能</span><span class="story-v">' + st.perf + '</span></div>'
      ].join('');
    } else {
      storyBox.innerHTML = '<div class="story-row story-pending">来历待考，先记住它的形制。</div>';
    }

    $('modalLore').textContent = w.lore || '传世之器，待主而鸣。';
    $('modalPhrase').textContent = '「' + (w.phrase || '我等的，就是你这样的人。') + '」';
    $('weaponModal').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    $('weaponModal').hidden = true;
    document.body.style.overflow = '';
  }
  $('modalClose').addEventListener('click', closeModal);
  $('weaponModal').addEventListener('click', (e) => { if (e.target.id === 'weaponModal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('weaponModal').hidden) closeModal(); });

  /* ---------------- 结果页按钮 ---------------- */
  $('btnRetrySame').addEventListener('click', () => { state.mode = 'test'; begin(false); });
  $('btnRetryShuffle').addEventListener('click', () => { state.mode = 'test'; begin(true); });
  $('btnRestart').addEventListener('click', () => { show('view-start'); });

  /* ---------------- 静态内容（如何阅读 / 参考文献 / 致谢 / 免责声明） ---------------- */
  function formatRef(ref) {
    let s = ref.authors + '. ' + ref.title;
    s += '[M]. ' + (ref.edition ? ref.edition + '. ' : '') + ref.publisher + ', ' + ref.year + '.';
    return s;
  }

  function renderStatic() {
    const ht = $('howToList');
    ht.innerHTML = '';
    D.howToRead.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      ht.appendChild(li);
    });

    $('basisIntro').textContent = D.basisIntro;
    const rf = $('refList');
    rf.innerHTML = '';
    D.references.forEach((ref, i) => {
      const li = document.createElement('li');
      const num = document.createElement('span');
      num.className = 'ref-num';
      num.textContent = '[' + (i + 1) + ']';
      const cite = document.createElement('span');
      cite.className = 'ref-cite';
      cite.textContent = formatRef(ref);
      const note = document.createElement('span');
      note.className = 'ref-note';
      note.textContent = '引用说明：' + ref.note;
      li.appendChild(num);
      li.appendChild(cite);
      li.appendChild(note);
      rf.appendChild(li);
    });

    const ab = $('ackBody');
    ab.innerHTML = '';
    D.acknowledgement.forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para;
      ab.appendChild(p);
    });

    $('disclaimer').textContent = D.disclaimer;
  }

  /* ---------------- 工具 ---------------- */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function hexToRgba(hex, alpha) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return 'rgba(42,120,214,' + alpha + ')';
    const n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  /* ---------------- 启动 ---------------- */
  buildWeaponList();
  renderStatic();
  renderGallery();   // 预渲染图鉴（隐藏视图）
  if (window.location.hash === '#demo') fate();
})();
