#!/usr/bin/env python3
"""
Storage Analyzer — Web Server (Windows)
提供交互式 HTML 报告，带一键操作 API（回收站/删除/打开）。
零第三方依赖。
"""
import ctypes
import http.server
import json
import os
import secrets
import subprocess
import sys
import time
import urllib.parse
from pathlib import Path


HOST = "127.0.0.1"
TOKEN = secrets.token_urlsafe(16)
USER_HOME = str(Path.home())


class AccessControl:
    """从 analysis JSON 加载路径白名单并执行校验。"""
    def __init__(self, analysis_path: str):
        with open(analysis_path, encoding="utf-8") as f:
            analysis = json.load(f)
        self.analysis = analysis

        self.trash_paths: set = set()
        self.delete_paths: set = set()
        self.open_paths: set = set()

        tiers = analysis.get("tiers", {})
        # 🟢
        for item in tiers.get("green", {}).get("items", []):
            for tp in item.get("trash_paths", []):
                r = os.path.realpath(tp)
                self.trash_paths.add(r)
                self.delete_paths.add(r)
            if item.get("path"):
                self.open_paths.add(os.path.realpath(item["path"]))
        # 🟡
        for item in tiers.get("yellow", {}).get("items", []):
            for tp in item.get("trash_paths", []):
                self.trash_paths.add(os.path.realpath(tp))
            if item.get("path"):
                self.open_paths.add(os.path.realpath(item["path"]))
        # 🔴
        for item in tiers.get("red", {}).get("items", []):
            for ap in item.get("app_paths", []):
                self.open_paths.add(os.path.realpath(ap))

    def resolve(self, path: str) -> str:
        p = os.path.realpath(path)
        allowed_prefixes = [USER_HOME, "C:\\Program Files", "C:\\ProgramData"]
        if not any(p.startswith(pr) for pr in allowed_prefixes):
            raise PermissionError(f"路径不在允许范围: {p}")
        if not os.path.exists(p):
            raise FileNotFoundError(f"路径不存在: {p}")
        return p

    def can_trash(self, path: str) -> str:
        r = self.resolve(path)
        if r not in self.trash_paths:
            raise PermissionError(f"不允许移回收站: {r}")
        return r

    def can_delete(self, path: str) -> str:
        r = self.resolve(path)
        if r not in self.delete_paths:
            raise PermissionError(f"不允许直接删除: {r}")
        return r

    def can_open(self, path: str) -> str:
        r = self.resolve(path)
        if r not in self.open_paths and r not in self.trash_paths:
            raise PermissionError(f"不允许打开: {r}")
        return r


# ── Windows API ──

def trash_windows(path: str) -> bool:
    """使用 SHFileOperationW 移入回收站"""
    class SHFILEOPSTRUCTW(ctypes.Structure):
        _fields_ = [
            ("hwnd", ctypes.c_void_p),
            ("wFunc", ctypes.c_uint),
            ("pFrom", ctypes.c_wchar_p),
            ("pTo", ctypes.c_wchar_p),
            ("fFlags", ctypes.c_uint),
            ("fAnyOperationsAborted", ctypes.c_bool),
            ("hNameMappings", ctypes.c_void_p),
            ("lpszProgressTitle", ctypes.c_wchar_p),
        ]
    FO_DELETE = 3
    FOF_ALLOWUNDO = 0x40 | 0x10  # recycle bin + no confirm
    try:
        fn = ctypes.windll.shell32.SHFileOperationW
        op = SHFILEOPSTRUCTW(
            hwnd=None, wFunc=FO_DELETE, pFrom=path + "\0",
            pTo=None, fFlags=FOF_ALLOWUNDO,
            fAnyOperationsAborted=False, hNameMappings=None, lpszProgressTitle=None,
        )
        return fn(ctypes.byref(op)) == 0
    except Exception as e:
        print(f"  Trash error: {e}", file=sys.stderr)
        return False


def delete_permanent(path: str) -> bool:
    try:
        if os.path.isdir(path):
            import shutil
            shutil.rmtree(path, ignore_errors=False)
        else:
            os.remove(path)
        return not os.path.exists(path)
    except Exception as e:
        print(f"  Delete error: {e}", file=sys.stderr)
        return False


def open_explorer(path: str) -> bool:
    try:
        subprocess.Popen(["explorer", "/select,", path])
        return True
    except Exception as e:
        print(f"  Open error: {e}", file=sys.stderr)
        return False


