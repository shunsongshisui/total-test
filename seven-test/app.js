/* =====================================================================
   七美德与七宗罪测试 · 逻辑层
   计分模型：
     每条"罪—美德"双极轴求罪端特质分（反向题先转换），映射到 0-100
     的"罪端浓度"（0 = 纯美德端，100 = 罪端满格）；
     罪孽指数   = 7 条轴的罪端浓度平均；
     主导之罪   = 罪端浓度最高的轴；
     守护美德   = 美德端浓度最高的轴（即罪端浓度最低的那条）。
     跳过题按"中立"计分。
   ===================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const D = window.SEVEN_DATA;
  const SC = D.scoring;
  const LIKERT_LABELS = ['非常不同意', '不同意', '中立', '同意', '非常同意'];
  const BAND_LABEL = { low: '美德主导', mid: '凡常', high: '罪端突出' };

  const state = {
    shuffle: false,
    skip: true,
    order: [],
    answers: {},
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

    let pool = D.questions.slice();
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
    // 不在作答页标注测量方向，避免"迎合性作答"偏差
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
    const sins = D.sins;
    const scores = {};
    sins.forEach((s) => {
      const qs = D.questions.filter((q) => q.type === s.key);
      const vals = qs.map((q) => {
        const raw = state.answers[q.id];
        const v = (raw == null) ? SC.neutral : raw;
        return q.reverse ? SC.likertMax + SC.likertMin - v : v;
      });
      const trait = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : SC.neutral;
      scores[s.key] = { ...s, pct: toPct(trait), band: bandFor(toPct(trait)) };
    });

    // 罪孽指数 = 7 条轴罪端浓度平均
    const index = sins.reduce((sum, s) => sum + scores[s.key].pct, 0) / sins.length;

    // 主导之罪 / 守护美德（并列取顺序靠前）
    const dominant = sins.reduce((a, b) => (scores[b.key].pct > scores[a.key].pct ? b : a));
    const guardian = sins.reduce((a, b) => (scores[b.key].pct < scores[a.key].pct ? b : a));

    const tier = D.indexTiers.find((t) => index <= t.max) || D.indexTiers[D.indexTiers.length - 1];

    return { index, tier, dominant, guardian, scores, sins };
  }

  function submit() {
    state.results = computeResults();
    renderResult(state.results);
    show('view-result');
    requestAnimationFrame(() => drawRadar());
  }

  /* ---------------- 结果渲染 ---------------- */
  function renderResult(r) {
    const p = Math.round(r.index);
    $('heroNum').textContent = p;
    $('heroBadge').textContent = r.tier.label;
    $('dominantChip').textContent = r.dominant.icon + ' ' + r.dominant.name;
    $('virtueChip').textContent = r.guardian.virtue;
    $('heroNote').textContent = '你的罪孽指数为 ' + p + ' / 100（' + r.tier.label + '）。' + r.tier.text;

    // 罪量表
    const list = $('barList');
    list.innerHTML = '';
    r.sins.slice().sort((a, b) => r.scores[b.key].pct - r.scores[a.key].pct).forEach((s) => {
      const sc = r.scores[s.key];
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML =
        '<span class="bar-name">' + s.icon + ' ' + s.name + '</span>' +
        '<div class="bar-track"><div class="bar-fill ' + (sc.band === 'high' ? 'high' : '') + '" style="width:' + Math.round(sc.pct) + '%"></div></div>' +
        '<span class="bar-val">' + Math.round(sc.pct) + '<span class="bar-band band-' + sc.band + '">' + BAND_LABEL[sc.band] + '</span></span>';
      list.appendChild(row);
    });

    // 主导之罪
    $('dominantTitle').textContent = r.dominant.icon + ' ' + r.dominant.name + ' · 主导之罪';
    $('dominantText').innerHTML = '<b>' + D.sinNotes[r.dominant.key] + '</b><br><br>' +
      D.bands[r.dominant.key][r.scores[r.dominant.key].band] +
      '<br><span style="color:var(--muted);font-size:12.5px;">罪端浓度 ' + Math.round(r.scores[r.dominant.key].pct) + ' / 100 · ' + BAND_LABEL[r.scores[r.dominant.key].band] + ' · 相对美德：' + r.dominant.virtue + '</span>';

    // 守护美德
    $('virtueTitle').textContent = r.guardian.virtue + ' · 守护美德';
    $('virtueText').innerHTML = '<b>' + D.virtueNotes[r.guardian.key] + '</b><br><br>' +
      D.bands[r.guardian.key][r.scores[r.guardian.key].band] +
      '<br><span style="color:var(--muted);font-size:12.5px;">罪端浓度 ' + Math.round(r.scores[r.guardian.key].pct) + ' / 100 · 这一条上你离美德端最近</span>';

    // 逐罪详解
    const dl = $('detailList');
    dl.innerHTML = '';
    r.sins.forEach((s) => {
      const sc = r.scores[s.key];
      const div = document.createElement('div');
      div.className = 'detail-item';
      div.innerHTML =
        '<div class="detail-head">' +
        '<span class="detail-name">' + s.icon + ' ' + s.name + '</span>' +
        '<span class="detail-age">' + Math.round(sc.pct) + ' / 100</span>' +
        '<span class="detail-band band-' + sc.band + '">' + BAND_LABEL[sc.band] + '</span>' +
        '<span class="detail-age" style="color:var(--muted)">· 对立美德：' + s.virtue + '</span>' +
        '</div>' +
        '<p class="detail-text">' + D.bands[s.key][sc.band] + '</p>' +
        (s.basis ? '<p class="detail-basis">' + s.basis + '</p>' : '');
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

    // 参考文献
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

  /* ---------------- 罪与德 · 上下对照雷达 ----------------
     上半圆 = 七宗罪（罪端浓度，红）；下半圆 = 七美德（美德浓度 = 100 − 罪端浓度，绿）。
     同一条轴上下镜像对称：上半画罪，下半画它的对立美德。 */
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
      danger: css.getPropertyValue('--danger').trim() || '#c25a3a',
      aqua: css.getPropertyValue('--aqua').trim() || '#1baf7a',
      grid: css.getPropertyValue('--grid').trim(),
      ink2: css.getPropertyValue('--ink-2').trim(),
      card: css.getPropertyValue('--card').trim()
    };

    const r = state.results;
    const sins = D.sins;
    const N = sins.length;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 60;
    // 罪在上半圆（角度 π→2π），美德在下半圆（角度 0→π），上下镜像
    const angUp = (i) => Math.PI + (i + 0.5) * Math.PI / N;
    const angDn = (i) => (i + 0.5) * Math.PI / N;
    const pt = (a, v) => {
      const rad = R * (clamp(v, 0, 100) / 100);
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    };
    const poly = (points) => {
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
    };

    // 网格环
    [20, 40, 60, 80].forEach((v) => {
      ctx.beginPath();
      ctx.arc(cx, cy, R * v / 100, 0, Math.PI * 2);
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 辐条 + 标签（罪上、美德下）
    const verts = [];
    ctx.font = '12px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    sins.forEach((s, i) => {
      const aUp = angUp(i), aDn = angDn(i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(aUp), cy + R * Math.sin(aUp));
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(s.short, cx + (R + 18) * Math.cos(aUp), cy + (R + 18) * Math.sin(aUp));

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(aDn), cy + R * Math.sin(aDn));
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(s.virtue, cx + (R + 18) * Math.cos(aDn), cy + (R + 18) * Math.sin(aDn));

      const sp = pt(aUp, r.scores[s.key].pct);
      const vp = pt(aDn, 100 - r.scores[s.key].pct);
      verts.push({ name: s.name + '（罪）', pct: r.scores[s.key].pct, x: sp[0], y: sp[1] });
      verts.push({ name: s.virtue + '（美德）', pct: 100 - r.scores[s.key].pct, x: vp[0], y: vp[1] });
    });

    // 罪多边形（上半）
    poly(sins.map((s, i) => pt(angUp(i), r.scores[s.key].pct)));
    ctx.fillStyle = hexToRgba(C.danger, 0.15);
    ctx.fill();
    ctx.strokeStyle = C.danger;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 美德多边形（下半）
    poly(sins.map((s, i) => pt(angDn(i), 100 - r.scores[s.key].pct)));
    ctx.fillStyle = hexToRgba(C.aqua, 0.15);
    ctx.fill();
    ctx.strokeStyle = C.aqua;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 顶点 + 数值
    ctx.font = '11px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    sins.forEach((s, i) => {
      const aUp = angUp(i), aDn = angDn(i);
      const sp = pt(aUp, r.scores[s.key].pct);
      ctx.beginPath();
      ctx.arc(sp[0], sp[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = C.danger;
      ctx.fill();
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(Math.round(r.scores[s.key].pct),
        cx + (R * (clamp(r.scores[s.key].pct, 0, 100) / 100) + 11) * Math.cos(aUp),
        cy + (R * (clamp(r.scores[s.key].pct, 0, 100) / 100) + 11) * Math.sin(aUp));

      const vp = pt(aDn, 100 - r.scores[s.key].pct);
      ctx.beginPath();
      ctx.arc(vp[0], vp[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = C.aqua;
      ctx.fill();
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(Math.round(100 - r.scores[s.key].pct),
        cx + (R * (clamp(100 - r.scores[s.key].pct, 0, 100) / 100) + 11) * Math.cos(aDn),
        cy + (R * (clamp(100 - r.scores[s.key].pct, 0, 100) / 100) + 11) * Math.sin(aDn));
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
      tip.textContent = best.name + ' · ' + Math.round(best.pct) + ' / 100';
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

  function formatRef(ref) {
    let s = ref.authors + '. ' + ref.title;
    if (ref.type === 'J') {
      s += '[J]. ' + ref.journal + ', ' + ref.year + ', ' + ref.volume + '(' + ref.issue + '): ' + ref.pages + '.';
      if (ref.doi) s += ' DOI: ' + ref.doi + '.';
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
    state.shuffle = true;
    state.skip = true;
    const pool = D.questions.slice();
    state.order = shuffle(pool).map((q) => q.id);
    pool.forEach((q) => { state.answers[q.id] = 1 + Math.floor(Math.random() * 5); });
    submit();
  }
  if (window.location.hash === '#demo') demo();

})();
