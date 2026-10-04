# LEO 软件 · 软件发布中心

一个人 + AI 的软件工作室的**软件发布与下载载体**。静态站，零成本托管（GitHub Pages）。

## 结构

```
index.html          页面骨架
style.css           样式（自适应浅色 / 深色）
app.js              读取 data/products.json 渲染 + 实时同步 GitHub Release
data/products.json  ← 唯一需要维护的文件：所有软件都在这里
.nojekyll           告诉 GitHub Pages 不要用 Jekyll
```

## 新增一款软件 / 发新版本

**新增软件**：在 `data/products.json` 的 `products` 数组里加一条，例如：

```json
{
  "id": "my-tool",
  "name": "MyTool",
  "emoji": "🛠️",
  "category": "下载",
  "tagline": "一句话定位",
  "summary": "两三句说明。",
  "platforms": ["macOS"],
  "license": "免费",
  "repo": "li77724121/my-tool",
  "version": "1.0.0",
  "releaseUrl": "https://github.com/li77724121/my-tool/releases/latest",
  "assets": [{ "label": "macOS · Apple 芯片", "file": "MyTool-1.0.0-macOS-arm64.dmg", "size": "20 MB" }],
  "features": ["…", "…"],
  "install": ["下载", "拖入应用程序", "打开"]
}
```

**发新版本**：只需在对应 GitHub 仓库上传新的 **Release**（附上 .dmg 等安装包）。
页面会自动从 GitHub API 读取最新版本号、安装包大小和累计下载量——**不用改这个文件**。

> 注：`assets[].file` 只是「GitHub 还没返回时」的兜底链接（走 `releases/latest/download/<文件名>`）。
> 若每版文件名带版本号，实际下载按钮由实时 API 提供，永远指向最新包。

## 本地预览

```bash
cd software-site && python3 -m http.server 8080
# 打开 http://localhost:8080
```
（必须用 http server，直接双击 index.html 会因 fetch 跨域而空白。）
