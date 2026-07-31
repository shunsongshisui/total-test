#!/usr/bin/env python3
"""
Storage Analyzer — Build Interactive HTML Report (Windows)
读取 storage_scan.json + 分析数据，生成精美交互式 HTML 报告。
零第三方依赖。
"""
import json
import os
import re
import sys
from pathlib import Path


REPORT_CSS = r"""
:root {
  --bg: #0f1117;
  --card: #1a1d27;
  --card-hover: #222639;
  --border: #2a2e3a;
  --text: #e4e6ed;
  --text-muted: #8b8fa3;
  --green: #22c55e;
  --green-bg: rgba(34,197,94,0.12);
  --yellow: #eab308;
  --yellow-bg: rgba(234,179,8,0.12);
  --red: #ef4444;
  --red-bg: rgba(239,68,68,0.12);
  --blue: #3b82f6;
  --blue-bg: rgba(59,130,246,0.1);
  --accent: #6366f1;
  --accent-hover: #818cf8;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6; padding: 24px;
}
.container { max-width: 960px; margin: 0 auto; }

/* ── Headers ── */
h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
h2 { font-size: 20px; font-weight: 600; margin: 32px 0 16px; display: flex; align-items: center; gap: 8px; }
h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.subtitle { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }

/* ── Disk Card ── */
.disk-card {
  background: var(--card); border-radius: 16px; padding: 28px;
  border: 1px solid var(--border); margin-bottom: 24px;
}
.disk-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
}
.disk-title { font-size: 24px; font-weight: 700; }
.disk-details { color: var(--text-muted); font-size: 13px; }
.disk-numbers { display: flex; gap: 24px; }
.disk-number-item { text-align: center; }
.disk-number-value { font-size: 24px; font-weight: 700; }
.disk-number-label { font-size: 12px; color: var(--text-muted); }

.progress-container { margin: 16px 0; }
.progress-bar {
  height: 28px; background: #262a36; border-radius: 14px; overflow: hidden; display: flex;
}
.progress-segment { height: 100%; transition: width 0.6s ease; }
.segment-green { background: var(--green); }
.segment-yellow { background: var(--yellow); }
.segment-red { background: var(--red); }
.segment-blue { background: var(--blue); }

.pills { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;
}
.pill-green { background: var(--green-bg); color: var(--green); }
.pill-yellow { background: var(--yellow-bg); color: var(--yellow); }
.pill-red { background: var(--red-bg); color: var(--red); }
.pill-blue { background: var(--blue-bg); color: var(--blue); }

/* ── Info Grid ── */
.info-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px; margin-top: 16px;
}
.info-item {
  background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px 16px;
}
.info-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.info-value { font-size: 14px; font-weight: 500; margin-top: 2px; }

/* ── Top5 ── */
.top5-list { display: flex; flex-direction: column; gap: 8px; }
.top5-item {
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;
}
.top5-rank {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; flex-shrink: 0;
}
.top5-rank-1 { background: #fbbf24; color: #1a1d27; }
.top5-rank-2 { background: #94a3b8; color: #1a1d27; }
.top5-rank-3 { background: #d97706; color: #fff; }
.top5-rank-4, .top5-rank-5 { background: rgba(255,255,255,0.08); color: var(--text-muted); }
.top5-info { flex: 1; margin: 0 12px; }
.top5-name { font-weight: 600; font-size: 14px; }
.top5-type { font-size: 12px; color: var(--text-muted); }
.top5-size { font-weight: 600; font-size: 14px; white-space: nowrap; }
.top5-tag {
  font-size: 11px; padding: 2px 10px; border-radius: 10px; font-weight: 500;
}

/* ── Overview ── */
.overview-box {
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  padding: 18px 22px; margin-bottom: 16px; font-size: 14px; line-height: 1.7;
}

/* ── Priority List ── */
.priority-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.priority-item {
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  padding: 14px 18px; display: flex; align-items: flex-start; gap: 12px;
}
.priority-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.priority-text { font-size: 14px; }
.priority-size { font-weight: 600; white-space: nowrap; }

/* ── Tier Cards (collapsible) ── */
.tier-section { margin-bottom: 24px; }
.tier-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px; border-radius: 12px; cursor: pointer;
  user-select: none; font-weight: 600; font-size: 16px;
  border: 1px solid var(--border); transition: background 0.2s;
}
.tier-header:hover { filter: brightness(1.1); }
.tier-header-green { background: var(--green-bg); }
.tier-header-yellow { background: var(--yellow-bg); }
.tier-header-red { background: var(--red-bg); }
.tier-arrow { margin-left: auto; transition: transform 0.2s; font-size: 14px; }
.tier-arrow.open { transform: rotate(180deg); }
.tier-count { font-size: 13px; font-weight: 400; color: var(--text-muted); }

.tier-body { display: none; padding-top: 8px; }
.tier-body.open { display: block; }

/* ── Card Item ── */
.card-item {
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  padding: 18px 20px; margin-bottom: 10px;
}
.card-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
.card-path {
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-size: 12px; color: var(--text-muted); word-break: break-all;
  margin-bottom: 10px; padding: 6px 8px; background: rgba(0,0,0,0.2);
  border-radius: 6px;
}
.card-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.6; }
.card-notice {
  font-size: 12px; color: var(--yellow); background: var(--yellow-bg);
  padding: 8px 12px; border-radius: 8px; margin-bottom: 10px; line-height: 1.5;
}
.card-indirect {
  font-size: 13px; color: var(--blue); background: var(--blue-bg);
  padding: 8px 12px; border-radius: 8px; margin-bottom: 10px;
}
.card-indirect code {
  display: block; margin-top: 4px; padding: 6px 8px;
  background: rgba(0,0,0,0.25); border-radius: 6px;
  font-family: 'SF Mono', monospace; font-size: 12px; color: var(--text);
}
.card-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
  font-size: 13px; font-weight: 500; transition: all 0.15s; text-decoration: none;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn-danger { background: var(--red); color: #fff; }
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-outline {
  background: transparent; border: 1px solid var(--border); color: var(--text);
}
.btn-outline:hover { background: var(--card-hover); }
.btn-sm { padding: 5px 12px; font-size: 12px; }

/* ── Long Term ── */
.long-term-box {
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px 24px;
}
.long-term-box ul { padding-left: 20px; }
.long-term-box li { margin-bottom: 6px; font-size: 14px; }
.long-term-box a { color: var(--accent-hover); text-decoration: none; }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  padding: 12px 20px; border-radius: 10px; font-size: 14px;
  color: #fff; z-index: 9999; opacity: 0; transform: translateY(10px);
  transition: all 0.3s; pointer-events: none;
}
.toast.show { opacity: 1; transform: translateY(0); }
.toast-success { background: #16a34a; }
.toast-error { background: #dc2626; }
.toast-info { background: #2563eb; }

/* ── Modal ── */
.modal-overlay {
  display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  z-index: 9998; align-items: center; justify-content: center;
}
.modal-overlay.show { display: flex; }
.modal-box {
  background: var(--card); border: 1px solid var(--border); border-radius: 16px;
  padding: 28px; max-width: 480px; width: 90%;
}
.modal-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
.modal-text { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.6; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

.scroll-top {
  position: fixed; bottom: 80px; right: 24px;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--card); border: 1px solid var(--border);
  color: var(--text); cursor: pointer; font-size: 18px;
  display: none; align-items: center; justify-content: center;
  z-index: 999;
}
.scroll-top.show { display: flex; }

@media (max-width: 640px) {
  body { padding: 12px; }
  .disk-header { flex-direction: column; }
  .disk-numbers { gap: 16px; }
}
"""

