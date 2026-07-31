# Windows 存储布局参考

## 系统目录结构

### %USERPROFILE% (C:\Users\<用户名>)
- `Desktop` — 桌面文件（🟡 用户文件）
- `Documents` — 文档（🟡 用户文件）
- `Downloads` — 下载（🟡 需人工判断，常积压）
- `Pictures` — 图片（🟡 媒体内容）
- `Videos` — 视频（🟡 媒体内容）
- `Music` — 音乐（🟡 媒体内容）
- `AppData` — 应用数据（隐藏）
  - `Local` — 本地应用数据，不可漫游
    - `Temp` — 🟢 临时文件，可安全清理
    - `Microsoft\Windows\INetCache` — 🟢 IE/Edge 缓存
    - `Microsoft\Edge\User Data\Default\Cache` — 🟢 Edge 缓存
    - `Google\Chrome\User Data\Default\Cache` — 🟢 Chrome 缓存
    - `Packages\*` — UWP 应用包数据
  - `LocalLow` — 低级访问应用数据
  - `Roaming` — 可漫游应用数据（设置、配置）

### %TEMP% / %TMP%
- `C:\Users\<用户名>\AppData\Local\Temp` — 🟢 临时文件
- `C:\Windows\Temp` — 🟢 系统临时文件（需管理员）

### Program Files
- `C:\Program Files` — 64-bit 应用（🔴 不建议手删，应使用官方卸载）
- `C:\Program Files (x86)` — 32-bit 应用（🔴 不建议手删）
- `C:\ProgramData` — 共享应用数据

### Windows 系统目录
- `C:\Windows` — 操作系统文件（不清理）
  - `C:\Windows\Temp` — 🟢 临时文件
  - `C:\Windows\SoftwareDistribution\Download` — 🟢 Windows Update 缓存
  - `C:\Windows\Installer` — 谨慎（含卸载所需 .msi）

### 开发环境缓存（🟢 可再生）
- `%USERPROFILE%\.npm` — npm 缓存
- `%USERPROFILE%\.yarn` — Yarn 缓存
- `%USERPROFILE%\.pip` — pip 缓存
- `%USERPROFILE%\.cache` — 通用缓存（uv、pre-commit 等）
- `%USERPROFILE%\.rustup` — Rust 工具链缓存
- `%USERPROFILE%\.cargo\registry` — Cargo 包缓存
- `%USERPROFILE%\.nuget\packages` — NuGet 缓存
- `%USERPROFILE%\.gradle\caches` — Gradle 缓存
- `%USERPROFILE%\AppData\Local\conda` — Conda 缓存
- `AppData\Local\pip\Cache` — pip 缓存（Windows）

### 虚拟机与镜像（🔴 大文件）
- `%USERPROFILE%\VirtualBox VMs` — VirtualBox 虚拟机
- `%USERPROFILE%\Documents\Hyper-V` — Hyper-V 虚拟机
- `.vmdk`, `.vhdx`, `.iso`, `.dmg` 大文件

### 微信 / 企业微信
- `%USERPROFILE%\Documents\WeChat Files` — 🟡 微信聊天记录+文件
  - 含图片、视频、文档等用户数据
- `%USERPROFILE%\Documents\WXWork` — 🟡 企业微信数据

### 回收站
- `C:\$Recycle.Bin` — 🔴 每个盘符有隐藏回收站，不应该接操作

## 分级指南

| 级别 | 典型内容 | 处理方式 |
|------|---------|---------|
| 🟢 可自动清理 | 缓存、临时文件、可再生下载缓存 | 直接删除 / 移回收站 |
| 🟡 需人工判断 | 下载积压、微信文件、项目 node_modules | 打开位置审查后决定 |
| 🔴 谨慎清理 | 应用本体、系统文件、虚拟机 | 用官方卸载 / 工具迁移 |