# ── HTTP Handler ──

class Handler(http.server.BaseHTTPRequestHandler):
    ac: AccessControl = None
    report_html: str = ""

    def _json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _check(self):
        host = self.headers.get("Host", "")
        if not (host.startswith("127.0.0.1:") or host.startswith("localhost:")):
            self._json({"ok": False, "error": "Invalid host"}, 403)
            return False
        q = urllib.parse.urlparse(self.path).query
        if urllib.parse.parse_qs(q).get("token", [None])[0] != TOKEN:
            self._json({"ok": False, "error": "Invalid token"}, 403)
            return False
        return True

    def do_GET(self):
        p = urllib.parse.urlparse(self.path).path
        if p == "/":
            if not self._check():
                return
            # Inject token into HTML
            html = self.report_html.replace(
                "/*__TOKEN__*/",
                f"<script>window.TOKEN = '{TOKEN}';</script>"
            )
            body = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif p == "/health":
            self._json({"ok": True})
        else:
            self._json({"ok": False, "error": "Not found"}, 404)

    def do_POST(self):
        if not self._check():
            return
        p = urllib.parse.urlparse(self.path).path
        clen = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(clen) if clen else b"{}"
        payload = json.loads(body) if body else {}
        path = payload.get("path", "")

        try:
            if p == "/api/trash":
                r = self.ac.can_trash(path)
                print(f"  Trash: {r}", file=sys.stderr)
                ok = trash_windows(r)
                self._json({"ok": ok, "error": None if ok else "操作失败"})
            elif p == "/api/delete":
                r = self.ac.can_delete(path)
                print(f"  Delete: {r}", file=sys.stderr)
                ok = delete_permanent(r)
                self._json({"ok": ok, "error": None if ok else "操作失败"})
            elif p == "/api/open":
                r = self.ac.can_open(path)
                print(f"  Open: {r}", file=sys.stderr)
                ok = open_explorer(r)
                self._json({"ok": ok, "error": None if ok else "操作失败"})
            else:
                self._json({"ok": False, "error": "Unknown endpoint"}, 404)
        except (PermissionError, FileNotFoundError) as e:
            self._json({"ok": False, "error": str(e)}, 403)
        except Exception as e:
            self._json({"ok": False, "error": str(e)}, 500)

    def log_message(self, fmt, *args):
        print(f"  [{time.strftime('%H:%M:%S')}] {args[0]} {args[1]}", file=sys.stderr)


def find_port():
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, 0))
        return s.getsockname()[1]


def main():
    if len(sys.argv) < 2:
        print(f"用法: python server.py <analysis.json> [--html <report.html>]", file=sys.stderr)
        sys.exit(1)

    analysis_path = os.path.realpath(sys.argv[1])
    report_html_path = None
    if "--html" in sys.argv:
        idx = sys.argv.index("--html")
        report_html_path = os.path.realpath(sys.argv[idx + 1])

    print(f"  Analysis: {analysis_path}", file=sys.stderr)
    if report_html_path:
        print(f"  HTML:     {report_html_path}", file=sys.stderr)

    ac = AccessControl(analysis_path)

    if report_html_path and os.path.exists(report_html_path):
        with open(report_html_path, encoding="utf-8") as f:
            report_html = f.read()
    else:
        # Try to find it at default location
        default_html = os.path.join(os.path.dirname(analysis_path), "storage-report.html")
        if os.path.exists(default_html):
            with open(default_html, encoding="utf-8") as f:
                report_html = f.read()
        else:
            print("Error: 未找到报告 HTML，请先用 --html 指定", file=sys.stderr)
            sys.exit(1)

    Handler.ac = ac
    Handler.report_html = report_html

    port = find_port()
    url = f"http://{HOST}:{port}/?token={TOKEN}"

    server = http.server.HTTPServer((HOST, port), Handler)

    print(f"\n{'='*55}", file=sys.stderr)
    print(f"  ✅ Storage Analyzer 服务已启动", file=sys.stderr)
    print(f"  🌐 打开报告: {url}", file=sys.stderr)
    print(f"  🛑 按 Ctrl+C 停止", file=sys.stderr)
    print(f"{'='*55}\n", file=sys.stderr)

    try:
        subprocess.Popen(["cmd", "/c", "start", url])
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 已停止", file=sys.stderr)
        server.server_close()


if __name__ == "__main__":
    main()