REPORT_JS = r"""
function toggleTier(el) {
  const body = el.nextElementSibling;
  const arrow = el.querySelector('.tier-arrow');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open');
  arrow.classList.toggle('open');
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast toast-' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3500);
}

async function apiCall(action, payload) {
  const t = (window.TOKEN) || (new URLSearchParams(location.search).get('token')) || '';
  const res = await fetch('/api/' + action + '?token=' + t, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  return res.json();
}

function confirmAction(title, text, actionFn) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent = text;
  document.getElementById('modal-overlay').classList.add('show');
  document.getElementById('modal-confirm').onclick = async () => {
    document.getElementById('modal-overlay').classList.remove('show');
    await actionFn();
  };
  document.getElementById('modal-cancel').onclick = () => {
    document.getElementById('modal-overlay').classList.remove('show');
  };
}

async function trashPath(path) {
  confirmAction('Move to Recycle Bin', 'Move "' + path + '" to Recycle Bin? This is reversible until you empty the bin.', async () => {
    const r = await apiCall('trash', { path });
    if (r.ok) showToast('Moved to Recycle Bin: ' + path, 'success');
    else showToast('Error: ' + (r.error || 'unknown'), 'error');
  });
}

async function deletePath(path) {
  confirmAction('Permanently Delete', 'Permanently delete "' + path + '"? This CANNOT be undone!', async () => {
    const r = await apiCall('delete', { path });
    if (r.ok) showToast('Deleted: ' + path, 'success');
    else showToast('Error: ' + (r.error || 'unknown'), 'error');
  });
}

async function openPath(path) {
  const r = await apiCall('open', { path });
  if (!r.ok) showToast('Error: ' + (r.error || 'unknown'), 'error');
}
"""


