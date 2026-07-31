#!/usr/bin/env python3
"""Update the analysis JSON with fresh scan data."""
import json, os

ap = r'C:\Users\sw\Desktop\storage-report_analysis.json'
with open(ap, 'r', encoding='utf-8') as f:
    a = json.load(f)

# System info
a['system']['disk_usage'] = {
    'C:\\': {'total': 250*1024**3, 'used': 179.8*1024**3, 'free': 70.2*1024**3},
    'D:\\': {'total': 224.7*1024**3, 'used': 87.1*1024**3, 'free': 137.6*1024**3},
}
a['scan_time'] = '2026-06-18T10:30:00'

# Top 5
a['top5'] = [
    {'rank': 1, 'name': '微信聊天记录（旧版）', 'type': '应用数据', 'size': '约 17.9 GB', 'tag': '🟡'},
    {'rank': 2, 'name': '微信聊天记录（xwechat 新版）', 'type': '应用数据', 'size': '约 14.4 GB', 'tag': '🟡'},
    {'rank': 3, 'name': 'QQ拼音输入法用户词典', 'type': '应用数据', 'size': '约 10.4 GB', 'tag': '🟡'},
    {'rank': 4, 'name': '腾讯系应用（QQ/WeMeet/QQPinyin本体）', 'type': '应用本体+数据', 'size': '约 10 GB', 'tag': '🟡'},
    {'rank': 5, 'name': 'Microsoft Office + Adobe', 'type': '应用本体', 'size': '约 8.4 GB', 'tag': '🔴'},
]

# Green items
green_items = [
    {
        'title': '酷狗音乐缓存',
        'path': 'C:\\Users\\sw\\AppData\\Roaming\\KuGou8',
        'trash_paths': [p for p in [
            r'C:\Users\sw\AppData\Roaming\KuGou8\ImagesCache',
            r'C:\Users\sw\AppData\Roaming\KuGou8\CefCache89',
            r'C:\Users\sw\AppData\Roaming\KuGou8\AppStore',
            r'C:\Users\sw\AppData\Roaming\KuGou8\log',
        ] if os.path.exists(p)],
        'size_estimate': '约 1.7 GB',
        'desc': '酷狗音乐的图片缓存、浏览器内核缓存、应用商店缓存和日志，均为可再生数据。',
        'notice': '删除后酷狗运行时会自动重建，部分界面图片需重新加载。建议关闭酷狗后操作。',
        'closed_processes': ['KuGou.exe'],
    },
    {
        'title': 'Microsoft Edge 浏览器缓存',
        'path': 'C:\\Users\\sw\\AppData\\Local\\Microsoft\\Edge',
        'trash_paths': [p for p in [
            r'C:\Users\sw\AppData\Local\Microsoft\Edge\User Data\Default\Cache',
        ] if os.path.exists(p)],
        'size_estimate': '约 2 GB',
        'desc': 'Edge 浏览器的网页缓存文件（图片、脚本、样式等），浏览器会自动重建。',
        'notice': '关闭 Edge 后操作。清理后部分网站首次加载可能稍慢。',
        'closed_processes': ['msedge.exe'],
    },
    {
        'title': 'npm 包缓存',
        'path': 'C:\\Users\\sw\\AppData\\Roaming\\npm',
        'trash_paths': [p for p in [
            r'C:\Users\sw\AppData\Roaming\npm\node_modules',
        ] if os.path.exists(p)],
        'size_estimate': '约 680 MB',
        'desc': 'npm 全局安装的包缓存。可通过 `npm cache clean --force` 清理，不影响已有项目。',
        'notice': '重新安装全局包时会重新下载。',
        'closed_processes': [],
    },
    {
        'title': 'Windows 临时文件',
        'path': 'C:\\Users\\sw\\AppData\\Local\\Temp',
        'trash_paths': [],
        'size_estimate': '约 720 MB',
        'desc': '应用程序存放的临时文件。建议使用 Windows 内置「磁盘清理」工具或运行清理命令来清空内容，不要直接删除 Temp 目录本身。',
        'notice': '部分正在使用的文件无法移动。建议重启电脑后运行磁盘清理。',
        'closed_processes': [],
    },
]

a['tiers']['green'] = {'label': '可自动清理', 'icon': '🟢', 'items': green_items}

