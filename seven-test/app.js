/* =====================================================================
   七美德与七宗罪测试 · 逻辑层
   模型：7 宗罪与 7 美德是【独立】维度，分开计分、互不抵消。
     罪孽指数 = 7 宗罪浓度平均；美德指数 = 7 美德浓度平均。
     主导之罪 = 罪端最高；守护美德 = 美德最高。
     罪德共存 = 同一对照组合里，罪与德浓度都 ≥ 阈值的组合。
     跳过题按"中立"计分。
   ===================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const D = window.SEVEN_DATA;
  const SC = D.scoring;
  const LIKERT_LABELS = ['非常不同意', '不同意', '中立', '同意', '非常同意'];
  const SIN_BAND_LABEL = { low: '较轻', mid: '中等', high: '较重' };
  const VIRTUE_BAND_LABEL = { low: '尚浅', mid: '中等', high: '丰沛' };

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

  function scoreType(key) {
    const qs = D.questions.filter((q) => q.type === key);
    const vals = qs.map((q) => {
      const raw = state.answers[q.id];
      return (raw == null) ? SC.neutral : raw;
    });
    const trait = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : SC.neutral;
    return toPct(trait);
  }

  function computeResults() {
    // 7 宗罪
    const sinScores = {};
    D.sins.forEach((s) => { sinScores[s.key] = { ...s, pct: scoreType(s.key), band: bandFor(scoreType(s.key)) }; });
    // 7 美德
    const virtueScores = {};
    D.virtues.forEach((v) => { virtueScores[v.key] = { ...v, pct: scoreType(v.key), band: bandFor(scoreType(v.key)) }; });

    // 两个独立指数
    const sinIndex = D.sins.reduce((sum, s) => sum + sinScores[s.key].pct, 0) / D.sins.length;
    const virtueIndex = D.virtues.reduce((sum, v) => sum + virtueScores[v.key].pct, 0) / D.virtues.length;

    // 主导之罪 / 守护美德
    const dominant = D.sins.reduce((a, b) => (sinScores[b.key].pct > sinScores[a.key].pct ? b : a));
    const guardian = D.virtues.reduce((a, b) => (virtueScores[b.key].pct > virtueScores[a.key].pct ? b : a));

    // 罪德共存：同一对照组合里罪、德都 >= 阈值
    const coexist = D.pairs.filter((p) =>
      sinScores[p.sin].pct >= SC.coexistThreshold && virtueScores[p.virtue].pct >= SC.coexistThreshold
    );

    const sinTier = D.sinTiers.find((t) => sinIndex <= t.max) || D.sinTiers[D.sinTiers.length - 1];
    const virtueTier = D.virtueTiers.find((t) => virtueIndex <= t.max) || D.virtueTiers[D.virtueTiers.length - 1];

    return { sinIndex, virtueIndex, sinTier, virtueTier, dominant, guardian, coexist, sinScores, virtueScores };
  }

  function submit() {
    state.results = computeResults();
    renderResult(state.results);
    show('view-result');
    requestAnimationFrame(() => drawRadar());
  }

  /* ---------------- 结果渲染 ---------------- */
  function renderBarList(container, scores, keys) {
    const list = $(container);
    list.innerHTML = '';
    keys.slice().sort((a, b) => scores[b.key].pct - scores[a.key].pct).forEach((d) => {
      const s = scores[d.key];
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML =
        '<span class="bar-name">' + d.icon + ' ' + d.name + '</span>' +
        '<div class="bar-track"><div class="bar-fill ' + (s.band === 'high' ? 'high' : '') + '" style="width:' + Math.round(s.pct) + '%"></div></div>' +
        '<span class="bar-val">' + Math.round(s.pct) + '<span class="bar-band band-' + s.band + '">' + (isSin(d.key) ? SIN_BAND_LABEL[s.band] : VIRTUE_BAND_LABEL[s.band]) + '</span></span>';
      list.appendChild(row);
    });
  }

  function isSin(key) { return D.sins.some((s) => s.key === key); }

  function renderResult(r) {
    const ps = Math.round(r.sinIndex), pv = Math.round(r.virtueIndex);
    $('heroNum').textContent = ps;
    $('heroBadge').textContent = r.sinTier.label;
    $('virtueNum').textContent = pv;
    $('virtueBadge').textContent = r.virtueTier.label;
    $('dominantChip').textContent = r.dominant.icon + ' ' + r.dominant.name;
    $('virtueChip').textContent = r.guardian.name;
    $('heroNote').innerHTML = '你的<b style="color:var(--danger)">罪孽指数 ' + ps + '</b>（' + r.sinTier.label + '）· <b style="color:var(--aqua-strong)">美德指数 ' + pv + '</b>（' + r.virtueTier.label + '）。两个分数相互独立——罪高不妨碍德高，德高也不抵消罪高。' +
      (r.coexist.length ? '下面"罪德共存"列出了你身上同时高涨的组合。' : '');

    // 罪德共存
    const ce = $('coexistText');
    if (r.coexist.length) {
      const html = r.coexist.map((p) => {
        const sin = D.sins.find((s) => s.key === p.sin);
        const vir = D.virtues.find((v) => v.key === p.virtue);
        return '<div class="coexist-item"><b>' + sin.icon + ' ' + sin.name + ' × ' + vir.icon + ' ' + vir.name + '</b><span>「' + sin.name + '」' + Math.round(r.sinScores[p.sin].pct) + ' 与「' + vir.name + '」' + Math.round(r.virtueScores[p.virtue].pct) + ' 同时在线——它们不冲突，反而组成了完整的你。</span></div>';
      }).join('');
      ce.innerHTML = '这些组合里，罪与德并非此消彼长，而是<b>同时高涨</b>：' + html;
    } else {
      ce.innerHTML = '目前你的罪与德大多此消彼长，没有同时高涨的组合。但这不代表它们不能共存——只是眼下还没遇到让两股力量一起发力的时刻。';
    }

    // 双量表
    renderBarList('sinList', r.sinScores, D.sins);
    renderBarList('virtueList', r.virtueScores, D.virtues);

    // 主导之罪
    $('dominantTitle').textContent = r.dominant.icon + ' ' + r.dominant.name + ' · 主导之罪';
    $('dominantText').innerHTML = '<b>' + D.sinNotes[r.dominant.key] + '</b><br><br>' +
      D.sinBands[r.dominant.key][r.sinScores[r.dominant.key].band] +
      '<br><span style="color:var(--muted);font-size:12.5px;">罪端浓度 ' + Math.round(r.sinScores[r.dominant.key].pct) + ' / 100 · ' + SIN_BAND_LABEL[r.sinScores[r.dominant.key].band] + '</span>';

    // 守护美德
    $('virtueTitle').textContent = r.guardian.icon + ' ' + r.guardian.name + ' · 守护美德';
    $('virtueText').innerHTML = '<b>' + D.virtueNotes[r.guardian.key] + '</b><br><br>' +
      D.virtueBands[r.guardian.key][r.virtueScores[r.guardian.key].band] +
      '<br><span style="color:var(--muted);font-size:12.5px;">美德浓度 ' + Math.round(r.virtueScores[r.guardian.key].pct) + ' / 100 · ' + VIRTUE_BAND_LABEL[r.virtueScores[r.guardian.key].band] + '</span>';

    // 逐维详解（7 罪 + 7 德）
    const dl = $('detailList');
    dl.innerHTML = '';
    D.sins.forEach((s) => {
      const sc = r.sinScores[s.key];
      const vir = D.virtues.find((v) => v.key === D.pairs.find((p) => p.sin === s.key).virtue);
      const div = document.createElement('div');
      div.className = 'detail-item';
      div.innerHTML =
        '<div class="detail-head">' +
        '<span class="detail-name">' + s.icon + ' ' + s.name + ' <small style="color:var(--muted);font-weight:400;">罪</small></span>' +
        '<span class="detail-age">' + Math.round(sc.pct) + ' / 100</span>' +
        '<span class="detail-band band-' + sc.band + '">' + SIN_BAND_LABEL[sc.band] + '</span>' +
        '<span class="detail-age" style="color:var(--muted)">· 对照：' + vir.name + '</span>' +
        '</div>' +
        '<p class="detail-text">' + D.sinBands[s.key][sc.band] + '</p>' +
        '<p class="detail-basis">' + s.basis + '</p>';
      dl.appendChild(div);
    });
    D.virtues.forEach((v) => {
      const sc = r.virtueScores[v.key];
      const sin = D.sins.find((s) => s.key === v.paired);
      const div = document.createElement('div');
      div.className = 'detail-item virtue-detail';
      div.innerHTML =
        '<div class="detail-head">' +
        '<span class="detail-name">' + v.icon + ' ' + v.name + ' <small style="color:var(--muted);font-weight:400;">德</small></span>' +
        '<span class="detail-age">' + Math.round(sc.pct) + ' / 100</span>' +
        '<span class="detail-band band-' + sc.band + '">' + VIRTUE_BAND_LABEL[sc.band] + '</span>' +
        '<span class="detail-age" style="color:var(--muted)">· 对照：' + sin.name + '</span>' +
        '</div>' +
        '<p class="detail-text">' + D.virtueBands[v.key][sc.band] + '</p>' +
        '<p class="detail-basis">' + v.basis + '</p>';
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

  /* ---------------- 罪与德 · 上下对照雷达（两半独立） ---------------- */
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
    const pairs = D.pairs;
    const N = pairs.length;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 60;
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

    [20, 40, 60, 80].forEach((v) => {
      ctx.beginPath();
      ctx.arc(cx, cy, R * v / 100, 0, Math.PI * 2);
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    const verts = [];
    ctx.font = '12px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    pairs.forEach((p, i) => {
      const sin = D.sins.find((s) => s.key === p.sin);
      const vir = D.virtues.find((v) => v.key === p.virtue);
      const aUp = angUp(i), aDn = angDn(i);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(aUp), cy + R * Math.sin(aUp));
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(sin.short, cx + (R + 18) * Math.cos(aUp), cy + (R + 18) * Math.sin(aUp));

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(aDn), cy + R * Math.sin(aDn));
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(vir.short, cx + (R + 18) * Math.cos(aDn), cy + (R + 18) * Math.sin(aDn));

      const sp = pt(aUp, r.sinScores[p.sin].pct);
      const vp = pt(aDn, r.virtueScores[p.virtue].pct);
      verts.push({ name: sin.name + '（罪）', pct: r.sinScores[p.sin].pct, x: sp[0], y: sp[1] });
      verts.push({ name: vir.name + '（德）', pct: r.virtueScores[p.virtue].pct, x: vp[0], y: vp[1] });
    });

    // 罪多边形（上半，独立）
    poly(pairs.map((p, i) => pt(angUp(i), r.sinScores[p.sin].pct)));
    ctx.fillStyle = hexToRgba(C.danger, 0.15);
    ctx.fill();
    ctx.strokeStyle = C.danger;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 美德多边形（下半，独立，不再镜像）
    poly(pairs.map((p, i) => pt(angDn(i), r.virtueScores[p.virtue].pct)));
    ctx.fillStyle = hexToRgba(C.aqua, 0.15);
    ctx.fill();
    ctx.strokeStyle = C.aqua;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '11px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    pairs.forEach((p, i) => {
      const aUp = angUp(i), aDn = angDn(i);
      const sp = pt(aUp, r.sinScores[p.sin].pct);
      ctx.beginPath();
      ctx.arc(sp[0], sp[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = C.danger;
      ctx.fill();
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(Math.round(r.sinScores[p.sin].pct),
        cx + (R * (clamp(r.sinScores[p.sin].pct, 0, 100) / 100) + 11) * Math.cos(aUp),
        cy + (R * (clamp(r.sinScores[p.sin].pct, 0, 100) / 100) + 11) * Math.sin(aUp));

      const vp = pt(aDn, r.virtueScores[p.virtue].pct);
      ctx.beginPath();
      ctx.arc(vp[0], vp[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = C.aqua;
      ctx.fill();
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(Math.round(r.virtueScores[p.virtue].pct),
        cx + (R * (clamp(r.virtueScores[p.virtue].pct, 0, 100) / 100) + 11) * Math.cos(aDn),
        cy + (R * (clamp(r.virtueScores[p.virtue].pct, 0, 100) / 100) + 11) * Math.sin(aDn));
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

  /* ---------------- 演示模式 ---------------- */
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