def format_size(bytes_val):
    """Human-readable size string."""
    if bytes_val is None:
        return "未知"
    if bytes_val >= 1024**4:
        return f"{bytes_val/1024**4:.2f} TB"
    elif bytes_val >= 1024**3:
        return f"{bytes_val/1024**3:.2f} GB"
    elif bytes_val >= 1024**2:
        return f"{bytes_val/1024**2:.0f} MB"
    elif bytes_val >= 1024:
        return f"{bytes_val/1024:.0f} KB"
    else:
        return f"{bytes_val} B"


def format_size_approx(bytes_val):
    """Approximate size string with 约."""
    if bytes_val is None:
        return "未知"
    gb = bytes_val / 1024**3
    if gb >= 1:
        return f"约 {gb:.1f} GB"
    mb = bytes_val / 1024**2
    if mb >= 1:
        return f"约 {mb:.0f} MB"
    return f"{bytes_val/1024:.0f} KB"


def esc_js(s):
    """Escape string for use in JavaScript string literal (single-quoted)."""
    if s is None:
        return ""
    return str(s).replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "\\r")


def esc_html(s):
    """HTML-escape string for display."""
    if s is None:
        return ""
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def build_analysis(scan_data):
    """
    把扫描数据 + 手动分析纳入 analysis JSON。
    返回完整 analysis dict。
    """
    system = scan_data.get("system", {})
    disk_usage = system.get("disk_usage", {})
    c_drive = disk_usage.get("C:\\", {})
    d_drive = disk_usage.get("D:\\", {})

    total = c_drive.get("total", 0)
    used = c_drive.get("used", 0)
    free = c_drive.get("free", 0)

    # ── 三级分类条目 ──

    tier_green = [
        {
            "title": "酷狗音乐缓存",
            "path": "C:\\Users\\sw\\AppData\\Roaming\\KuGou8",
            "trash_paths": [
                "C:\\Users\\sw\\AppData\\Roaming\\KuGou8\\ImagesCache",
                "C:\\Users\\sw\\AppData\\Roaming\\KuGou8\\Upgrade",
                "C:\\Users\\sw\\AppData\\Roaming\\KuGou8\\CefCache89",
                "C:\\Users\\sw\\AppData\\Roaming\\KuGou8\\AppStore",
                "C:\\Users\\sw\\AppData\\Roaming\\KuGou8\\log",
            ],
            "size": format_size_approx(1_200_000_000 + 500_000_000 + 380_000_000 + 270_000_000 + 52_000_000),
            "size_estimate": "约 2.4 GB",
            "desc": "酷狗音乐的图片缓存、升级包、浏览器内核缓存和应用商店缓存，均为可再生数据，删除后不影响播放器正常使用。",
            "notice": "删除后酷狗音乐运行时会自动重建缓存，部分界面图片可能需要重新加载。",
            "closed_processes": ["KuGou.exe"],
        },
        {
            "title": "npm 包缓存",
            "path": "C:\\Users\\sw\\AppData\\Local\\npm-cache",
            "trash_paths": ["C:\\Users\\sw\\AppData\\Local\\npm-cache"],
            "size_estimate": "约 380 MB",
            "desc": "npm 下载的包缓存，`npm cache clean --force` 可安全清空。重新安装包时会重新下载，不影响已有项目。",
            "notice": "运行 npm install 会重新下载，仅影响离线安装速度。",
            "closed_processes": [],
        },
        {
            "title": "Arduino15 缓存",
            "path": "C:\\Users\\sw\\AppData\\Local\\Arduino15",
            "trash_paths": ["C:\\Users\\sw\\AppData\\Local\\Arduino15"],
            "size_estimate": "约 390 MB",
            "desc": "Arduino IDE 的包管理器缓存（开发板定义、库文件下载缓存）。可在 IDE 内重新下载。",
            "notice": "如需继续 Arduino 开发，移动后下次打开 IDE 会自动重新下载所需包。",
            "closed_processes": ["arduino.exe", "arduino-ide.exe"],
        },
        {
            "title": "Microsoft Edge 浏览器缓存",
            "path": "C:\\Users\\sw\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache",
            "trash_paths": ["C:\\Users\\sw\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache"],
            "size_estimate": "约 2 GB",
            "desc": "Edge 浏览器的网页缓存文件，包括图片、脚本等临时资源。浏览器会自动重建。",
            "notice": "清理后部分网站首次加载可能稍慢。关闭 Edge 后再操作。",
            "closed_processes": ["msedge.exe"],
        },
        {
            "title": "Windows 临时文件",
            "path": "C:\\Users\\sw\\AppData\\Local\\Temp",
            "trash_paths": ["C:\\Users\\sw\\AppData\\Local\\Temp"],
            "size_estimate": "约 550 MB",
            "desc": "系统及应用程序存放的临时文件。可安全清空，部分文件可能正在使用无法移入回收站。",
            "notice": "部分正在被使用的临时文件可能无法移动。建议重启后操作。",
            "closed_processes": [],
        },
    ]

    tier_yellow = [
        {
            "title": "微信聊天记录与文件（旧版）",
            "path": "C:\\Users\\sw\\Documents\\WeChat Files\\wxid_au2sbwcw77gz32",
            "desc": "旧版微信客户端存储的聊天记录、图片、视频和传输文件。其中 FileStorage (15.3 GB) 含大量微信传输的文件（文档、视频、图片），Msg (2.5 GB) 含聊天消息数据库。注意旧版和新版（xwechat_files）似乎是同一账号的重复数据。",
            "size_estimate": "约 17.9 GB",
            "open_note": "旧版微信数据目录，内容为微信内部格式。如需精细挑选文件，可在微信客户端内打开聊天记录逐条管理。较直接的清理方式：确认数据已迁移到新版后，在微信设置中注销旧版账号数据，或直接移除此目录。",
        },
        {
            "title": "微信聊天记录与文件（新版）",
            "path": "C:\\Users\\sw\\xwechat_files",
            "desc": "新版微信客户端（xwechat）存储的聊天记录和文件。msg/file 目录 (13.5 GB) 为聊天中传输的各类文件，msg/attach (4.1 GB) 为附件。此目录与旧版 `Documents\\WeChat Files` 下同一账号的数据高度重叠。",
            "size_estimate": "约 19.1 GB",
            "open_note": "新版微信数据目录，内容为应用内部格式。如需管理具体文件，建议在微信客户端内操作。如确认旧版数据已完整迁移，可在微信设置中清理旧版数据。",
        },
        {
            "title": "QQ 聊天记录与文件",
            "path": "C:\\Users\\sw\\Documents\\Tencent Files",
            "size_estimate": "约 2.8 GB",
            "desc": "QQ 聊天记录、表情、图片和传输文件。可在 QQ 设置中导出或清理聊天记录。",
            "open_note": "QQ 内部数据格式，建议在 QQ 应用内管理（设置 → 文件管理 → 打开文件夹 / 清理数据）。",
        },
        {
            "title": "百度网盘文件",
            "path": "C:\\Users\\sw\\AppData\\Roaming\\Baidu\\BaiduNetdisk",
            "size_estimate": "约 3.4 GB",
            "desc": "百度网盘客户端本地缓存和数据文件。包含同步文件、浏览缓存等内容。",
            "open_note": "建议在百度网盘客户端中管理缓存（设置 → 传输 → 清空缓存 / 选择同步目录）。",
        },
        {
            "title": "QQ拼音输入法用户词典",
            "path": "C:\\ProgramData\\Tencent\\QQPinyin\\users",
            "size_estimate": "约 10.4 GB",
            "desc": "QQ拼音输入法的用户自造词和词典缓存，包含 2000+ 个词典文件。10 GB 的词典体量异常大，疑似数据膨胀（正常为几十 MB 到几百 MB）。",
            "open_note": "QQ拼音输入法的用户词典目录，含自造词和个人词频数据。异常大的体量可能是软件 bug 导致。备选方案：在输入法设置中重置词库（设置 → 词库管理 → 清空自造词），或卸载重装输入法。",
            "trash_paths": [],
        },
        {
            "title": "腾讯会议数据",
            "path": "C:\\Users\\sw\\AppData\\Roaming\\Tencent\\WeMeet",
            "size_estimate": "约 2.8 GB",
            "desc": "腾讯会议的录制文件、屏幕共享缓存和聊天记录等。",
            "open_note": "含会议录制等用户数据。建议在腾讯会议客户端中管理（设置 → 录制/文件管理）。",
        },
        {
            "title": "ClassIn 在线教室数据",
            "path": "C:\\Users\\sw\\AppData\\Roaming\\ClassIn",
            "size_estimate": "约 2.0 GB",
            "desc": "ClassIn 在线教室的本地数据（课件缓存、录制文件等）。",
            "open_note": "含课件下载和课堂录制数据。可在 ClassIn 设置中清理缓存或管理录播文件。",
        },
        {
            "title": "夸克浏览器/应用数据",
            "path": "C:\\Users\\sw\\AppData\\Local\\Programs\\Quark",
            "size_estimate": "约 2.6 GB",
            "desc": "夸克浏览器程序及用户数据。包括浏览器内核、缓存等。",
            "open_note": "浏览器程序本体加数据。如需清理，在夸克浏览器设置中清除浏览数据。",
        },
        {
            "title": "通义千问（Qianwen）应用数据",
            "path": "C:\\Users\\sw\\AppData\\Local\\Programs\\QianwenApp",
            "size_estimate": "约 1.0 GB",
            "desc": "通义千问 AI 客户端程序数据。",
            "open_note": "AI 客户端应用数据，可在应用内管理本地缓存。",
        },
    ]

    tier_red = [
        {
            "title": "Microsoft Office",
            "path": "C:\\Program Files\\Microsoft Office",
            "size_estimate": "约 4.4 GB",
            "desc": "Microsoft Office 办公套件。非预装应用，可卸载。",
            "indirect_release": "如需卸载：\n1. 打开「设置 > 应用 > 已安装的应用」\n2. 搜索 Microsoft Office\n3. 点击卸载\n或使用官方卸载工具（support.microsoft.com/office/uninstall）",
            "app_paths": ["C:\\Program Files\\Microsoft Office"],
        },
        {
            "title": "Adobe 软件套件",
            "path": "C:\\Program Files\\Adobe",
            "size_estimate": "约 4.0 GB",
            "desc": "Adobe 系列软件（Photoshop 等）安装目录。",
            "indirect_release": "如需卸载：\n1. 打开 Creative Cloud 桌面应用\n2. 进入「应用」标签\n3. 在对应 App 右侧点击「… > 卸载」\n或打开「设置 > 应用 > 已安装的应用」选择卸载。",
            "app_paths": ["C:\\Program Files\\Adobe"],
        },
    ]

    # ── 排序 ──
    for tier in [tier_green, tier_yellow, tier_red]:
        tier.sort(key=lambda x: _parse_size_gb(x.get("size_estimate", "0 GB")), reverse=True)

    # ── 汇总 ──
    def total_gb(tier):
        total = 0.0
        for item in tier:
            gb = _parse_size_gb(item.get("size_estimate", "0 GB"))
            total += gb
        return total

    green_gb = total_gb(tier_green)
    yellow_gb = total_gb(tier_yellow)
    red_gb = total_gb(tier_red)

    # ── Top 5 ──
    all_items = [
        ("微信（新版）", format_size_approx(19.1 * 1024**3), "约 19.1 GB", "应用数据", "🟡"),
        ("微信（旧版）", format_size_approx(17.9 * 1024**3), "约 17.9 GB", "应用数据", "🟡"),
        ("QQ拼音输入法", format_size_approx(10.4 * 1024**3), "约 10.4 GB", "应用数据", "🟡"),
        ("酷狗音乐 & 腾讯系应用", format_size_approx(8.0 * 1024**3), "约 8.0 GB", "应用缓存+数据", "🟢🟡"),
        ("Microsoft Office", format_size_approx(4.4 * 1024**3), "约 4.4 GB", "应用本体", "🔴"),
    ]

    top5 = []
    for rank, (name, _, sz, typ, tag) in enumerate(all_items, 1):
        top5.append({
            "rank": rank,
            "name": name,
            "type": typ,
            "size": sz,
            "tag": tag,
        })

    return {
        "system": {
            "os": system.get("os", "windows"),
            "os_ver": system.get("os_ver", ""),
            "os_release": system.get("os_release", ""),
            "hostname": system.get("hostname", ""),
            "user": system.get("user", ""),
            "disk_name": system.get("disk_name", "C"),
            "disks": system.get("disks", ["C:\\"]),
            "disk_usage": disk_usage,
        },
        "top5": top5,
        "summary": {
            "overview": "C 盘的主要占用来自微信聊天数据（新旧两版合计约 37 GB）和 QQ拼音输入法的异常膨胀词典数据（10.4 GB）。可自动清理缓存约 4.7 GB，需人工判断的数据约 45 GB，谨慎清理的应用约 8.4 GB。",
            "priority": [
                {
                    "icon": "🟡",
                    "text": "确认微信数据是否需保留两个版本。可以只保留新版后删除旧版 `Documents\\WeChat Files` 目录，约释放 18 GB。",
                    "size": "约 18 GB",
                },
                {
                    "icon": "🟡",
                    "text": "QQ拼音输入法用户词典体量异常（10.4 GB），尝试在输入法设置中重置词库或卸载重装。",
                    "size": "约 10.4 GB",
                },
                {
                    "icon": "🟢",
                    "text": "一键清理缓存：酷狗缓存、Edge 缓存、npm 缓存、临时文件等，合计约 4.7 GB。",
                    "size": "约 4.7 GB",
                },
            ],
            "tier_stats": {
                "green": format_size_approx(green_gb * 1024**3),
                "yellow": format_size_approx(yellow_gb * 1024**3),
                "red": format_size_approx(red_gb * 1024**3),
            },
            "long_term": [
                "定期使用「设置 > 系统 > 存储 > 临时文件」清理系统缓存",
                "微信数据会持续增长，建议每半年在微信设置中清理不需要的聊天记录",
                "QQ拼音输入法可替换为轻量级输入法（如微软自带拼音）",
                "大文件（视频、安装包）可移动到 D 盘（剩余 142 GB）",
                "考虑使用存储感知（Storage Sense）自动清理临时文件和回收站",
            ],
        },
        "tiers": {
            "green": {
                "label": "可自动清理",
                "icon": "🟢",
                "items": tier_green,
            },
            "yellow": {
                "label": "需人工判断",
                "icon": "🟡",
                "items": tier_yellow,
            },
            "red": {
                "label": "谨慎清理",
                "icon": "🔴",
                "items": tier_red,
            },
        },
        "scan_time": scan_data.get("scan_time", ""),
    }


