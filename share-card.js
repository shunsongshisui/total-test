/* =====================================================================
   测试结果分享卡（共享组件 · 纯 Canvas 渲染）
   ---------------------------------------------------------------------
   把测试结果画成一张竖版图片，方便保存/发朋友圈/发给朋友。
   不依赖任何第三方库，离线可用。

   用法：页面里引入本文件，然后
       ShareCard.render({ ... })   // 返回 dataURL
       ShareCard.open({ ... })     // 弹出预览，带保存按钮

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

  function drawRadar(g, spec, cx, cy, R) {
    var dims = spec.radar || [];
    var n = dims.length;
    if (n < 3) return false;

    var ac = spec.accent || '#2a78d6';

    // 背景网格
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
      g.strokeStyle = 'rgba(11,11,11,0.10)';
      g.lineWidth = 1.5;
      g.stroke();
    }

    // 轴线
    for (var j = 0; j < n; j++) {
      var ang = -Math.PI / 2 + j * 2 * Math.PI / n;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
      g.strokeStyle = 'rgba(11,11,11,0.08)';
      g.lineWidth = 1.5;
      g.stroke();
    }

    // 参照圈
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
      g.strokeStyle = 'rgba(11,11,11,0.28)';
      g.lineWidth = 2.5;
      g.setLineDash([8, 6]);
      g.stroke();
      g.setLineDash([]);
    }

    // 数据面
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
    g.fillStyle = ac;
    g.globalAlpha = 0.20;
    g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = ac;
    g.lineWidth = 3.5;
    g.lineJoin = 'round';
    g.stroke();

    // 顶点
    for (var q = 0; q < n; q++) {
      var aq = -Math.PI / 2 + q * 2 * Math.PI / n;
      var rq = R * Math.max(0, Math.min(1, dims[q].value || 0));
      g.beginPath();
      g.arc(cx + Math.cos(aq) * rq, cy + Math.sin(aq) * rq, 7, 0, Math.PI * 2);
      g.fillStyle = ac;
      g.fill();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 3;
      g.stroke();
    }

    // 轴标签
    g.font = font(26, '600');
    g.fillStyle = '#52514e';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (var t = 0; t < n; t++) {
      var at = -Math.PI / 2 + t * 2 * Math.PI / n;
      var lx = cx + Math.cos(at) * (R + 52);
      var ly = cy + Math.sin(at) * (R + 52);
      var label = dims[t].label || '';
      // 左右两侧标签避免贴边
      if (Math.cos(at) > 0.3) g.textAlign = 'left';
      else if (Math.cos(at) < -0.3) g.textAlign = 'right';
      else g.textAlign = 'center';
      g.fillText(label, lx, ly);
    }
    return true;
  }

  function render(spec, opts) {
    opts = opts || {};
    var g = opts.ctx;

    // 先量高度：用离屏 canvas 估
    var measure = document.createElement('canvas').getContext('2d');
    var chipsH = (spec.chips && spec.chips.length) ? 118 : 0;
    measure.font = font(64, '800');
    var valH = 96;
    var titleLines = 1;
    measure.font = font(40, '700');
    var badgeLines = wrapText(measure, spec.badge || '', W - PAD * 2).length || 1;
    measure.font = font(28);
    var noteLines = spec.note ? wrapText(measure, spec.note, W - PAD * 2).slice(0, 3).length : 0;
    var hasRadar = (spec.radar && spec.radar.length >= 3);
    var radarH = hasRadar ? 520 : 0;

    var H = 96 + 64 + 44 * titleLines + 24 + valH + 28 + badgeLines * 46 + 28 + noteLines * 42 + chipsH + radarH + 110 + 72;
    H = Math.max(H, 900);

    var canvas = g ? g.canvas : document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    if (!g) g = canvas.getContext('2d');

    // 背景
    var bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(1, '#f4f3ef');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // 顶部色条
    var accent = spec.accent || '#2a78d6';
    var top = g.createLinearGradient(0, 0, W, 0);
    top.addColorStop(0, accent);
    top.addColorStop(1, '#9f7aea');
    g.fillStyle = top;
    g.fillRect(0, 0, W, 10);

    var y = 96;

    // 标签
    if (spec.tag) {
      g.font = font(26, '600');
      g.fillStyle = '#898781';
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillText(spec.tag, PAD, y - 24);
      y += 40;
    }

    // 标题（自动折行，最多 3 行）
    g.font = font(40, '700');
    g.fillStyle = '#0b0b0b';
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    var tLines = wrapText(g, spec.title || '', W - PAD * 2).slice(0, 3);
    for (var ti = 0; ti < tLines.length; ti++) {
      g.fillText(tLines[ti], PAD, y + 32 + ti * 52);
    }
    y += 96 + Math.max(0, tLines.length - 1) * 52;

    // 主分数
    g.textBaseline = 'alphabetic';
    g.font = font(120, '900');
    g.fillStyle = '#0b0b0b';
    var valText = String(spec.value == null ? '—' : spec.value);
    g.fillText(valText, PAD, y + 96);
    var vw = g.measureText(valText).width;
    if (spec.unit) {
      g.font = font(38, '600');
      g.fillStyle = '#898781';
      g.fillText(spec.unit, PAD + vw + 16, y + 96);
    }
    y += 130;

    // 档位
    g.font = font(36, '700');
    g.textBaseline = 'top';
    var bLines = wrapText(g, spec.badge || '', W - PAD * 2);
    g.fillStyle = accent;
    for (var i = 0; i < bLines.length; i++) {
      g.fillText(bLines[i], PAD, y + i * 46);
    }
    y += bLines.length * 46 + 22;

    // 说明
    if (noteLines) {
      g.font = font(28);
      g.fillStyle = '#52514e';
      var nLines = wrapText(g, spec.note, W - PAD * 2).slice(0, 3);
      for (var j = 0; j < nLines.length; j++) {
        g.fillText(nLines[j], PAD, y + j * 42);
      }
      y += nLines.length * 42 + 26;
    }

    // chips
    if (spec.chips && spec.chips.length) {
      var cw = (W - PAD * 2 - 16 * (spec.chips.length - 1)) / spec.chips.length;
      for (var c = 0; c < spec.chips.length; c++) {
        var ch = spec.chips[c];
        var cx = PAD + c * (cw + 16);
        roundRect(g, cx, y, cw, 92, 18);
        g.fillStyle = '#f4f3ef';
        g.fill();
        g.strokeStyle = 'rgba(11,11,11,0.07)';
        g.lineWidth = 2;
        g.stroke();

        g.textAlign = 'left';
        g.textBaseline = 'top';
        g.font = font(24);
        g.fillStyle = '#898781';
        g.fillText(ch.label || '', cx + 22, y + 18);
        g.font = font(34, '700');
        g.fillStyle = '#0b0b0b';
        g.fillText(String(ch.value == null ? '—' : ch.value), cx + 22, y + 46);
      }
      y += chipsH + 26;
    }

    // 雷达图
    if (hasRadar) {
      var R = 210;
      var cx2 = W / 2;
      var cy2 = y + radarH / 2 + 10;
      drawRadar(g, { radar: spec.radar, radarRef: spec.radarRef, accent: accent }, cx2, cy2, R);
      y += radarH;
    }

    // 页脚
    var fy = H - 96;
    g.beginPath();
    g.moveTo(PAD, fy - 30);
    g.lineTo(W - PAD, fy - 30);
    g.strokeStyle = 'rgba(11,11,11,0.10)';
    g.lineWidth = 2;
    g.stroke();

    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.font = font(26, '600');
    g.fillStyle = '#52514e';
    g.fillText(spec.footer || '', PAD, fy);

    g.textAlign = 'right';
    g.font = font(24);
    g.fillStyle = '#898781';
    g.fillText(spec.signature || '愿安 · 测试合集', W - PAD, fy);

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
      signature: opts.signature || j.signature || '愿安 · 测试合集'
    };
  }

  /* ---------- 预览弹窗 ---------- */
  var modal = null;
  var currentSpec = null;

  function ensureModal() {
    if (modal && document.body.contains(modal)) return modal;
    modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = [
      '<div class="share-modal-card">',
      '  <div class="share-modal-head">',
      '    <span class="share-modal-title">保存为图片</span>',
      '    <button class="share-modal-close" type="button" aria-label="关闭">×</button>',
      '  </div>',
      '  <div class="share-modal-body"><img class="share-modal-img" alt="结果分享图"></div>',
      '  <div class="share-modal-foot">',
      '    <button class="share-btn share-btn-primary" type="button" data-act="download">保存图片</button>',
      '    <button class="share-btn" type="button" data-act="share">分享</button>',
      '    <button class="share-btn share-btn-ghost" type="button" data-act="close">关闭</button>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      var t = e.target;
      if (t === modal || (t.getAttribute && t.getAttribute('data-act') === 'close') ||
          (t.className && String(t.className).indexOf('share-modal-close') >= 0)) {
        close();
        return;
      }
      var act = t.getAttribute && t.getAttribute('data-act');
      if (act === 'download') doDownload();
      if (act === 'share') doShare();
    });
    return modal;
  }

  function close() {
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  function fileName(spec) {
    var n = (spec.title || '结果').replace(/[\\/:*?"<>|\s]+/g, '');
    return n + '-' + (spec.value || '') + '.png';
  }

  function doDownload() {
    if (!currentSpec) return;
    try {
      var url = dataURL(currentSpec);
      var a = document.createElement('a');
      a.href = url;
      a.download = fileName(currentSpec);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert('保存失败，请重试或长按图片保存。');
    }
  }

  function doShare() {
    if (!currentSpec) return;
    var canvas = render(currentSpec);
    if (canvas.toBlob && navigator.canShare) {
      canvas.toBlob(function (blob) {
        if (!blob) { doDownload(); return; }
        var file = new File([blob], fileName(currentSpec), { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: currentSpec.title }).catch(function () {});
        } else {
          doDownload();
        }
      }, 'image/png');
    } else {
      doDownload();
    }
  }

  function open(opts) {
    try {
      currentSpec = buildSpec(opts);
      var m = ensureModal();
      var img = m.querySelector('.share-modal-img');
      img.src = dataURL(currentSpec);
      m.classList.add('show');
      document.body.style.overflow = 'hidden';
      return true;
    } catch (e) {
      alert('生成图片失败：' + (e && e.message ? e.message : e));
      return false;
    }
  }

  global.ShareCard = {
    render: render,
    dataURL: dataURL,
    download: download,
    open: open,
    buildSpec: buildSpec,
    close: close
  };
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
