# 艳火 · Pyrojewel

> 写在艳火里的一份祝福

有些话，说不出口，便写成了代码。

如果你也曾想为重要的人做点什么不一样的东西，希望这个项目能给你一些灵感。

## 📱 在线体验

推荐使用微信扫码访问：

<img src="https://img.assets.five-plus-one.com/img/2026/09/c27c9f3bf85ddb40c740d4bd3fed6a80.png" alt="微信扫码体验" width="125">

## ✨ 特性

- **7 页个性化祝福** - 每页独特的诗意文字与精美配图
- **音乐实时同步** - 搭配张悬《艳火》，LRC 歌词逐行展示
- **汉字书写动画** - 使用 HanziWriter 呈现笔顺动画
- **翻书式开场** - 3D 变换的封面开启体验
- **宇宙序章** - 3D 空间中漂浮的祝福词语
- **触摸 & 滚动导航** - 滑动或滚轮切换页面
- **电影级转场** - 淡入淡出、模糊、缩放等页面切换效果
- **移动端优先** - 针对手机屏幕优化，支持 iOS 安全区域

## 🛠️ 技术栈

- **React 19.2** + TypeScript
- **Vite 8** - 极速构建工具
- **Tailwind CSS 4.2** - 实用优先的样式方案
- **HanziWriter 3.7** - 汉字笔顺动画库
- **Cloudflare** - 全球 CDN 部署

## 📦 快速开始

### 环境要求

- Node.js >= 22.13.0
- npm 或 pnpm

### 安装

```bash
# 克隆仓库
git clone https://github.com/five-plus-one/Pyrojewel.git
cd Pyrojewel

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器将运行在 `http://127.0.0.1:3000`

### 构建生产版本

```bash
npm run build    # 构建到 dist/
npm run preview  # 预览生产构建
```

## 📁 项目结构

```
blessingBo/
├── app/
│   ├── page.tsx          # 主祝福体验组件
│   ├── layout.tsx        # 根布局
│   └── globals.css       # 自定义 CSS 与动画
├── src/
│   └── main.tsx          # Vite 入口
├── components/ui/        # shadcn/ui 组件库
├── hooks/                # 自定义 Hooks
├── lib/                  # 工具函数
├── public/               # 静态资源
├── vite.config.mjs       # Vite 配置
└── index.html            # HTML 入口
```

## 🎭 交互流程

1. **封面** - 点击开启体验
2. **宇宙序章** - 13 秒沉浸式开场动画
3. **祝福页面** - 7 页音乐同步的祝福
4. **结尾** - 汉字书写动画与最终祝福
5. **结束选项** - 重播或再次聆听

## 🎨 设计细节

- 深色主题搭配红色点缀 (#c64038)
- 纸张质感背景 (#d8d1c6)
- 毛玻璃与模糊效果
- 20+ CSS 关键帧动画
- 6 张精心挑选的配图

## 📝 代码规范

```bash
npm run lint     # 使用 oxlint 检查代码
npm run format   # 使用 oxfmt 格式化代码
```

## 🚀 部署

项目已配置 Cloudflare 部署，使用 Wrangler：

```bash
# 部署到 Cloudflare Pages
npm run deploy
```

## 📜 许可证

MIT License

## 🙏 致谢

- [HanziWriter](https://hanziwriter.org/) - 汉字笔顺动画
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- 张悬《艳火》- 音乐与灵感来源

---

*愿你拥有自己的艳火，也永远有梦有快乐*
