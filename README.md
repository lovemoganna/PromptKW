# 项目指南（从安装到运行）

本仓库包含两个部分：
- `workspace/three-gallery`: 基于 Vite 与 Three.js 的交互式画廊
- `Demo/index_v1.html`: 直接可打开的静态单页 Demo

---

## 环境要求
- Node.js ≥ 18（推荐 18.x 或 20.x）
- npm（随 Node 安装）

> 检查版本：
```bash
node -v
npm -v
```

---

## 一、运行 three-gallery（Vite + Three.js）
项目位置：`workspace/three-gallery`

### 安装依赖
```bash
cd workspace/three-gallery
npm install
```

### 本地开发启动
```bash
npm run dev
```
- 终端会输出本地预览地址（默认为 `http://localhost:5173`）
- 打开浏览器访问该地址即可

### 生产构建
```bash
npm run build
```
- 构建产物将输出到 `workspace/three-gallery/dist/`

### 构建结果预览
```bash
npm run preview
```
- 打开预览服务输出的地址进行访问

### 可用脚本（来自 `package.json`）
- `npm run dev`：启动开发服务器（Vite）
- `npm run build`：打包生产版本
- `npm run preview`：本地预览打包结果

---

## 二、运行 Demo 静态页面
文件位置：`Demo/index_v1.html`

### 方式 A：直接打开
- 用浏览器直接打开 `Demo/index_v1.html`（双击或拖入浏览器）

### 方式 B：通过本地静态服务器打开（推荐跨域更友好）
在仓库根目录启动一个简单的静态服务器，例如：

```bash
# 使用 Python 3（任选其一端口）
python3 -m http.server 8080
# 然后访问： http://localhost:8080/Demo/index_v1.html
```

或使用 Node 生态的工具（如已全局安装 `serve`）：
```bash
npx serve .
# 终端输出地址 -> 访问 /Demo/index_v1.html
```

---

## 目录结构（简要）
```
.
├─ Demo/
│  └─ index_v1.html
└─ workspace/
   └─ three-gallery/
      ├─ index.html
      ├─ package.json
      ├─ public/
      └─ src/
```

---

## 常见问题
- 端口占用：
  - 更换 Vite 端口：`npm run dev -- --port 5174`
- Node 版本过低：
  - 升级到 Node 18+，再执行 `npm install`
- 预览访问不到：
  - 确认终端输出的访问地址，检查防火墙或代理设置

---

## 技术栈
- three-gallery：Vite 7 + Three.js
- Demo：原生 HTML（Tailwind 等通过 CDN 引入）