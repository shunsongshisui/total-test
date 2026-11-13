/* =====================================================================
   测试结果分享卡（共享组件 · 纯 Canvas 渲染）
   ---------------------------------------------------------------------
   把测试结果画成一张竖版图片，方便保存/发朋友圈/发给朋友。
   不依赖任何第三方库，离线可用。

   用法：页面里引入本文件，然后
       ShareCard.save({ ... }, btn)   // 立即生成并下载，btn 用于按钮状态反馈
       ShareCard.render({ ... })      // 返回 canvas，需要自定义用途时用

   spec 结构：
     title     {string}  测试名，如「心理年龄测验」
     subtitle  {string}  副标题，可空
     value     {string}  主分数，如「28」
     unit      {string}  单位，如「岁」「指数」
     badge     {string}  档位/评语，如「与你年龄相当」
     note      {string}  一句话说明，可空
     chips     {Array}   [{label,value}] 小字段，最多 4 个
     radar     {Array}   [{label,value,max}] 雷达维度，3~8 个，value 为 0~1 的比例
     radarRef  {Array}   参照值的比例（可选，画第二圈）
     footer    {string}  页脚署名
     tag       {string}  右上角标签，如「诡秘之主」
   ===================================================================== */
(function (global) {
  'use strict';

  var W = 1080;
  var PAD = 64;

  /* 各测试的配色主题：base 为主色，deep 为深色背景，glow 为光晕 */
  var THEMES = {
    blue:   { base: '#2a78d6', deep: '#0f2440', mid: '#1d4f8f', glow: '#5b9df0' },
    purple: { base: '#9f7aea', deep: '#241a3d', mid: '#4c2f80', glow: '#c4a5f5' },
    amber:  { base: '#c98500', deep: '#3a2a06', mid: '#8a5f00', glow: '#f0bc55' },
    rust:   { base: '#c25a3a', deep: '#3d1a12', mid: '#8f3d24', glow: '#e88a63' },
    teal:   { base: '#1baf7a', deep: '#0c2f24', mid: '#11735c', glow: '#4dd6a8' }
  };

  function pickTheme(spec) {
    if (spec.theme && THEMES[spec.theme]) return THEMES[spec.theme];
    var a = (spec.accent || '').toLowerCase();
    if (a.indexOf('9f7aea') >= 0 || a.indexOf('8b5cf6') >= 0) return THEMES.purple;
    if (a.indexOf('c98500') >= 0 || a.indexOf('eda100') >= 0) return THEMES.amber;
    if (a.indexOf('c25a3a') >= 0 || a.indexOf('f87171') >= 0) return THEMES.rust;
    if (a.indexOf('1baf7a') >= 0 || a.indexOf('10b981') >= 0) return THEMES.teal;
    return THEMES.blue;
  }

  function hexAlpha(hex, a) {
    var m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return 'rgba(42,120,214,' + a + ')';
    var n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  // 柔光圆斑，用于背景氛围
  function softOrb(g, x, y, r, color, alpha) {
    var grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, hexAlpha(color, alpha));
    grd.addColorStop(0.55, hexAlpha(color, alpha * 0.35));
    grd.addColorStop(1, hexAlpha(color, 0));
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }

  function font(size, weight) {
    return (weight ? weight + ' ' : '') + size + 'px -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
  }

  function roundRect(g, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + rr, y);
    g.arcTo(x + w, y, x + w, y + h, rr);
    g.arcTo(x + w, y + h, x, y + h, rr);
    g.arcTo(x, y + h, x, y, rr);
    g.arcTo(x, y, x + w, y, rr);
    g.closePath();
  }

  // 按宽度折行，返回行数组
  function wrapText(g, text, maxW) {
    if (!text) return [];
    var lines = [];
    var cur = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === '\n') { lines.push(cur); cur = ''; continue; }
      var test = cur + ch;
      if (g.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function drawRadar(g, spec, cx, cy, R, theme) {
    var dims = spec.radar || [];
    var n = dims.length;
    if (n < 3) return false;

    var ac = spec.accent || (theme && theme.glow) || '#5b9df0';
    var T = theme || { base: ac, glow: ac };

    // 背景网格（深色卡片用浅色描边）
    for (var ring = 1; ring <= 4; ring++) {
      var r = R * ring / 4;
      g.beginPath();
      for (var i = 0; i <= n; i++) {
        var a = -Math.PI / 2 + i * 2 * Math.PI / n;
        var x = cx + Math.cos(a) * r;
        var y = cy + Math.sin(a) * r;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.closePath();
      g.strokeStyle = ring === 4 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)';
      g.lineWidth = ring === 4 ? 2 : 1.5;
      g.stroke();
    }

    // 轴线
    for (var j = 0; j < n; j++) {
      var ang = -Math.PI / 2 + j * 2 * Math.PI / n;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
      g.strokeStyle = 'rgba(255,255,255,0.07)';
      g.lineWidth = 1.5;
      g.stroke();
    }

    // 参照多边形（虚线）
    if (spec.radarRef && spec.radarRef.length === n) {
      g.beginPath();
      for (var k = 0; k <= n; k++) {
        var idx = k % n;
        var aa = -Math.PI / 2 + idx * 2 * Math.PI / n;
        var rr2 = R * Math.max(0, Math.min(1, spec.radarRef[idx] || 0));
        var xx = cx + Math.cos(aa) * rr2;
        var yy = cy + Math.sin(aa) * rr2;
        if (k === 0) g.moveTo(xx, yy); else g.lineTo(xx, yy);
      }
      g.closePath();
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 2.5;
      g.setLineDash([9, 7]);
      g.stroke();
      g.setLineDash([]);
    }

    // 数据面：渐变填充 + 发光描边
    g.beginPath();
    for (var m = 0; m <= n; m++) {
      var ii = m % n;
      var a2 = -Math.PI / 2 + ii * 2 * Math.PI / n;
      var rv = R * Math.max(0, Math.min(1, dims[ii].value || 0));
      var px = cx + Math.cos(a2) * rv;
      var py = cy + Math.sin(a2) * rv;
      if (m === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();

    var fillGrad = g.createRadialGradient(cx, cy, 0, cx, cy, R);
    fillGrad.addColorStop(0, hexAlpha(T.base, 0.55));
    fillGrad.addColorStop(1, hexAlpha(T.glow, 0.18));
    g.fillStyle = fillGrad;
    g.fill();

    g.save();
    g.shadowColor = hexAlpha(T.glow, 0.75);
    g.shadowBlur = 22;
    g.strokeStyle = T.glow;
    g.lineWidth = 4;
    g.lineJoin = 'round';
    g.stroke();
    g.restore();

    // 顶点
    for (var q = 0; q < n; q++) {
      var aq = -Math.PI / 2 + q * 2 * Math.PI / n;
      var rq = R * Math.max(0, Math.min(1, dims[q].value || 0));
      var vx = cx + Math.cos(aq) * rq;
      var vy = cy + Math.sin(aq) * rq;
      g.beginPath();
      g.arc(vx, vy, 8, 0, Math.PI * 2);
      g.fillStyle = '#ffffff';
      g.fill();
      g.beginPath();
      g.arc(vx, vy, 4, 0, Math.PI * 2);
      g.fillStyle = T.base;
      g.fill();
    }

    // 轴标签
    g.font = font(25, '600');
    g.textBaseline = 'middle';
    for (var t = 0; t < n; t++) {
      var at = -Math.PI / 2 + t * 2 * Math.PI / n;
      var lx = cx + Math.cos(at) * (R + 56);
      var ly = cy + Math.sin(at) * (R + 56);
      if (Math.cos(at) > 0.3) g.textAlign = 'left';
      else if (Math.cos(at) < -0.3) g.textAlign = 'right';
      else g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,0.72)';
      g.fillText(dims[t].label || '', lx, ly);
    }
    return true;
  }

  function render(spec, opts) {
    opts = opts || {};
    var g = opts.ctx;
    var T = pickTheme(spec);
    var accent = T.base;

    // 先量高度
    var measure = document.createElement('canvas').getContext('2d');
    measure.font = font(40, '700');
    var titleLines = wrapText(measure, spec.title || '', W - PAD * 2).length || 1;
    measure.font = font(36, '700');
    var badgeLines = wrapText(measure, spec.badge || '', W - PAD * 2).length || 1;
    measure.font = font(26);
    var noteLines = spec.note ? Math.min(3, wrapText(measure, spec.note, W - PAD * 2).length) : 0;

    var hasChips = !!(spec.chips && spec.chips.length);
    var chipsH = hasChips ? 132 : 0;
    var hasRadar = (spec.radar && spec.radar.length >= 3);
    var radarH = hasRadar ? 560 : 0;

    // 布局常量
    var M = 44;                        // 外边距（深色底）
    var IN = 56;                       // 卡片内边距
    var headH = 120;                   // 顶部标签区
    var titleH = 56 * titleLines;
    var valueH = 150;
    var badgeH = 52 * badgeLines;
    var noteH = noteLines * 40;

    var bodyH = headH + titleH + 30 + valueH + 26 + badgeH + (noteH ? noteH + 22 : 0)
              + (hasChips ? chipsH + 22 : 0) + radarH;
    var footH = 128;
    var cardH = bodyH + footH + IN * 2;
    var H = cardH + M * 2;

    var canvas = g ? g.canvas : document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    if (!g) g = canvas.getContext('2d');

    /* ---------- 底色：深色渐变 + 氛围光斑 ---------- */
    var bg = g.createLinearGradient(0, 0, W * 0.6, H);
    bg.addColorStop(0, T.deep);
    bg.addColorStop(0.55, '#0b0d14');
    bg.addColorStop(1, '#07080c');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    softOrb(g, W * 0.86, H * 0.10, 520, T.glow, 0.30);
    softOrb(g, W * 0.10, H * 0.72, 460, T.base, 0.22);
    softOrb(g, W * 0.72, H * 0.94, 380, T.glow, 0.16);

    /* ---------- 主卡片 ---------- */
    var cx = M, cy = M, cw = W - M * 2, ch = cardH;
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.55)';
    g.shadowBlur = 60;
    g.shadowOffsetY = 24;
    roundRect(g, cx, cy, cw, ch, 40);
    g.fillStyle = 'rgba(255,255,255,0.055)';
    g.fill();
    g.restore();

    // 卡片描边（渐变）
    var stroke = g.createLinearGradient(cx, cy, cx + cw, cy + ch);
    stroke.addColorStop(0, hexAlpha(T.glow, 0.55));
    stroke.addColorStop(0.5, 'rgba(255,255,255,0.10)');
    stroke.addColorStop(1, hexAlpha(T.base, 0.35));
    roundRect(g, cx, cy, cw, ch, 40);
    g.strokeStyle = stroke;
    g.lineWidth = 2;
    g.stroke();

    // 卡片顶部渐变高光条
    g.save();
    roundRect(g, cx, cy, cw, ch, 40);
    g.clip();
    var bar = g.createLinearGradient(cx, cy, cx + cw, cy);
    bar.addColorStop(0, T.base);
    bar.addColorStop(0.55, T.glow);
    bar.addColorStop(1, T.base);
    g.fillStyle = bar;
    g.fillRect(cx, cy, cw, 6);
    g.restore();

    var left = cx + IN;
    var contentW = cw - IN * 2;
    var y = cy + IN;

    /* ---------- 顶部：标签胶囊 + 右上角署名 ---------- */
    if (spec.tag) {
      g.font = font(24, '700');
      var tw = g.measureText(spec.tag).width;
      var pillW = tw + 44;
      roundRect(g, left, y, pillW, 46, 23);
      g.fillStyle = hexAlpha(T.base, 0.20);
      g.fill();
      g.strokeStyle = hexAlpha(T.glow, 0.45);
      g.lineWidth = 1.5;
      g.stroke();
      g.fillStyle = T.glow;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(spec.tag, left + pillW / 2, y + 24);
    }

    // 右上角小字
    g.font = font(22, '600');
    g.fillStyle = 'rgba(255,255,255,0.34)';
    g.textAlign = 'right';
    g.textBaseline = 'middle';
    g.fillText(spec.signature || '愿安 · 测试合集', left + contentW, y + 24);

    y += headH;

    /* ---------- 标题 ---------- */
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.font = font(40, '700');
    g.fillStyle = 'rgba(255,255,255,0.92)';
    var tls = wrapText(g, spec.title || '', contentW).slice(0, 2);
    for (var ti = 0; ti < tls.length; ti++) {
      g.fillText(tls[ti], left, y + 40 + ti * 54);
    }
    y += titleH + 30;

    /* ---------- 主分数（渐变字） ---------- */
    var valText = String(spec.value == null ? '—' : spec.value);
    // 长文本（如武器名）自动降字号
    var valSize = 132;
    g.font = font(valSize, '900');
    while (g.measureText(valText).width > contentW * 0.92 && valSize > 60) {
      valSize -= 8;
      g.font = font(valSize, '900');
    }
    var valGrad = g.createLinearGradient(left, y, left + Math.min(contentW, g.measureText(valText).width + 40), y + valSize);
    valGrad.addColorStop(0, '#ffffff');
    valGrad.addColorStop(1, T.glow);
    g.fillStyle = valGrad;
    g.fillText(valText, left, y + valSize * 0.82);
    var vw = g.measureText(valText).width;

    if (spec.unit) {
      g.font = font(34, '600');
      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.fillText(spec.unit, left + vw + 18, y + valSize * 0.82 - 6);
    }
    y += valueH + 26;

    /* ---------- 档位评语 ---------- */
    g.font = font(36, '700');
    var bls = wrapText(g, spec.badge || '', contentW);
    for (var bi = 0; bi < bls.length; bi++) {
      g.fillStyle = T.glow;
      g.fillText(bls[bi], left, y + 40 + bi * 52);
    }
    y += badgeH;

    /* ---------- 说明 ---------- */
    if (noteLines) {
      y += 14;
      g.font = font(26, '400');
      g.fillStyle = 'rgba(255,255,255,0.46)';
      var nls = wrapText(g, spec.note, contentW).slice(0, 3);
      for (var ni = 0; ni < nls.length; ni++) {
        g.fillText(nls[ni], left, y + 28 + ni * 40);
      }
      y += noteH + 22;
    }

    /* ---------- chips ---------- */
    if (hasChips) {
      var n = Math.min(spec.chips.length, 4);
      var gap = 16;
      var cwd = (contentW - gap * (n - 1)) / n;
      for (var ci = 0; ci < n; ci++) {
        var chd = spec.chips[ci];
        var chx = left + ci * (cwd + gap);
        roundRect(g, chx, y, cwd, 108, 20);
        g.fillStyle = 'rgba(255,255,255,0.066)';
        g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.10)';
        g.lineWidth = 1.5;
        g.stroke();

        g.textAlign = 'left';
        g.font = font(22, '500');
        g.fillStyle = 'rgba(255,255,255,0.42)';
        g.fillText(String(chd.label || ''), chx + 22, y + 38);

        g.font = font(34, '700');
        g.fillStyle = 'rgba(255,255,255,0.94)';
        var cv = String(chd.value == null ? '—' : chd.value);
        while (g.measureText(cv).width > cwd - 44 && cv.length > 1) {
          cv = cv.slice(0, -1);
        }
        g.fillText(cv, chx + 22, y + 80);
      }
      y += chipsH + 22;
    }

    /* ---------- 雷达 ---------- */
    if (hasRadar) {
      var R = 200;
      drawRadar(g, { radar: spec.radar, radarRef: spec.radarRef, accent: T.glow }, cx + cw / 2, y + radarH / 2, R, T);
      y += radarH;
    }

    /* ---------- 页脚 ---------- */
    y += 14;
    var lineGrad = g.createLinearGradient(left, 0, left + contentW, 0);
    lineGrad.addColorStop(0, hexAlpha(T.base, 0.55));
    lineGrad.addColorStop(0.5, 'rgba(255,255,255,0.14)');
    lineGrad.addColorStop(1, 'rgba(255,255,255,0)');
    g.beginPath();
    g.moveTo(left, y);
    g.lineTo(left + contentW, y);
    g.strokeStyle = lineGrad;
    g.lineWidth = 1.5;
    g.stroke();

    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.font = font(24, '600');
    g.fillStyle = 'rgba(255,255,255,0.50)';
    g.fillText(spec.footer || '', left, y + 24);

    // 右下角品牌点
    g.textAlign = 'right';
    g.font = font(22, '600');
    g.fillStyle = hexAlpha(T.glow, 0.75);
    g.fillText('愿安 · 测试合集', left + contentW, y + 26);

    return canvas;
  }

  function dataURL(spec, type) {
    var canvas = render(spec);
    return canvas.toDataURL(type || 'image/png');
  }

  function download(spec, filename) {
    var url = dataURL(spec);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'result.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ---------- 从页面 DOM 收集结果 ----------
     约定：页面在 .share-source 容器里放 [data-share-key] 元素，
     另外可把结构化数据塞进 <script type="application/json" id="shareData">。 */
  function readSource(root) {
    var el = root || document.querySelector('.share-source') || document.body;
    function pick(key) {
      var n = el.querySelector('[data-share-key="' + key + '"]');
      return n ? (n.textContent || '').trim() : '';
    }
    var json = {};
    var jn = document.getElementById('shareData');
    if (jn) {
      try { json = JSON.parse(jn.textContent || '{}'); } catch (e) { json = {}; }
    }
    return { pick: pick, json: json };
  }

  function buildSpec(opts) {
    opts = opts || {};
    var src = readSource(opts.root);
    var j = src.json || {};
    var chips = (j.chips || []).slice(0, 4);
    if (!chips.length) {
      // 退化为读取 chips 元素
      var wrap = (opts.root || document).querySelector('.hero-meta');
      if (wrap) {
        var cs = wrap.querySelectorAll('.chip');
        for (var i = 0; i < cs.length && chips.length < 4; i++) {
          var b = cs[i].querySelector('b');
          var lab = cs[i].querySelector('span');
          if (b) chips.push({ label: lab ? lab.textContent.trim() : '', value: b.textContent.trim() });
        }
      }
    }
    return {
      tag: opts.tag || j.tag || '',
      title: opts.title || j.title || (document.title || '').split('·')[0].trim(),
      subtitle: opts.subtitle || j.subtitle || '',
      value: opts.value || j.value || src.pick('value') || '—',
      unit: opts.unit || j.unit || src.pick('unit') || '',
      badge: opts.badge || j.badge || src.pick('badge') || '',
      note: opts.note || j.note || src.pick('note') || '',
      chips: opts.chips || chips,
      radar: opts.radar || j.radar || [],
      radarRef: opts.radarRef || j.radarRef || [],
      footer: opts.footer || j.footer || '',
      accent: opts.accent || j.accent || '#2a78d6',
      theme: opts.theme || j.theme || '',
      signature: opts.signature || j.signature || '愿安 · 测试合集'
    };
  }

  /* ---------- 直接下载（无弹窗） ---------- */
  function fileName(spec) {
    var n = (spec.title || '结果').replace(/[\\/:*?"<>|\s]+/g, '');
    return n + '-' + String(spec.value || '').replace(/[\\/:*?"<>|\s]+/g, '') + '.png';
  }

  function triggerDownload(url, name) {
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // 移动端部分浏览器需要延迟移除，否则下载可能被取消
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 1500);
  }

  /**
   * 点击即生成并下载。buttons 传入被点击的按钮，用于显示"生成中/已保存"。
   */
  function save(opts, btn) {
    opts = opts || {};
    var originText = btn ? btn.textContent : null;
    var originDisabled = btn ? btn.disabled : null;

    if (btn) {
      btn.disabled = true;
      btn.textContent = '生成中…';
    }

    var done = function (msg) {
      if (btn) {
        btn.textContent = msg;
        setTimeout(function () {
          btn.textContent = originText;
          btn.disabled = originDisabled || false;
        }, 1600);
      }
    };

    try {
      var spec = buildSpec(opts);
      var canvas = render(spec);
      var name = fileName(spec);

      // 优先用 toBlob（内存占用低），失败回退 toDataURL
      var downloaded = false;
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          if (blob && window.URL && window.URL.createObjectURL) {
            var url = window.URL.createObjectURL(blob);
            triggerDownload(url, name);
            setTimeout(function () { window.URL.revokeObjectURL(url); }, 4000);
            done('已保存 ✅');
          } else {
            triggerDownload(canvas.toDataURL('image/png'), name);
            done('已保存 ✅');
          }
        }, 'image/png');
        downloaded = true;
      }
      if (!downloaded) {
        triggerDownload(canvas.toDataURL('image/png'), name);
        done('已保存 ✅');
      }
      return true;
    } catch (e) {
      if (btn) {
        btn.textContent = originText;
        btn.disabled = originDisabled || false;
      }
      // 生成失败不应影响页面其它功能
      console.error('[ShareCard] 生成失败', e);
      alert('生成图片失败，请重试。');
      return false;
    }
  }

  /**
   * 生成图片并调起系统分享（iOS / Android 支持分享图片文件）。
   * 不支持或失败时自动降级为下载，保证一定有出口。
   */
  function share(opts, btn) {
    opts = opts || {};
    var originText = btn ? btn.textContent : null;
    var originDisabled = btn ? btn.disabled : null;

    if (btn) {
      btn.disabled = true;
      btn.textContent = '生成中…';
    }

    var restore = function (msg) {
      if (!btn) return;
      btn.textContent = msg;
      setTimeout(function () {
        btn.textContent = originText;
        btn.disabled = originDisabled || false;
      }, 1600);
    };

    var fallback = function () {
      if (btn) { btn.textContent = originText; btn.disabled = originDisabled || false; }
      save(opts, btn);
    };

    try {
      var spec = buildSpec(opts);
      var canvas = render(spec);
      var name = fileName(spec);

      // 不支持 Web Share Level 2（分享文件）时直接降级
      var canShareFiles = !!(navigator.canShare && navigator.share && canvas.toBlob);
      if (!canShareFiles) {
        if (btn) { btn.textContent = originText; btn.disabled = originDisabled || false; }
        save(opts, btn);
        return true;
      }

      canvas.toBlob(function (blob) {
        if (!blob) { fallback(); return; }
        var file;
        try {
          file = new File([blob], name, { type: 'image/png' });
        } catch (e) {
          fallback();
          return;
        }
        if (!navigator.canShare({ files: [file] })) {
          fallback();
          return;
        }
        navigator.share({
          files: [file],
          title: spec.title || '测试结果',
          text: (spec.title || '') + ' · ' + (spec.value || '')
        }).then(function () {
          restore('已分享 ✅');
        }).catch(function (err) {
          // 用户取消不当作失败
          if (err && err.name === 'AbortError') {
            restore(originText || '分享');
          } else {
            fallback();
          }
        });
      }, 'image/png');
      return true;
    } catch (e) {
      console.error('[ShareCard] 分享失败', e);
      if (btn) { btn.textContent = originText; btn.disabled = originDisabled || false; }
      alert('分享失败，已改用下载。');
      save(opts, btn);
      return false;
    }
  }

  global.ShareCard = {
    render: render,
    dataURL: dataURL,
    download: download,
    save: save,
    share: share,
    buildSpec: buildSpec
  };
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
