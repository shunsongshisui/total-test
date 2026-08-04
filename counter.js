/* =====================================================================
   访客计数器（共享组件）
   优先使用"不蒜子"免费统计服务（busuanzi.ibruce.info，无需注册）：
   联网时显示真实的全站浏览量 / 访客数；
   服务不可达时自动回退为"本设备"计数（localStorage），保证离线可用。
   用法：在页面底部放
     <div class="ctr-line">… <b id="ctrPv">—</b> … <b id="ctrUv">—</b> …</div>
   并在脚本区引入本文件。
   ===================================================================== */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  var pvEl = $('ctrPv'), uvEl = $('ctrUv');
  if (!pvEl && !uvEl) return;

  function pageKey() { return encodeURIComponent(location.pathname); }
  function num(key) { return parseInt(localStorage.getItem(key) || '0', 10) || 0; }

  // 本地回退计数：按"页面"记录，每台设备同页只计 1 次访客
  function bumpLocal() {
    if (!window.localStorage) return;
    var pvK = 'ctr_pv_' + pageKey();
    var uvK = 'ctr_uv_' + pageKey();
    var sessK = 'ctr_sess_' + pageKey();
    var first = !localStorage.getItem(sessK);
    if (first) localStorage.setItem(sessK, '1');
    localStorage.setItem(pvK, String(num(pvK) + 1));
    if (first) localStorage.setItem(uvK, String(num(uvK) + 1));
    if (pvEl) pvEl.textContent = String(num(pvK));
    if (uvEl) uvEl.textContent = String(num(uvK));
  }

  // 不蒜子加载完成后，用其数据覆盖本地数字
  function applyBusuanzi() {
    var b = window.busuanzi;
    if (b && (b.page_pv != null || b.site_uv != null)) {
      if (pvEl && b.page_pv != null) pvEl.textContent = b.page_pv;
      if (uvEl && b.site_uv != null) uvEl.textContent = b.site_uv;
      return true;
    }
    return false;
  }

  bumpLocal();
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
  document.body.appendChild(s);
  var tries = 0;
  var timer = setInterval(function () {
    if (applyBusuanzi() || ++tries >= 40) clearInterval(timer); // 最多等 ~12 秒
  }, 300);
})();
