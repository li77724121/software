> 说明：本仓库是私有工具链的发布/下载页模板，仅承载软件下载，不含任何个人战略/定位信息。

# LEO 软件 · 软件发布与下载

静态站，零成本托管（GitHub Pages）。

## 结构

```
index.html          页面骨架
style.css           样式（自适应浅色 / 深色）
app.js              读取 data/products.json 渲染 + 实时同步 GitHub Release
data/products.json  ← 唯一需要维护的文件：所有软件都在这里
.nojekyll           告诉 GitHub Pages 不要用 Jekyll
```

## 新增一款软件 / 发新版本

在 `data/products.json` 的 `products` 数组里加一条（字段见现有条目），push 即可。
发新版本只需在对应仓库上传新的 **Release**——页面会自动从 GitHub API 读取最新版本、
包大小与累计下载量，**不用改这个文件**。

## 本地预览

```bash
cd software-site && python3 -m http.server 8080
# 打开 http://localhost:8080
```
