#!/usr/bin/env python3
"""
Storage Analyzer Scan — Windows
只读扫描磁盘占用，输出 JSON 供分析和报告生成。
零第三方依赖，仅用 Python 3 标准库。
"""
import json
import os
import platform
import shutil
import sys
import time
from pathlib import Path

# ── 配置 ──────────────────────────────────────────────
MIN_SIZE_MB = 50          # 小于此值不进入 groups 列表
MAX_DEPTH = 5             # 递归最大深度的软限制
SKIP_DIRS = {
    "Windows", "WinSxS", "System32", "SysWOW64",
    "assembly", "Installer", "Microsoft.NET",
    "ServiceState", "Fonts", "winsxs",
}
# 已知的可再生缓存目录（用于分级参考，扫描时不做判断）
CACHE_KEYWORDS = {
    "cache", "Cache", "CACHE", "temp", "Temp", "TEMP",
    "npm", ".npm", ".yarn", ".pip", ".cache", "pip",
    "DerivedData", ".gradle", ".m2", ".cargo",
    "nuget", "packages", "__pycache__",
}

TITLE_BLOCK = r"""
 _____ _                   _                         _
/  ___| |                 | |                       | |
\ `--.| |_ _ __ ___  __ _| |_ ___    __ _ _ __   __| |___
 `--. \ __| '__/ _ \/ _` | __/ _ \  / _` | '_ \ / _` / __|
/\__/ / |_| | |  __/ (_| | ||  __/ | (_| | | | | (_| \__ \
\____/ \__|_|  \___|\__,_|\__\___|  \__,_|_| |_|\__,_|___/
"""


def log(msg: str):
    print(f"  {msg}", file=sys.stderr)


def get_dir_size(root: str, max_depth: int = MAX_DEPTH) -> tuple:
    """
    用 os.scandir 递归扫描目录大小。
    返回 (size_bytes, denied_paths, error_msg)
    """
    total = 0
    denied = []
    error = None
    try:
        with os.scandir(root) as it:
            for entry in it:
                try:
                    if entry.is_symlink():
                        continue  # 跳过符号链接避免循环
                    if entry.is_file(follow_symlinks=False):
                        total += entry.stat(follow_symlinks=False).st_size
                    elif entry.is_dir(follow_symlinks=False):
                        # 跳过系统保护目录
                        if entry.name in SKIP_DIRS and "Windows" in root:
                            continue
                        sub_total, sub_denied, _ = get_dir_size(entry.path, max_depth - 1)
                        total += sub_total
                        denied.extend(sub_denied)
                except (PermissionError, OSError):
                    denied.append(entry.path)
                except Exception as e:
                    log(f"  扫描异常: {entry.path}: {e}")
    except PermissionError:
        denied.append(root)
    except Exception as e:
        error = str(e)
    return total, denied, error


