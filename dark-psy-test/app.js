/* =====================================================================
   变态心理测试 · 逻辑层
   计分模型：
     每个类型求特质分（反向题先转换），映射到 0-100 的"暗黑浓度"；
     变态指数   = 7 个核心暗黑特质的浓度平均；
     主导变态人格 = 7 个核心中浓度最高者；
     主导人格障碍 = 12 型人格障碍谱中浓度最高者（仅完整版）；
     潜伏综合征  = 4 个流行综合征中浓度最高者。
     跳过题按"中立"计分。
   ===================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const D = window.DARK_DATA;
  const SC = D.scoring;
  const LIKERT_LABELS = ['非常不同意', '不同意', '中立', '同意', '非常同意'];
  const BAND_LABEL = { low: '低危', mid: '中危', high: '高危' };

  const state = {
    version: 'full',
    shuffle: false,
    skip: true,
    order: [],        // 题目 id 序列
    answers: {},      // qid -> 1..5；跳过 -> null
    qi: 0,
    results: null,
    radarVerts: []
  };

  /* ---------------- 视图切换 ---------------- */
  function show(id) {
    ['view-start', 'view-test', 'view-result'].forEach((v) => { $(v).hidden = v !== id; });
    window.scrollTo(0, 0);
  }

  /* ---------------- 主题 ---------------- */
  let theme = null;
  $('themeToggle').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (state.results) drawRadar();
  });

  /* ---------------- 开始页 ---------------- */
  $('versionSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-version]');
    if (!btn) return;
    state.version = btn.dataset.version;
    document.querySelectorAll('#versionSeg button').forEach((b) => b.classList.toggle('active', b === btn));
  });

  $('btnStart').addEventListener('click', () => {
    state.shuffle = $('optShuffle').checked;
    state.skip = $('optSkip').checked;
    begin(false);
  });

  function begin(forceShuffle) {
    state.answers = {};
    state.qi = 0;
    state.results = null;
    if (forceShuffle) state.shuffle = true;

    let pool = state.version === 'light'
      ? D.questions.filter((q) => q.light)
      : D.questions.slice();
    if (state.shuffle) pool = shuffle(pool);
    state.order = pool.map((q) => q.id);
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
    const qid = state.order[i];
    const total = state.order.length;
    $('qCounter').textContent = '第 ' + (i + 1) + ' / ' + total + ' 题';
    $('progressFill').style.width = ((i + 1) / total) * 100 + '%';
    $('btnPrev').disabled = i === 0;
    $('btnSkip').hidden = !state.skip;

    const q = D.questions.find((x) => x.id === qid);
    // 不在作答页标注每题的测量方向，避免"迎合性作答"偏差（需求特征效应）
    $('dimTag').hidden = true;
    $('dimAbout').textContent = '凭第一直觉作答，无需反复权衡';
    $('dimAbout').hidden = false;
    $('qText').textContent = q.text;
    $('scaleLeft').hidden = false;
    $('scaleRight').hidden = false;
    $('btnNext').textContent = '下一题';

    const box = $('likertBtns');
    box.className = 'likert-btns';
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

    const answered = typeof state.answers[qid] === 'number';
    $('btnNext').disabled = !state.skip && !answered;
  }

  function typeOf(key) {
    return D.core.find((t) => t.key === key) ||
           D.pds.find((t) => t.key === key) ||
           D.bonus.find((t) => t.key === key);
  }

  function answer(qid, val) {
    state.answers[qid] = val;
    const box = $('likertBtns');
    Array.from(box.children).forEach((b, idx) => {
      b.classList.toggle('selected', idx + 1 === val);
      b.setAttribute('aria-checked', idx + 1 === val ? 'true' : 'false');
    });
    $('btnNext').disabled = false;
    setTimeout(next, 150);
  }

  function next() {
    if (state.qi < state.order.length - 1) { state.qi++; renderQ(state.qi); }
    else submit();
  }

  function prev() {
    if (state.qi > 0) { state.qi--; renderQ(state.qi); }
  }

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

  /* ---------------- 计分 ---------------- */
  function bandFor(pct) {
    if (pct >= SC.bandHigh) return 'high';
    if (pct >= SC.bandLow) return 'mid';
    return 'low';
  }

  function toPct(v) {
    return (v - SC.likertMin) / (SC.likertMax - SC.likertMin) * 100;
  }

  function computeResults() {
    const pdEnabled = state.version !== 'light';
    const coreTypes = D.core;
    const pdTypes = pdEnabled ? D.pds : [];
    const bonusTypes = D.bonus;
    const allTypes = coreTypes.concat(pdTypes, bonusTypes);

    const scores = {};
    allTypes.forEach((t) => {
      const qs = D.questions.filter((q) => q.type === t.key);
      const vals = qs.map((q) => {
        const raw = state.answers[q.id];
        const v = (raw == null) ? SC.neutral : raw;
        return q.reverse ? SC.likertMax + SC.likertMin - v : v;
      });
      const trait = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : SC.neutral;
      scores[t.key] = { ...t, pct: toPct(trait), band: bandFor(toPct(trait)) };
    });

    // 变态指数 = 7 个核心平均
    const corePcts = coreTypes.map((t) => scores[t.key].pct);
    const index = corePcts.reduce((a, b) => a + b, 0) / corePcts.length;

    // 主导 / 潜伏（浓度最高者，并列取顺序靠前）
    const dominant = coreTypes.reduce((a, b) => (scores[b.key].pct > scores[a.key].pct ? b : a));
    const latent = bonusTypes.reduce((a, b) => (scores[b.key].pct > scores[a.key].pct ? b : a));
    const dominantPd = pdTypes.length ? pdTypes.reduce((a, b) => (scores[b.key].pct > scores[a.key].pct ? b : a)) : null;

    const tier = D.indexTiers.find((t) => index <= t.max) || D.indexTiers[D.indexTiers.length - 1];

    return { index, tier, dominant, dominantPd, latent, scores, allTypes, pdEnabled };
  }

  function submit() {
    state.results = computeResults();
    renderResult(state.results);
    show('view-result');
    requestAnimationFrame(() => drawRadar());
  }

  /* ---------------- 结果渲染 ---------------- */
  function renderBarList(container, types, scores) {
    const list = $(container);
    list.innerHTML = '';
    types.slice().sort((a, b) => scores[b.key].pct - scores[a.key].pct).forEach((t) => {
      const s = scores[t.key];
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML =
        '<span class="bar-name">' + t.icon + ' ' + t.name + '</span>' +
        '<div class="bar-track"><div class="bar-fill ' + (s.band === 'high' ? 'high' : '') + '" style="width:' + Math.round(s.pct) + '%"></div></div>' +
        '<span class="bar-val">' + Math.round(s.pct) + '<span class="bar-band band-' + s.band + '">' + BAND_LABEL[s.band] + '</span></span>';
      list.appendChild(row);
    });
  }

  function renderResult(r) {
    const p = Math.round(r.index);
    $('heroNum').textContent = p;
    $('heroBadge').textContent = r.tier.label;
    $('dominantChip').textContent = r.dominant.icon + ' ' + r.dominant.name;
    $('latentChip').textContent = r.latent.icon + ' ' + r.latent.name;
    $('pdChip').textContent = r.dominantPd ? r.dominantPd.icon + ' ' + r.dominantPd.name : '—';
    $('heroNote').textContent = '你的暗黑指数为 ' + p + ' / 100（' + r.tier.label + '）。' + r.tier.text;

    // 全谱毒量表（三组）
    renderBarList('barListCore', D.core, r.scores);
    renderBarList('barListBonus', D.bonus, r.scores);
    if (r.pdEnabled) {
      $('pdGroup').hidden = false;
      renderBarList('barListPd', D.pds, r.scores);
    } else {
      $('pdGroup').hidden = true;
    }

    // 主导变态人格
    $('dominantTitle').textContent = r.dominant.icon + ' ' + r.dominant.name + ' · 主导变态人格';
    $('dominantText').innerHTML = '<b>' + D.dominantNotes[r.dominant.key] + '</b><br><br>' +
      D.bands[r.dominant.key][r.scores[r.dominant.key].band] +
      '<br><span style="color:var(--muted);font-size:12.5px;">浓度 ' + Math.round(r.scores[r.dominant.key].pct) + ' / 100 · ' + BAND_LABEL[r.scores[r.dominant.key].band] + '</span>';

    // 主导人格障碍谱型
    if (r.dominantPd) {
      $('pdCard').hidden = false;
      $('pdTitle').textContent = r.dominantPd.icon + ' ' + r.dominantPd.name + ' · 主导人格障碍谱型';
      $('pdText').innerHTML = '<b>' + D.pdNotes[r.dominantPd.key] + '</b><br><br>' +
        D.bands[r.dominantPd.key][r.scores[r.dominantPd.key].band] +
        '<br><span style="color:var(--muted);font-size:12.5px;">浓度 ' + Math.round(r.scores[r.dominantPd.key].pct) + ' / 100 · ' + BAND_LABEL[r.scores[r.dominantPd.key].band] + ' · 趣味对照，非诊断</span>';
    } else {
      $('pdCard').hidden = true;
    }

    // 潜伏综合征
    $('latentTitle').textContent = r.latent.icon + ' ' + r.latent.name + ' · 潜伏综合征';
    $('latentText').innerHTML = '<b>' + D.bonusNotes[r.latent.key] + '</b><br><br>' +
      D.bands[r.latent.key][r.scores[r.latent.key].band] +
      '<br><span style="color:var(--muted);font-size:12.5px;">浓度 ' + Math.round(r.scores[r.latent.key].pct) + ' / 100 · ' + BAND_LABEL[r.scores[r.latent.key].band] + '</span>';

    // 逐型详解
    const dl = $('detailList');
    dl.innerHTML = '';
    r.allTypes.forEach((t) => {
      const s = r.scores[t.key];
      const div = document.createElement('div');
      div.className = 'detail-item';
      div.innerHTML =
        '<div class="detail-head">' +
        '<span class="detail-name">' + t.icon + ' ' + t.name + '</span>' +
        '<span class="detail-age">' + Math.round(s.pct) + ' / 100</span>' +
        '<span class="detail-band band-' + s.band + '">' + BAND_LABEL[s.band] + '</span>' +
        '<span class="detail-age" style="color:var(--muted)">· ' + t.en + '</span>' +
        '</div>' +
        '<p class="detail-text">' + D.bands[t.key][s.band] + '</p>';
      dl.appendChild(div);
    });

    // 如何阅读
    const ht = $('howToList');
    ht.innerHTML = '';
    D.howToRead.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      ht.appendChild(li);
    });

    // 心理学依据与参考文献（GB/T 7714-2015）
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

    // 致谢
    const ab = $('ackBody');
    ab.innerHTML = '';
    D.acknowledgement.forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para;
      ab.appendChild(p);
    });

    $('disclaimer').textContent = D.disclaimer;
  }

  /* ---------------- 七型暗黑雷达 ---------------- */
  function drawRadar() {
    const canvas = $('radar');
    if (!canvas || !state.results) return;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    if (W < 10) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const css = getComputedStyle(document.documentElement);
    const C = {
      accent: css.getPropertyValue('--accent').trim() || '#2a78d6',
      grid: css.getPropertyValue('--grid').trim(),
      muted: css.getPropertyValue('--muted').trim(),
      ink2: css.getPropertyValue('--ink-2').trim(),
      card: css.getPropertyValue('--card').trim()
    };

    const r = state.results;
    const dims = D.core;                 // 7 个核心特质
    const N = dims.length;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 56;
    const ang = (i) => -Math.PI / 2 + i * 2 * Math.PI / N;
    const pt = (i, v) => {
      const a = ang(i), rad = R * (clamp(v, 0, 100) / 100);
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    };
    const poly = (points) => {
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
    };

    // 网格环
    [20, 40, 60, 80].forEach((v) => {
      poly(Array.from({ length: N }, (_, i) => pt(i, v)));
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 辐条 + 短名
    const verts = [];
    ctx.font = '12px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    dims.forEach((t, i) => {
      const [sx, sy] = pt(i, 0);
      const [ex, ey] = [cx + (R + 18) * Math.cos(ang(i)), cy + (R + 18) * Math.sin(ang(i))];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(t.short, ex, ey);
      const [vx, vy] = pt(i, r.scores[t.key].pct);
      verts.push({ name: t.name, pct: r.scores[t.key].pct, x: vx, y: vy });
    });

    // 主多边形
    poly(Array.from({ length: N }, (_, i) => pt(i, r.scores[dims[i].key].pct)));
    ctx.fillStyle = hexToRgba(C.accent, 0.16);
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 顶点 + 数值
    ctx.font = '11px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    dims.forEach((t, i) => {
      const [x, y] = pt(i, r.scores[t.key].pct);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = C.accent;
      ctx.fill();
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      const rad = R * (clamp(r.scores[t.key].pct, 0, 100) / 100) + 11;
      const [lx, ly] = [cx + rad * Math.cos(ang(i)), cy + rad * Math.sin(ang(i))];
      ctx.fillStyle = C.ink2;
      ctx.fillText(Math.round(r.scores[t.key].pct), lx, ly);
    });

    state.radarVerts = verts;
  }

  // 雷达图悬停提示
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
      tip.textContent = best.name + ' · 浓度 ' + Math.round(best.pct) + ' / 100';
      tip.style.left = best.x + 'px';
      tip.style.top = (best.y - 8) + 'px';
    } else if (tip) {
      tip.hidden = true;
    }
  });
  radar.addEventListener('mouseleave', () => { const tip = $('radarTip'); if (tip) tip.hidden = true; });

  window.addEventListener('resize', () => { if (state.results) drawRadar(); });

  /* ---------------- 工具 ---------------- */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // 按 GB/T 7714-2015 著录格式拼装文献条目
  function formatRef(ref) {
    let s = ref.authors + '. ' + ref.title;
    if (ref.type === 'J') {
      s += '[J]. ' + ref.journal + ', ' + ref.year + ', ' + ref.volume + '(' + ref.issue + '): ' + ref.pages + '.';
      if (ref.doi) s += ' DOI: ' + ref.doi + '.';
    } else if (ref.container) {
      s += '[M]//' + ref.container + '. ' + ref.publisher + ', ' + ref.year + '.';
    } else {
      s += '[M]. ' + (ref.edition ? ref.edition + '. ' : '') + ref.publisher + ', ' + ref.year + '.';
    }
    return s;
  }

  function hexToRgba(hex, alpha) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return 'rgba(42,120,214,' + alpha + ')';
    const n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  /* ---------------- 结果页按钮 ---------------- */
  $('btnRetrySame').addEventListener('click', () => begin(false));
  $('btnRetryShuffle').addEventListener('click', () => begin(true));
  $('btnRestart').addEventListener('click', () => show('view-start'));

  /* ---------------- 演示模式 ----------------
     打开 index.html#demo 可自动作答并直接看到结果页，方便预览效果。 */
  function demo() {
    state.version = 'full';
    state.shuffle = true;
    state.skip = true;
    const pool = D.questions.slice();
    state.order = shuffle(pool).map((q) => q.id);
    pool.forEach((q) => { state.answers[q.id] = 1 + Math.floor(Math.random() * 5); });
    submit();
  }
  if (window.location.hash === '#demo') demo();

})();
