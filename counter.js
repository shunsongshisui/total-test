/* =====================================================================
   访客计数器（共享组件 · 自动装配版）
   ---------------------------------------------------------------------
   用途：在站点任意页面底部显示"本页浏览量 / 全站访客数"。

   两种接入方式，任选其一：

     A. 零侵入（推荐）—— 页面里只加一行，元素和样式由本脚本自动生成：
          <script src="../counter.js"></script>      （子目录页面）
          <script src="counter.js"></script>         （根目录页面）

     B. 自定义位置 —— 页面里自己写好元素，本脚本会复用、不重复插入：
          <div class="ctr-line">本测试已被浏览
            <b id="ctrPv">—</b> 次 · <b id="ctrUv">—</b> 位访客</div>

   数据来源与降级策略：
     1) 联网时读取"不蒜子"(busuanzi.ibruce.info) 的真实全站数据；
     2) 服务不可达时，降级为本设备 localStorage 计数，保证离线/被墙时仍有反馈。

   样式作用域：仅在 <html> 上打 class="dsh-counter-on"，所有规则都限定在
   该 class 之下。站点原有的 .ctr-line 规则照常生效，本脚本只做兜底。
   ===================================================================== */
(function () {
  'use strict';

  var ROOT = document.documentElement;
  if (!ROOT || ROOT.getAttribute('data-ctr-done')) return;
  ROOT.setAttribute('data-ctr-done', '1');

  // ---------- 1. 兜底样式：仅在脚本自动创建元素时注入 ----------
  function injectStyles() {
    // 作用域类：只有脚本自己生成计数器时才挂上，避免覆盖各页自带的 .ctr-line 样式
    ROOT.classList.add('dsh-counter-on');
    if (document.getElementById('dsh-counter-styles')) return;
    var css = [
      '.dsh-counter-on .ctr-line{',
      'display:block;width:100%;max-width:100%;margin:0 auto;',
      'text-align:center;font-size:12px;line-height:1.9;letter-spacing:.02em;',
      'color:#8a8f98;padding:28px 16px 34px;box-sizing:border-box;}',
      '.dsh-counter-on .ctr-line b{font-variant-numeric:tabular-nums;',
      'color:#5c6270;font-weight:600;margin:0 2px;}',
      '/* 深色页面自动提亮 */',
      '@media (prefers-color-scheme:dark){',
      ':root:not([data-theme="light"]) .dsh-counter-on .ctr-line{color:#8a8f98;}',
      ':root:not([data-theme="light"]) .dsh-counter-on .ctr-line b{color:#c3c2b7;}',
      '}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'dsh-counter-styles';
    s.textContent = css;
    (document.head || ROOT).appendChild(s);
  }

  // ---------- 2. 找到或创建显示元素 ----------
  function ensureLine() {
    var pvEl = document.getElementById('ctrPv');
    var uvEl = document.getElementById('ctrUv');
    if (pvEl || uvEl) return { pv: pvEl, uv: uvEl, created: false };

    var line = document.createElement('div');
    line.className = 'ctr-line';
    line.id = 'dsh-counter-line';
    line.setAttribute('aria-label', '访问统计');
    line.appendChild(document.createTextNode('本页已被浏览 '));
    var b1 = document.createElement('b');
    b1.id = 'ctrPv';
    b1.textContent = '—';
    line.appendChild(b1);
    line.appendChild(document.createTextNode(' 次 · '));
    var b2 = document.createElement('b');
    b2.id = 'ctrUv';
    b2.textContent = '—';
    line.appendChild(b2);
    line.appendChild(document.createTextNode(' 位访客'));

    // 放置策略（避免成为 body 的 flex 并列子项，那样会被挤到内容旁边）
    //   ① 有页脚：排在页脚之后
    //   ② 否则：放进页面的内容容器（.container / main / #app 等）
    //   ③ 再否则：才追加到 <body>
    var footer = document.querySelector('footer, .footer');
    var body = document.body;

    if (footer && footer.parentNode) {
      var parent = footer.parentNode;
      if (footer.nextSibling) {
        parent.insertBefore(line, footer.nextSibling);
      } else {
        parent.appendChild(line);
      }
      return { pv: b1, uv: b2, created: true };
    }

    var host = pickBlockHost();
    if (host) {
      host.appendChild(line);
    } else if (body) {
      // 兜底：body 本身是 flex 时，让计数器独占一整行
      line.style.width = '100%';
      line.style.flexBasis = '100%';
      if (window.getComputedStyle) {
        var bd = '';
        try { bd = window.getComputedStyle(body).display; } catch (e) { bd = ''; }
        if (bd === 'flex' || bd === 'inline-flex') body.style.flexWrap = 'wrap';
      }
      body.appendChild(line);
    } else {
      return null;
    }
    return { pv: b1, uv: b2, created: true };
  }

  // 选一个块级容器：跳过自身是 flex/grid 的，避免计数器被并排摆放
  function pickBlockHost() {
    var selectors = ['.container', 'main', '#app', '.app', '.wrap', '#panel'];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (!el || el === document.body || el === document.documentElement) continue;
      var d = '';
      try {
        d = window.getComputedStyle ? window.getComputedStyle(el).display : '';
      } catch (e) { d = ''; }
      if (d !== 'flex' && d !== 'inline-flex' && d !== 'grid') return el;
    }
    return null;
  }

  // ---------- 3. 本地降级计数 ----------
  function pageKey() {
    return encodeURIComponent(location.pathname);
  }
  function num(key) {
    try {
      return parseInt(localStorage.getItem(key) || '0', 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function bumpLocal(els) {
    var pvK, uvK, sessK, first;
    try {
      if (!window.localStorage) return;
      pvK = 'ctr_pv_' + pageKey();
      uvK = 'ctr_uv_' + pageKey();
      sessK = 'ctr_sess_' + pageKey();
      first = !localStorage.getItem(sessK);
      if (first) localStorage.setItem(sessK, '1');
      localStorage.setItem(pvK, String(num(pvK) + 1));
      if (first) localStorage.setItem(uvK, String(num(uvK) + 1));
    } catch (e) {
      return;
    }
    if (els.pv) els.pv.textContent = String(num(pvK));
    if (els.uv) els.uv.textContent = String(num(uvK));
  }

  // ---------- 4. 用不蒜子数据覆盖 ----------
  function applyBusuanzi(els) {
    var b = window.busuanzi;
    if (!b) return false;
    var done = false;
    if (els.pv && b.page_pv != null) { els.pv.textContent = b.page_pv; done = true; }
    if (els.uv && b.site_uv != null) { els.uv.textContent = b.site_uv; done = true; }
    if (!done && els.uv && b.page_uv != null) { els.uv.textContent = b.page_uv; done = true; }
    return done;
  }

  // ---------- 5. 启动 ----------
  function boot() {
    var els = ensureLine();
    if (!els) return;
    if (els.created) injectStyles();

    bumpLocal(els);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    s.onerror = function () { /* 保持本地计数，不报错 */ };
    (document.body || ROOT).appendChild(s);

    var tries = 0;
    var timer = setInterval(function () {
      if (applyBusuanzi(els) || ++tries >= 40) clearInterval(timer);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