def _parse_size_gb(s):
    """Parse '约 14 GB', '约 500 MB' to float GB."""
    if not s:
        return 0.0
    s = s.replace("约 ", "").replace("（估算）", "").strip()
    m = re.search(r"([\d.]+)\s*(GB|MB|TB|KB)", s)
    if not m:
        return 0.0
    val = float(m.group(1))
    unit = m.group(2)
    if unit == "TB":
        return val * 1024
    elif unit == "MB":
        return val / 1024
    elif unit == "KB":
        return val / (1024 * 1024)
    return val


def render_report(analysis):
    """Render full HTML report."""
    sysinfo = analysis["system"]
    cdu = sysinfo.get("disk_usage", {}).get("C:\\", {})
    total = cdu.get("total", 0)
    used = cdu.get("used", 0)
    free = cdu.get("free", 0)

    stats = analysis["summary"]["tier_stats"]
    green_gb = _parse_size_gb(stats["green"])
    yellow_gb = _parse_size_gb(stats["yellow"])
    red_gb = _parse_size_gb(stats["red"])
    used_gb = used / 1024**3
    blue_gb = max(0, used_gb - green_gb - yellow_gb - red_gb)

    # Progress bar segments
    pct = lambda gb: max(0, min(100, (gb / used_gb * 100))) if used_gb > 0 else 0
    pg = pct(green_gb)
    py = pct(yellow_gb)
    pr = pct(red_gb)
    pb = pct(blue_gb)

    # ── Top5 ──
    top5_html = ""
    for item in analysis["top5"]:
        rank_class = f"top5-rank top5-rank-{item['rank']}"
        # tag color
        tag_colors = {"🟢": "pill-green", "🟡": "pill-yellow", "🔴": "pill-red", "🟢🟡": "pill-yellow"}
        tag_cls = tag_colors.get(item["tag"], "pill-blue")
        top5_html += f"""
        <div class="top5-item">
            <div class="{rank_class}">{item['rank']}</div>
            <div class="top5-info">
                <div class="top5-name">{esc_html(item['name'])}</div>
                <div class="top5-type">{esc_html(item['type'])}</div>
            </div>
            <div class="top5-size">{esc_html(item['size'])}</div>
            <span class="top5-tag {tag_cls}">{esc_html(item['tag'])}</span>
        </div>"""

    # ── Priority ──
    priority_html = ""
    for p in analysis["summary"]["priority"]:
        priority_html += f"""
        <div class="priority-item">
            <div class="priority-icon">{p['icon']}</div>
            <div class="priority-text">{esc_html(p['text'])} <span class="priority-size">{esc_html(p['size'])}</span></div>
        </div>"""

    # ── Tiers ──
    tier_sections = ""
    for tier_key in ["green", "yellow", "red"]:
        tier = analysis["tiers"][tier_key]
        icon = tier["icon"]
        label = tier["label"]
        items = tier["items"]
        count = len(items)
        header_cls = {
            "green": "tier-header-green",
            "yellow": "tier-header-yellow",
            "red": "tier-header-red",
        }[tier_key]

        if not items:
            continue

        items_html = ""
        for item in items:
            title = esc_html(item.get("title", ""))
            path = esc_html(item.get("path", ""))
            sz = esc_html(item.get("size_estimate", ""))
            desc = esc_html(item.get("desc", ""))
            notice = esc_html(item.get("notice", item.get("open_note", "")))
            indirect = esc_html(item.get("indirect_release", ""))

            # Buttons
            buttons_html = ""
            if tier_key == "green":
                trash_paths = item.get("trash_paths", [])
                for tp in trash_paths[:3]:  # max 3 buttons
                    tp_esc = esc_js(tp)
                    buttons_html += f"""
                    <button class="btn btn-outline btn-sm" onclick="trashPath('{tp_esc}')">🗑 移回收站</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePath('{tp_esc}')">🗑 直接删除</button>"""
                if not trash_paths:
                    buttons_html += """<span style="font-size:12px;color:var(--text-muted)">路径无法访问</span>"""

            elif tier_key == "yellow":
                trash_paths = item.get("trash_paths", [])
                if trash_paths:
                    for tp in trash_paths:
                        tp_esc = esc_js(tp)
                        buttons_html += f"""
                        <button class="btn btn-outline btn-sm" onclick="trashPath('{tp_esc}')">🗑 移回收站</button>"""
                path_esc = esc_js(item.get("path", ""))
                buttons_html += f"""
                <button class="btn btn-outline btn-sm" onclick="openPath('{path_esc}')">📂 在资源管理器打开</button>"""

            else:  # red
                app_paths = item.get("app_paths", [])
                indirect_html = ""
                if indirect:
                    indirect_html = f'<div class="card-indirect"><strong>卸载方式：</strong><code>{indirect}</code></div>'
                for ap in app_paths:
                    ap_esc = esc_js(ap)
                    buttons_html += f"""
                    <button class="btn btn-outline btn-sm" onclick="openPath('{ap_esc}')">📂 在文件管理器打开（去卸载）</button>"""

            notice_html = f'<div class="card-notice">{notice}</div>' if notice else ""

            items_html += f"""
            <div class="card-item">
                <div class="card-title">{icon} {title}</div>
                <div class="card-path">{path}</div>
                <div class="card-desc"><strong>占用：</strong>{sz}</div>
                <div class="card-desc">{desc}</div>
                {notice_html}
                {indirect_html if tier_key == 'red' else ''}
                <div class="card-buttons">{buttons_html}</div>
            </div>"""

        tier_sections += f"""
        <div class="tier-section">
            <div class="tier-header {header_cls}" onclick="toggleTier(this)">
                {icon} {esc_html(label)}
                <span class="tier-count">（{count} 项）</span>
                <span class="tier-arrow">▼</span>
            </div>
            <div class="tier-body open">
                {items_html}
            </div>
        </div>"""

    # ── Long term ──
    long_term_html = "<ul>"
    for tip in analysis["summary"]["long_term"]:
        long_term_html += f"<li>{esc_html(tip)}</li>"
    long_term_html += "</ul>"

    # ── Disk info pills ──
    total_gb_str = format_size(total)
    used_gb_str = format_size(used)
    free_gb_str = format_size(free)

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>存储分析报告 — {esc_html(sysinfo.get('hostname', 'PC'))}</title>
<style>{REPORT_CSS}</style>
</head>
<body>
<div class="container">