# Yellow items
yellow_items = [
    {
        'title': '微信聊天记录与文件（旧版）',
        'path': 'C:\\Users\\sw\\Documents\\WeChat Files\\wxid_au2sbwcw77gz32',
        'trash_paths': [r'C:\Users\sw\Documents\WeChat Files\wxid_au2sbwcw77gz32'],
        'size_estimate': '约 17.9 GB',
        'desc': '旧版微信客户端的聊天记录、图片、视频和传输文件。与新版本（xwechat）似乎是同一微信账号的数据。新版聊天记录也在持续使用中，确认旧版数据已完成迁移后可清理此目录。',
        'open_note': '旧版微信数据目录，内容为微信内部格式。如需精细管理文件，请打开旧版微信客户端检查聊天记录是否完整，确认后再进行操作。可在微信设置 > 文件管理 > 打开文件夹中查看。',
    },
    {
        'title': '微信聊天记录与文件（新版 xwechat）',
        'path': 'C:\\Users\\sw\\xwechat_files',
        'trash_paths': [],
        'size_estimate': '约 14.4 GB',
        'desc': '新版微信客户端存储的聊天记录、图片、视频和文件。msg 目录含大量聊天数据和传输文件。',
        'open_note': '新版微信数据目录，内容为应用内部格式。如需删除特定文件或释放空间，建议在微信客户端内管理或清理不需要的聊天记录。',
    },
    {
        'title': 'QQ拼音输入法用户词典（异常膨胀）',
        'path': 'C:\\ProgramData\\Tencent\\QQPinyin\\users',
        'trash_paths': [],
        'size_estimate': '约 10.4 GB',
        'desc': 'QQ拼音输入法的用户自造词和词典缓存（2000+ 个文件）。10+ GB 的词典体量远超正常范围（正常为几十 MB），疑似 bug 导致的持续膨胀。',
        'open_note': 'QQ拼音输入法用户词库目录。处置方案：在输入法设置中重置词库（右键输入法状态栏 > 属性设置 > 词库管理 > 清空自造词），或卸载后重装输入法。',
    },
    {
        'title': '百度网盘缓存与数据',
        'path': 'C:\\Users\\sw\\AppData\\Roaming\\Baidu\\BaiduNetdisk',
        'trash_paths': [],
        'size_estimate': '约 3.4 GB',
        'desc': '百度网盘客户端的本地缓存、浏览记录和下载文件索引数据。',
        'open_note': '建议在百度网盘客户端中管理：设置 > 传输 > 清空下载缓存。如需清理具体文件，可打开目录手动筛选。',
    },
    {
        'title': 'QQ 聊天记录与文件',
        'path': 'C:\\Users\\sw\\Documents\\Tencent Files',
        'trash_paths': [],
        'size_estimate': '约 2.8 GB',
        'desc': 'QQ 聊天记录、图片、表情和传输文件。',
        'open_note': 'QQ 内部数据格式，建议在 QQ 应用内管理：设置 > 文件管理 > 清理数据 / 打开文件夹。',
    },
    {
        'title': '腾讯会议（WeMeet）数据',
        'path': 'C:\\Users\\sw\\AppData\\Roaming\\Tencent\\WeMeet',
        'trash_paths': [],
        'size_estimate': '约 2.8 GB',
        'desc': '腾讯会议的录制文件、屏幕共享缓存和聊天记录。',
        'open_note': '含会议录制等用户数据。可在腾讯会议客户端中管理：设置 > 录制 > 打开文件夹 / 清理缓存。',
    },
    {
        'title': 'ClassIn 在线教室数据',
        'path': 'C:\\Users\\sw\\AppData\\Roaming\\ClassIn',
        'trash_paths': [],
        'size_estimate': '约 2.0 GB',
        'desc': 'ClassIn 在线教室的课件缓存、课堂录制数据等。',
        'open_note': '含课件下载和录播文件。可在 ClassIn 设置中清理缓存或管理录播文件。',
    },
    {
        'title': '夸克浏览器 (Quark) 数据',
        'path': 'C:\\Users\\sw\\AppData\\Local\\Programs\\Quark',
        'trash_paths': [],
        'size_estimate': '约 2.5 GB',
        'desc': '夸克浏览器程序及用户数据（含缓存、浏览数据等）。',
        'open_note': '浏览器程序加数据。如需清理，在夸克浏览器设置中清除浏览数据。如不再使用可在「设置 > 应用」中卸载。',
    },
    {
        'title': '通义千问 (Qianwen) + Cursor IDE 数据',
        'path': 'C:\\Users\\sw\\AppData\\Local\\Programs',
        'trash_paths': [],
        'size_estimate': '约 1.5 GB',
        'desc': '通义千问 AI 客户端 (1.0 GB) 和 Cursor IDE (470 MB) 的本地数据。',
        'open_note': 'AI 客户端和应用数据。可在各自应用内管理缓存或设置。',
    },
]