def scan_windows():
    """Windows 存储扫描主入口"""
    user = Path.home()
    user_str = str(user)
    drive = user.drive  # e.g., "C:"
    log(f"用户目录: {user}")
    log(f"系统盘: {drive}")

    # ── 系统信息 ──
    system_info = {
        "os": "windows",
        "os_ver": platform.version(),
        "os_release": platform.release(),
        "hostname": platform.node(),
        "user": str(user),
        "disk_name": drive.rstrip(":"),
        "disks": [],
    }

    # ── 所有盘符 ──
    if sys.platform == "win32":
        try:
            import string
            import ctypes
            drives = []
            bitmask = ctypes.windll.kernel32.GetLogicalDrives()
            for letter in string.ascii_uppercase:
                if bitmask & 1:
                    path = f"{letter}:\\"
                    drives.append(path)
                bitmask >>= 1
            system_info["disks"] = drives
        except Exception as e:
            log(f"获取盘符失败: {e}")
            system_info["disks"] = [drive + "\\"]

    # ── 磁盘用量 ──
    for d in system_info["disks"]:
        try:
            usage = shutil.disk_usage(d)
            system_info.setdefault("disk_usage", {})
            system_info["disk_usage"][d] = {
                "total": usage.total,
                "used": usage.used,
                "free": usage.free,
            }
        except Exception:
            pass

    # ── 扫描目录列表 ──
    scan_targets = []

    # AppData\Local
    appdata_local = os.environ.get("LOCALAPPDATA", str(user / "AppData" / "Local"))
    scan_targets.append(("appdata_local", appdata_local))

    # AppData\Roaming
    appdata_roaming = os.environ.get("APPDATA", str(user / "AppData" / "Roaming"))
    scan_targets.append(("appdata_roaming", appdata_roaming))

    # Temp
    temp_dir = os.environ.get("TEMP", str(user / "AppData" / "Local" / "Temp"))
    scan_targets.append(("temp", temp_dir))

    # Downloads
    downloads = str(user / "Downloads")
    scan_targets.append(("downloads", downloads))

    # Desktop
    desktop = str(user / "Desktop")
    scan_targets.append(("desktop", desktop))

    # Documents
    documents = str(user / "Documents")
    scan_targets.append(("documents", documents))

    # Pictures
    pictures = str(user / "Pictures")
    scan_targets.append(("pictures", pictures))

    # Videos
    videos = str(user / "Videos")
    scan_targets.append(("videos", videos))

    # Music
    music = str(user / "Music")
    scan_targets.append(("music", music))

    # User profile 顶层隐藏目录（.cache, .npm 等）
    scan_targets.append(("user_hidden", str(user)))

    # Program Files
    program_files = os.environ.get("ProgramFiles", "C:\\Program Files")
    scan_targets.append(("program_files", program_files))

    program_files_x86 = os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)")
    scan_targets.append(("program_files_x86", program_files_x86))

    # ProgramData
    program_data = os.environ.get("ProgramData", "C:\\ProgramData")
    scan_targets.append(("program_data", program_data))

    # 开发缓存
    dev_caches = []
    for d in [".npm", ".yarn", ".cache", ".pip", ".rustup", ".cargo",
              ".gradle", ".m2", ".nuget"]:
        p = user / d
        if p.exists():
            dev_caches.append(str(p))
    # pip cache in AppData
    pip_cache = Path(appdata_local) / "pip" / "Cache"
    if pip_cache.exists():
        dev_caches.append(str(pip_cache))
    scan_targets.append(("dev_caches", dev_caches))

    # ── 执行扫描 ──
    groups = []
    total_scanned = 0
    total_denied = 0

    for name, path in scan_targets:
        if isinstance(path, list):
            # 多目录组（如 dev_caches）
            group_total = 0
            group_denied = []
            group_children = []
            for subpath in path:
                sz, den, err = get_dir_size(subpath)
                group_total += sz
                group_denied.extend(den)
                group_children.append({
                    "path": subpath,
                    "size": sz,
                    "denied": den if den else None,
                    "error": err,
                })
                total_scanned += 1
            groups.append({
                "name": name,
                "path": str(path),
                "size": group_total,
                "children": group_children,
                "denied": group_denied if group_denied else None,
            })
            total_denied += len(group_denied)
        else:
            sz, den, err = get_dir_size(path)
            groups.append({
                "name": name,
                "path": path,
                "size": sz,
                "denied": den if den else None,
                "error": err,
            })
            total_scanned += 1
            total_denied += len(den)
            if sz < MIN_SIZE_MB * 1024 * 1024:
                log(f"  {name}: {sz/1024/1024:.1f} MB (跳过，小于 {MIN_SIZE_MB} MB)")
            else:
                log(f"  {name}: {sz/1024/1024:.1f} MB")

    # ── 按大小降序，过滤 50MB ──
    groups.sort(key=lambda g: g["size"], reverse=True)
    groups = [g for g in groups if g["size"] >= MIN_SIZE_MB * 1024 * 1024]

    log(f"\n扫描完成! 扫描 {total_scanned} 组，{total_denied} 个无权限目录")
    log(f"有效组（≥{MIN_SIZE_MB}MB）: {len(groups)}")

    return {
        "system": system_info,
        "groups": groups,
        "scan_time": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "scan_version": "1.0",
    }


def main():
    print(TITLE_BLOCK, file=sys.stderr)
    log("Storage Analyzer — Windows 只读存储扫描")
    log("=" * 50)

    data = scan_windows()
    json.dump(data, sys.stdout, indent=2, ensure_ascii=False)
    log("\n扫描数据已输出到 stdout")


if __name__ == "__main__":
    main()