<div class="disk-card">
    <div class="disk-header">
        <div>
            <div class="disk-title">💾 C: 盘 — {esc_html(sysinfo.get('hostname', 'PC'))}</div>
            <div class="disk-details">Windows {esc_html(sysinfo.get('os_release', ''))} · Version {esc_html(sysinfo.get('os_ver', ''))}</div>
        </div>
        <div class="disk-numbers">
            <div class="disk-number-item">
                <div class="disk-number-value" style="color:var(--blue)">{total_gb_str}</div>
                <div class="disk-number-label">总容量</div>
            </div>
            <div class="disk-number-item">
                <div class="disk-number-value" style="color:var(--yellow)">{used_gb_str}</div>
                <div class="disk-number-label">已用</div>
            </div>
            <div class="disk-number-item">
                <div class="disk-number-value" style="color:var(--green)">{free_gb_str}</div>
                <div class="disk-number-label">可用</div>
            </div>
        </div>
    </div>

    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-segment segment-green" style="width:{pg:.1f}%"></div>
            <div class="progress-segment segment-yellow" style="width:{py:.1f}%"></div>
            <div class="progress-segment segment-red" style="width:{pr:.1f}%"></div>
            <div class="progress-segment segment-blue" style="width:{pb:.1f}%"></div>
        </div>
    </div>

    <div class="pills">
        <span class="pill pill-green">🟢 可自动清理 {esc_html(stats['green'])}</span>
        <span class="pill pill-yellow">🟡 需人工判断 {esc_html(stats['yellow'])}</span>
        <span class="pill pill-red">🔴 谨慎清理 {esc_html(stats['red'])}</span>
        <span class="pill pill-blue">🔵 系统及其他 {format_size_approx(blue_gb * 1024**3)}</span>
    </div>

    <div class="info-grid">
        <div class="info-item">
            <div class="info-label">主机名</div>
            <div class="info-value">{esc_html(sysinfo.get('hostname', ''))}</div>
        </div>
        <div class="info-item">
            <div class="info-label">用户</div>
            <div class="info-value">{esc_html(sysinfo.get('user', ''))}</div>
        </div>
        <div class="info-item">
            <div class="info-label">操作系统</div>
            <div class="info-value">Windows {esc_html(sysinfo.get('os_release', ''))}</div>
        </div>
        <div class="info-item">
            <div class="info-label">扫描时间</div>
            <div class="info-value">{esc_html(analysis.get('scan_time', ''))}</div>
        </div>
    </div>
