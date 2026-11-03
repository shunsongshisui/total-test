/* =====================================================================
   制作者署名徽章（共享组件 · 自动装配版）
   ---------------------------------------------------------------------
   在页面右上角显示一个固定徽章，指向制作者的小红书主页。

   接入方式：页面里加一行即可，元素和样式全部由本脚本生成
       <script src="signature.js"></script>      （根目录页面）
       <script src="../signature.js"></script>   （子目录页面）

   修改署名只需改下方 CONFIG 一处，全站生效。
   ===================================================================== */
(function () {
  'use strict';

  /* ==================== 配置区（只改这里） ==================== */
  var CONFIG = {
    // 昵称（显示在徽章上）
    name: '听说你也是卷毛狒狒',

    // 小红书号（对外展示的短号，不是主页 URL 里的内部 ID）
    redId: '63064928254',

    // 小红书主页地址（24 位内部 ID，由短链 xhslink.cn/o/7wBvrSRONhs 解析得出）。
    // 刻意不带 xsec_token：那是会过期的分享凭证，写进站点后徽章会失效。
    // 留空时依次降级为：小红书号搜索 → 昵称搜索。
    url: 'https://www.xiaohongshu.com/user/profile/6a364db0000000000f03b802',

    // 平台标签（徽章上显示的小字）
    platform: '小红书'
  };
  /* ============================================================== */

  var ROOT = document.documentElement;
  if (!ROOT || ROOT.getAttribute('data-sig-done')) return;
  ROOT.setAttribute('data-sig-done', '1');

  // 小红书 logo 红
  var XHS_RED = '#ff2442';

  function resolveHref() {
    if (CONFIG.url && /^https?:\/\//i.test(CONFIG.url)) return CONFIG.url;
    var kw = CONFIG.redId || CONFIG.name;
    return 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent(kw);
  }

  function injectStyles() {
    if (document.getElementById('dsh-signature-styles')) return;
    var css = [
      /* 徽章本体 */
      '.dsh-sig{position:fixed;top:14px;right:14px;z-index:2147483000;',
      'display:inline-flex;align-items:center;gap:7px;',
      'padding:8px 13px 8px 10px;border-radius:999px;',
      'background:rgba(255,255,255,.94);',
      'border:1px solid rgba(11,11,11,.10);',
      'box-shadow:0 2px 6px rgba(11,11,11,.06),0 8px 24px rgba(11,11,11,.08);',
      'font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB",',
      '"Microsoft YaHei",sans-serif;',
      'font-size:13px;line-height:1.2;letter-spacing:.01em;',
      'color:#0b0b0b;text-decoration:none;cursor:pointer;',
      'backdrop-filter:saturate(180%) blur(12px);',
      '-webkit-backdrop-filter:saturate(180%) blur(12px);',
      'transition:transform .18s ease,box-shadow .18s ease,background .18s ease;',
      'pointer-events:auto;}',

      /* 小红书标记 */
      '.dsh-sig-mark{display:inline-flex;align-items:center;justify-content:center;',
      'width:18px;height:18px;border-radius:5px;flex:0 0 auto;',
      'background:' + XHS_RED + ';color:#fff;',
      'font-size:11px;font-weight:700;font-style:normal;line-height:1;}',

      /* 昵称 */
      '.dsh-sig-name{font-weight:600;white-space:nowrap;}',
      '.dsh-sig-at{font-weight:400;color:#898781;margin-right:1px;}',

      /* 平台小字 */
      '.dsh-sig-plat{font-size:11px;color:#898781;white-space:nowrap;',
      'padding-left:7px;margin-left:1px;border-left:1px solid rgba(11,11,11,.12);}',

      /* 悬停 / 聚焦 */
      '.dsh-sig:hover{transform:translateY(-1px);',
      'box-shadow:0 3px 8px rgba(11,11,11,.08),0 12px 32px rgba(11,11,11,.12);',
      'background:#fff;}',
      '.dsh-sig:focus-visible{outline:2px solid #2a78d6;outline-offset:3px;}',

      /* 暗色模式 */
      '@media (prefers-color-scheme: dark){',
      ':root:not([data-theme="light"]) .dsh-sig{',
      'background:rgba(26,26,25,.92);border-color:rgba(255,255,255,.12);',
      'color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.35),0 8px 24px rgba(0,0,0,.45);}',
      ':root:not([data-theme="light"]) .dsh-sig:hover{background:#1f1f1e;}',
      ':root:not([data-theme="light"]) .dsh-sig-at,',
      ':root:not([data-theme="light"]) .dsh-sig-plat{color:#a8a69d;}',
      ':root:not([data-theme="light"]) .dsh-sig-plat{border-left-color:rgba(255,255,255,.16);}',
      '}',
      '[data-theme="dark"] .dsh-sig{background:rgba(26,26,25,.92);',
      'border-color:rgba(255,255,255,.12);color:#fff;}',
      '[data-theme="dark"] .dsh-sig-at,[data-theme="dark"] .dsh-sig-plat{color:#a8a69d;}',
      '[data-theme="dark"] .dsh-sig-plat{border-left-color:rgba(255,255,255,.16);}',

      /* 移动端：缩小且不挡视线 */
      '@media (max-width:620px){',
      '.dsh-sig{top:10px;right:10px;padding:7px 11px 7px 9px;font-size:12px;gap:6px;}',
      '.dsh-sig-plat{display:none;}',   /* 小屏隐藏平台标签，只留昵称 */
      '}',

      /* 尊重减少动画偏好 */
      '@media (prefers-reduced-motion: reduce){',
      '.dsh-sig{transition:none;}.dsh-sig:hover{transform:none;}}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'dsh-signature-styles';
    s.textContent = css;
    (document.head || ROOT).appendChild(s);
  }

  function buildBadge() {
    var a = document.createElement('a');
    a.className = 'dsh-sig';
    a.id = 'dsh-signature';
    a.href = resolveHref();
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = '制作者 @' + CONFIG.name + ' · ' + CONFIG.platform;

    var mark = document.createElement('i');
    mark.className = 'dsh-sig-mark';
    mark.textContent = '书';
    a.appendChild(mark);

    var at = document.createElement('span');
    at.className = 'dsh-sig-at';
    at.textContent = '@';
    a.appendChild(at);

    var nm = document.createElement('span');
    nm.className = 'dsh-sig-name';
    nm.textContent = CONFIG.name;
    a.appendChild(nm);

    var pl = document.createElement('span');
    pl.className = 'dsh-sig-plat';
    pl.textContent = CONFIG.platform;
    a.appendChild(pl);

    return a;
  }

  function boot() {
    if (document.getElementById('dsh-signature')) return;
    injectStyles();
    var badge = buildBadge();
    if (document.body) {
      document.body.appendChild(badge);
    } else {
      ROOT.appendChild(badge);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
