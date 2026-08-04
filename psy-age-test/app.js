/* =====================================================================
   心理年龄测验 · 逻辑层
   计分模型：
     每维度先求特质分（反向题先转换），再映射到该维度的心理年龄，
     最后按维度权重合成总心理年龄。跳过题按"中立"处理。
   ===================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const D = window.PSYCH_DATA;
  const SC = D.scoring;
  const LIKERT_LABELS = ['非常不同意', '不同意', '中立', '同意', '非常同意'];

  const state = {
    version: 'full',
    chrono: null,       // 生理年龄（可空）
    shuffle: false,
    skip: true,
    order: [],          // 题目 id 序列（末尾为主观年龄题）
    answers: {},        // qid -> 1..5；跳过 -> null
    qi: 0,
    felt: null,         // 主观年龄（可空）
    dwells: {},         // qid -> 作答用时(ms)
    dwellStart: null,   // 当前题渲染的时刻
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
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.setAttribute('data-theme', 'light');
    if (!state.results) return;
    drawRadar();
  });

  /* ---------------- 开始页 ---------------- */
  $('versionSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-version]');
    if (!btn) return;
    state.version = btn.dataset.version;
    document.querySelectorAll('#versionSeg button').forEach((b) => b.classList.toggle('active', b === btn));
  });

  $('btnStart').addEventListener('click', () => {
    const raw = $('chronoAge').value.trim();
    const n = parseInt(raw, 10);
    state.chrono = (!raw || isNaN(n) || n < 6 || n > 99) ? null : n;
    state.shuffle = $('optShuffle').checked;
    state.skip = $('optSkip').checked;
    begin(false);
  });

  function begin(forceShuffle) {
    state.answers = {};
    state.dwells = {};
    state.dwellStart = null;
    state.felt = null;
    state.results = null;
    state.qi = 0;
    if (forceShuffle) state.shuffle = true;

    let pool = state.version === 'light'
      ? D.questions.filter((q) => q.light)
      : D.questions.slice();
    if (state.shuffle) pool = shuffle(pool);
    state.order = pool.map((q) => q.id).concat([D.feltQuestion.id]);
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

    if (qid === 'felt') {
      renderFelt();
      return;
    }

    const q = D.questions.find((x) => x.id === qid);
    const dim = D.dimensions.find((x) => x.key === q.dim);
    state.dwellStart = performance.now();
    $('dimTag').textContent = dim.name;
    $('dimTag').hidden = false;
    $('dimAbout').textContent = dim.about;
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
    if (state.dwellStart != null) state.dwells[qid] = performance.now() - state.dwellStart;
    state.answers[qid] = val;
    const box = $('likertBtns');
    Array.from(box.children).forEach((b, idx) => {
      b.classList.toggle('selected', idx + 1 === val);
      b.setAttribute('aria-checked', idx + 1 === val ? 'true' : 'false');
    });
    $('btnNext').disabled = false;
    setTimeout(next, 150);
  }

  function renderFelt() {
    state.dwellStart = null;
    const f = D.feltQuestion;
    $('dimTag').hidden = true;
    $('dimAbout').hidden = true;
    $('scaleLeft').hidden = true;
    $('scaleRight').hidden = true;
    $('qText').textContent = f.text;
    $('btnNext').textContent = '查看结果';
    $('btnNext').disabled = false;

    const box = $('likertBtns');
    box.innerHTML = '';
    box.className = 'likert-btns felt-box';
    box.innerHTML =
      '<div class="felt-slider" style="grid-column:1/-1;padding:6px 4px 0;">' +
      '<input type="range" id="feltRange" min="' + f.min + '" max="' + f.max + '" value="' + f.min + '">' +
      '<div class="felt-value" id="feltVal" style="text-align:center;">约 ' + f.min + ' 岁</div>' +
      '</div>';
    const range = $('feltRange');
    range.addEventListener('input', () => {
      state.felt = parseInt(range.value, 10);
      $('feltVal').textContent = '约 ' + state.felt + ' 岁';
    });
  }

  function next() {
    if (state.order[state.qi] === 'felt') { submit(); return; }
    if (state.qi < state.order.length - 1) { state.qi++; renderQ(state.qi); }
  }

  function prev() {
    if (state.qi > 0) { state.qi--; renderQ(state.qi); }
  }

  function skip() {
    if (!state.skip) return;
    if (state.order[state.qi] === 'felt') { submit(); return; }
    const qid = state.order[state.qi];
    if (state.dwellStart != null) state.dwells[qid] = performance.now() - state.dwellStart;
    state.answers[qid] = null;
    if (state.qi < state.order.length - 1) { state.qi++; renderQ(state.qi); }
    else submit();
  }

  $('btnNext').addEventListener('click', next);
  $('btnPrev').addEventListener('click', prev);
  $('btnSkip').addEventListener('click', skip);
  $('btnQuit').addEventListener('click', () => { show('view-start'); });

  /* ---------------- 计分 ---------------- */
  function bandFor(age) {
    if (state.chrono != null) {
      const diff = age - state.chrono;
      if (diff <= SC.diffYoung) return 'young';
      if (diff >= SC.diffOld) return 'old';
      return 'balanced';
    }
    if (age <= SC.fixedYoung) return 'young';
    if (age >= SC.fixedOld) return 'old';
    return 'balanced';
  }

  function computeResults() {
    const chrono = state.chrono;
    const included = new Set(state.order.filter((id) => id !== 'felt'));

    const dims = D.dimensions.map((dim) => {
      const qs = D.questions.filter((q) => q.dim === dim.key && included.has(q.id));
      const vals = qs.map((q) => {
        const raw = state.answers[q.id];
        const v = (raw == null) ? SC.neutral : raw;
        return q.reverse ? SC.likertMax + SC.likertMin - v : v;
      });
      const trait = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : SC.neutral;
      const M = dim.role === 'mature' ? trait : SC.likertMax + SC.likertMin - trait;
      const age = dim.minAge + (M - SC.likertMin) / (SC.likertMax - SC.likertMin) * (dim.maxAge - dim.minAge);
      return { key: dim.key, name: dim.name, short: dim.short, about: dim.about, role: dim.role, age, band: bandFor(age) };
    });

    const basePsychAge = dims.reduce((s, d) => s + d.age * D.dimensions.find((x) => x.key === d.key).weight, 0);
    const sd = Math.sqrt(dims.reduce((s, d) => s + Math.pow(d.age - basePsychAge, 2), 0) / dims.length);
    const youngCount = dims.filter((d) => d.band === 'young').length;
    const oldCount = dims.filter((d) => d.band === 'old').length;

    // 作答节律：以平均每题用时做温和的收敛修正（犹豫越多越向中间值靠拢，上限 ±2 岁）
    const rhythm = computeRhythm();
    const delta = rhythm ? hesitationDelta(basePsychAge, rhythm.mean) : 0;
    const psychAge = basePsychAge + delta;

    return {
      dims,
      ages: Object.fromEntries(dims.map((d) => [d.key, d.age])),
      basePsychAge,
      psychAge,
      delta,
      rhythm,
      sd,
      youngCount,
      oldCount,
      archetype: pickArchetype(dims, youngCount, oldCount),
      balance: balanceFor(sd),
      descriptor: describe(psychAge, chrono),
      diff: chrono != null ? psychAge - chrono : null,
      chrono
    };
  }

  // 统计每题作答用时（排除热身首题、主观年龄题与超长/极短异常值）
  function computeRhythm() {
    const firstId = state.order[0];
    const all = [];
    const byDim = {};
    D.dimensions.forEach((d) => { byDim[d.key] = []; });
    Object.keys(state.dwells).forEach((qid) => {
      if (qid === 'felt' || qid === firstId) return;
      const v = state.dwells[qid];
      if (typeof v !== 'number' || v < 300 || v > 120000) return;
      all.push(v);
      const q = D.questions.find((x) => x.id === qid);
      if (q) byDim[q.dim].push(v);
    });
    if (!all.length) return null;
    const mean = all.reduce((a, b) => a + b, 0) / all.length;
    const dimMean = {};
    D.dimensions.forEach((d) => {
      if (byDim[d.key].length) dimMean[d.key] = byDim[d.key].reduce((a, b) => a + b, 0) / byDim[d.key].length;
    });
    return { mean, dimMean };
  }

  // 全部中立时的合成结果，作为"典型平衡成年"的收敛锚点
  const NEUTRAL_ANCHOR = 38;
  function hesitationDelta(baseAge, meanMs) {
    const factor = Math.min(1, meanMs / 8000);
    return clamp((NEUTRAL_ANCHOR - baseAge) * factor * 0.6, -2, 2);
  }

  function pickArchetype(dims, y, o) {
    const band = (k) => dims.find((d) => d.key === k).band;
    // 先匹配特征组合型（更具体）
    for (const a of D.archetypes) {
      const m = a.match || {};
      if (!m.sig) continue;
      if (m.sig.every((entry) => {
        const i = entry.lastIndexOf('_');
        return band(entry.slice(0, i)) === entry.slice(i + 1);
      })) return a;
    }
    // 再匹配计数型
    for (const a of D.archetypes) {
      const m = a.match || {};
      if (m.sig) continue;
      const yOk = (m.youngMin == null || y >= m.youngMin) && (m.youngMax == null || y <= m.youngMax);
      const oOk = (m.oldMin == null || o >= m.oldMin) && (m.oldMax == null || o <= m.oldMax);
      if (yOk && oOk) return a;
    }
    return D.archetypes[D.archetypes.length - 1];
  }

  function balanceFor(sd) {
    const item = D.balanceText.find((b) => sd <= b.max);
    return item ? { label: item.label, text: item.text } : D.balanceText[D.balanceText.length - 1];
  }

  function describe(psychAge, chrono) {
    if (chrono != null) {
      const d = psychAge - chrono;
      if (d <= -12) return '显著年轻于你的实际年龄';
      if (d <= -5) return '比你的实际年龄年轻';
      if (d < 5) return '与你实际年龄相当';
      if (d < 12) return '比你的实际年龄成熟';
      return '显著成熟于你的实际年龄';
    }
    if (psychAge <= 25) return '显著的年轻态';
    if (psychAge <= 35) return '偏年轻的心理状态';
    if (psychAge <= 45) return '中年的平衡状态';
    if (psychAge <= 55) return '偏成熟的心理状态';
    return '显著的成熟态';
  }

  function submit() {
    state.results = computeResults();
    renderResult(state.results);
    show('view-result');
    requestAnimationFrame(drawRadar);
  }

  /* ---------------- 结果渲染 ---------------- */
  const BAND_LABEL = { young: '偏年轻', balanced: '均衡', old: '偏成熟' };

  function renderResult(r) {
    const p = Math.round(r.psychAge);
    $('heroNum').textContent = p;
    $('heroBadge').textContent = r.descriptor;
    $('chronoChip').textContent = r.chrono != null ? r.chrono + ' 岁' : '未填写';
    $('psychoChip').textContent = p + ' 岁';

    if (r.diff != null) {
      const d = Math.round(r.diff);
      $('diffChip').textContent = d === 0 ? '相当' : (d < 0 ? '小 ' + (-d) + ' 岁' : '大 ' + d + ' 岁');
      $('heroNote').textContent = '你的心理年龄比生理年龄' + (d === 0 ? '相当' : (d < 0 ? '年轻 ' + (-d) + ' 岁' : '成熟 ' + d + ' 岁')) +
        '。综合 7 个维度加权计算，维度差异越大，单一数字的意义越小，请结合下方画像解读。';
    } else {
      $('diffChip').textContent = '—';
      $('heroNote').textContent = '综合 7 个维度加权计算。若想知道与生理年龄的差距，可回到开始页填写年龄再测一次。';
    }

    // 条形列表
    const list = $('barList');
    list.innerHTML = '';
    r.dims.forEach((d) => {
      const pct = clamp((d.age - 16) / (65 - 16) * 100, 0, 100);
      const row = document.createElement('div');
      row.className = 'bar-row';
      let marker = '';
      if (r.chrono != null) {
        const cp = clamp((r.chrono - 16) / (65 - 16) * 100, 0, 100);
        marker = '<div class="bar-marker" style="left:' + cp + '%"></div>';
      }
      row.innerHTML =
        '<span class="bar-name">' + d.name + '</span>' +
        '<div class="bar-track"><div class="bar-fill ' + (d.band === 'old' ? 'old' : '') + '" style="width:' + pct + '%"></div>' + marker + '</div>' +
        '<span class="bar-val">' + Math.round(d.age) + ' 岁</span>';
      list.appendChild(row);
    });

    // 人格画像
    $('archetypeTitle').textContent = r.archetype.title;
    $('archetypeText').textContent = r.archetype.text;

    // 均衡度
    $('balanceText').textContent = r.balance.label + '。' + r.balance.text;

    // 主观年龄三角
    if (state.felt != null) {
      $('feltCard').hidden = false;
      const C = r.chrono, F = state.felt;
      let feltRel = '与你的实际年龄相当';
      if (C != null) feltRel = F < C ? '比自己生理年龄年轻 ' + (C - F) + ' 岁' : (F > C ? '比自己生理年龄年长 ' + (F - C) + ' 岁' : '与自己生理年龄相当');
      $('feltText').textContent = '你内心自感约 ' + F + ' 岁（' + feltRel + '）' +
        (C != null ? '，生理年龄 ' + C + ' 岁' : '') + '，问卷计算出的心理年龄为 ' + p + ' 岁。' +
        '主观年龄研究（Kotter-Grühn 等, 2016）显示，"自感年龄"本身就能预测身心健康——当自感年龄显著大于实际年龄时，值得关注并主动做出调整。';
    } else {
      $('feltCard').hidden = true;
    }

    // 逐维度详解
    const dl = $('detailList');
    dl.innerHTML = '';
    r.dims.forEach((d) => {
      const div = document.createElement('div');
      div.className = 'detail-item';
      let context = '';
      if (r.chrono != null) {
        const diff = Math.round(d.age - r.chrono);
        context = diff === 0 ? '与生理年龄相当' : (diff < 0 ? '较生理年龄年轻 ' + (-diff) + ' 岁' : '较生理年龄成熟 ' + diff + ' 岁');
      }
      div.innerHTML =
        '<div class="detail-head">' +
        '<span class="detail-name">' + d.name + '</span>' +
        '<span class="detail-age">' + Math.round(d.age) + ' 岁</span>' +
        '<span class="detail-band band-' + d.band + '">' + BAND_LABEL[d.band] + '</span>' +
        (context ? '<span class="detail-age" style="color:var(--muted)">· ' + context + '</span>' : '') +
        '</div>' +
        '<p class="detail-text">' + D.bands[d.key][d.band] + '</p>';
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

    // 文献（GB/T 7714-2015 著录格式）
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

    // 作答节律
    const rc = $('rhythmCard');
    if (r.rhythm) {
      rc.hidden = false;
      const meanS = (r.rhythm.mean / 1000).toFixed(1);
      let pace = '平稳';
      if (r.rhythm.mean < 3000) pace = '快速果断';
      else if (r.rhythm.mean < 6000) pace = '平稳从容';
      else if (r.rhythm.mean < 10000) pace = '偏慢慎重';
      else pace = '非常谨慎';
      const deltaTxt = Math.abs(r.delta) < 0.05
        ? '（内容得分即为最终结果，犹豫修正为 0）'
        : '（内容得分已向中间值收敛 ' + (r.delta > 0 ? '+' : '') + r.delta.toFixed(1) + ' 岁）';
      $('rhythmText').innerHTML = '你平均每题用时 <b>' + meanS + ' 秒</b>，作答节奏整体<b>' + pace + '</b>。' +
        '由内容计算的心理年龄为 <b>' + Math.round(r.basePsychAge) + ' 岁</b>，经犹豫度修正后为 <b>' + Math.round(r.psychAge) + ' 岁</b> ' + deltaTxt;

      const dimRows = D.dimensions
        .filter((d) => r.rhythm.dimMean[d.key] != null)
        .map((d) => ({ key: d.key, name: d.name, ms: r.rhythm.dimMean[d.key] }))
        .sort((a, b) => b.ms - a.ms);
      const maxMs = dimRows.length ? dimRows[0].ms : 1;
      const grid = $('rhythmGrid');
      grid.innerHTML = '';
      dimRows.forEach((row) => {
        const pct = clamp(row.ms / maxMs * 100, 4, 100);
        const el = document.createElement('div');
        el.className = 'rhythm-row';
        el.innerHTML = '<span class="bar-name">' + row.name + '</span>' +
          '<div class="rhythm-track"><div class="rhythm-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="bar-val">' + (row.ms / 1000).toFixed(1) + 's</span>';
        grid.appendChild(el);
      });

      const notesEl = $('rhythmNotes');
      notesEl.innerHTML = '';
      dimRows.slice(0, 2).forEach((row) => {
        const p = document.createElement('p');
        p.className = 'rhythm-note';
        p.innerHTML = '<b>' + row.name + '：</b>' + (D.rhythmNotes[row.key] || '');
        notesEl.appendChild(p);
      });

      $('rhythmMethod').textContent = '方法说明：作答用时（反应时）是真实的心理学信号，但受设备、阅读速度与外界干扰影响较大，因此这里只作为"温和修正"而非硬性计分——整体越犹豫，结果越向典型平衡值（38 岁）收敛，幅度上限 ±2 岁。第一题热身、主观年龄题与超长停顿（>2 分钟）不计入统计。';
    } else {
      rc.hidden = true;
    }

    $('disclaimer').textContent = D.disclaimer;
  }

  /* ---------------- 雷达图 ---------------- */
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

    const dims = state.results.dims;
    const N = dims.length;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 56;
    const FLOOR = 16, CEIL = 65;
    const rFor = (age) => R * (clamp(age, FLOOR, CEIL) - FLOOR) / (CEIL - FLOOR);
    const ang = (i) => -Math.PI / 2 + i * 2 * Math.PI / N;
    const pt = (i, age) => {
      const a = ang(i), r = rFor(age);
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    const poly = (points) => {
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
    };

    // 网格环
    [25, 35, 45, 55].forEach((y) => {
      poly(Array.from({ length: N }, (_, i) => pt(i, y)));
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 辐条 + 维度名
    const verts = [];
    ctx.font = '12px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    dims.forEach((d, i) => {
      const [sx, sy] = pt(i, FLOOR);
      const [ex, ey] = [cx + (R + 18) * Math.cos(ang(i)), cy + (R + 18) * Math.sin(ang(i))];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.ink2;
      ctx.fillText(d.short, ex, ey);
      const [vx, vy] = pt(i, d.age);
      verts.push({ key: d.key, name: d.name, age: d.age, x: vx, y: vy });
    });

    // 生理年龄参照环
    if (state.results.chrono != null) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      poly(Array.from({ length: N }, (_, i) => pt(i, state.results.chrono)));
      ctx.strokeStyle = C.muted;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // 主多边形
    poly(Array.from({ length: N }, (_, i) => pt(i, state.results.ages[dims[i].key])));
    ctx.fillStyle = hexToRgba(C.accent, 0.16);
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 顶点 + 数值
    ctx.font = '11px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    dims.forEach((d, i) => {
      const [x, y] = pt(i, d.age);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = C.accent;
      ctx.fill();
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      const [lx, ly] = [cx + (rFor(d.age) + 11) * Math.cos(ang(i)), cy + (rFor(d.age) + 11) * Math.sin(ang(i))];
      ctx.fillStyle = C.ink2;
      ctx.fillText(Math.round(d.age), lx, ly);
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
    if (best) {
      tip.hidden = false;
      tip.textContent = best.name + ' · 心理年龄 ' + Math.round(best.age) + ' 岁';
      tip.style.left = best.x + 'px';
      tip.style.top = (best.y - 8) + 'px';
    } else {
      tip.hidden = true;
    }
  });
  radar.addEventListener('mouseleave', () => { $('radarTip').hidden = true; });

  window.addEventListener('resize', () => {
    if (state.results) drawRadar();
  });

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
    state.chrono = 28;
    state.shuffle = true;
    state.skip = true;
    const pool = D.questions.slice();
    state.order = shuffle(pool).map((q) => q.id).concat([D.feltQuestion.id]);
    pool.forEach((q) => { state.answers[q.id] = 1 + Math.floor(Math.random() * 5); });
    state.felt = 26;
    submit();
  }
  if (window.location.hash === '#demo') demo();

})();