</div>

<h2>🔥 占用排行 Top 5</h2>
<div class="top5-list">{top5_html}</div>

<h2>📋 执行建议</h2>
<div class="overview-box">{esc_html(analysis['summary']['overview'])}</div>
<div class="priority-list">{priority_html}</div>

<h2>🧹 清理清单</h2>
{tier_sections}

<h2>📈 长期优化建议</h2>
<div class="long-term-box">{long_term_html}
    <div style="margin-top:12px;font-size:12px;color:var(--text-muted)">
        <p>💡 可视化分析工具：DaisyDisk · WizTree · SpaceSniffer · TreeSize Free</p>
        <p>⚠️ 本报告为只读扫描结果，删除操作前请确认文件无误。</p>
    </div>
</div>

<div style="margin-top:24px;text-align:center;font-size:12px;color:var(--text-muted);padding:16px;">
    Storage Analyzer · 只读存储分析报告
</div>

</div>

<div id="toast" class="toast"></div>

<div id="modal-overlay" class="modal-overlay">
    <div class="modal-box">
        <div class="modal-title" id="modal-title"></div>
        <div class="modal-text" id="modal-text"></div>
        <div class="modal-actions">
            <button id="modal-cancel" class="btn btn-outline">取消</button>
            <button id="modal-confirm" class="btn btn-danger">确认</button>
        </div>
    </div>
</div>

<button class="scroll-top" onclick="window.scrollTo({{top:0,behavior:'smooth'}})">↑</button>

/*__TOKEN__*/
<script>{REPORT_JS}</script>
</body>
</html>"""
    return html


def main():
    if len(sys.argv) < 3:
        print("Usage: python build_report.py <scan.json> <output.html>", file=sys.stderr)
        sys.exit(1)

    scan_path = sys.argv[1]
    out_path = sys.argv[2]

    with open(scan_path, encoding="utf-8") as f:
        scan_data = json.load(f)

    analysis = build_analysis(scan_data)
    html = render_report(analysis)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ 报告已生成: {out_path}", file=sys.stderr)
    print(f"   文件大小: {os.path.getsize(out_path) / 1024:.0f} KB", file=sys.stderr)

    # Also save analysis JSON
    analysis_path = os.path.splitext(out_path)[0] + "_analysis.json"
    with open(analysis_path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    print(f"✅ 分析数据已保存: {analysis_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