a['tiers']['yellow'] = {'label': '需人工判断', 'icon': '🟡', 'items': yellow_items}

# Red items
red_items = [
    {
        'title': 'Microsoft Office',
        'path': 'C:\\Program Files\\Microsoft Office',
        'size_estimate': '约 4.4 GB',
        'desc': 'Microsoft Office 办公套件（Word、Excel、PowerPoint 等）。如不再使用可通过官方方式卸载。',
        'indirect_release': '打开「设置 > 应用 > 已安装的应用」搜索 Microsoft Office 并选择卸载。或使用微软官方卸载支持工具 (support.microsoft.com/office)。',
        'app_paths': ['C:\\Program Files\\Microsoft Office'],
    },
    {
        'title': 'Adobe 软件套件',
        'path': 'C:\\Program Files\\Adobe',
        'size_estimate': '约 4.0 GB',
        'desc': 'Adobe 系列软件（Photoshop 等）。如不再使用需用 Creative Cloud 卸载。',
        'indirect_release': '打开 Creative Cloud 桌面应用 > 应用标签 > 对应 App > 卸载。或打开「设置 > 应用 > 已安装的应用」卸载。',
        'app_paths': ['C:\\Program Files\\Adobe'],
    },
]

a['tiers']['red'] = {'label': '谨慎清理', 'icon': '🔴', 'items': red_items}

# Summary
green_gb = 1.7 + 2.0 + 0.68
yellow_gb = 17.9 + 14.4 + 10.4 + 3.4 + 2.8 + 2.8 + 2.0 + 2.5 + 1.5
red_gb = 4.4 + 4.0

def fmt_gb(gb):
    if gb >= 1:
        return f'约 {gb:.1f} GB'
    else:
        return f'约 {gb*1024:.0f} MB'

a['summary'] = {
    'overview': 'C 盘主要占用来自微信聊天记录（新旧两版合计约 32 GB）和 QQ 拼音输入法的异常词典（10.4 GB）。可一键清理缓存约 ' + fmt_gb(green_gb) + '，需人工判断的数据约 ' + fmt_gb(yellow_gb) + '。',
    'priority': [
        {'icon': '🟡', 'text': '确认微信数据只需保留一个版本。旧版微信聊天记录 (17.9 GB) 与新版 (14.4 GB) 为同一账号，确认迁移后可删除旧版目录。', 'size': '约 17.9 GB'},
        {'icon': '🟡', 'text': 'QQ 拼音输入法词库异常膨胀 (10.4 GB)，在输入法设置中重置词库或卸载重装即可恢复正常。', 'size': '约 10.4 GB'},
        {'icon': '🟢', 'text': '一键清理缓存：酷狗缓存、Edge 缓存、npm 缓存等，合计约 ' + fmt_gb(green_gb), 'size': fmt_gb(green_gb)},
    ],
    'tier_stats': {
        'green': fmt_gb(green_gb),
        'yellow': fmt_gb(yellow_gb),
        'red': fmt_gb(red_gb),
    },
    'long_term': [
        '定期使用 Windows「设置 > 系统 > 存储」的「存储感知」自动清理临时文件和回收站',
        '微信聊天数据持续增长，建议每半年在微信设置中清理不需要的聊天记录',
        '大文件（视频、安装包、归档）可移动到 D 盘（剩余 138 GB）',
        'QQ 拼音输入法可替换为微软自带拼音输入法，减少不必要的磁盘占用',
        '使用 WizTree 或 TreeSize Free 等可视化工具定期检查磁盘空间分布',
    ],
}

with open(ap, 'w', encoding='utf-8') as f:
    json.dump(a, f, indent=2, ensure_ascii=False)

print(f'Green: {fmt_gb(green_gb)} ({len(green_items)} items)')
print(f'Yellow: {fmt_gb(yellow_gb)} ({len(yellow_items)} items)')
print(f'Red: {fmt_gb(red_gb)} ({len(red_items)} items)')
print('Done!')
