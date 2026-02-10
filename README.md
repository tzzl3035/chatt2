# chatt2

一个基于 Vue 3 + TypeScript + Vite 的实时聊天应用程序，使用 Supabase 提供后端服务（数据库、Storage、实时订阅）。

## 功能特性

### 核心功能

- **实时聊天** - 通过 Supabase Realtime 实现实时消息推送
- **聊天室管理** - 创建和管理多个聊天室
- **用户认证** - 自定义认证系统，支持用户名注册和登录
- **文件上传** - 支持图片、视频、音频、文档等多种文件类型
- **在线用户** - 实时显示聊天室内的在线用户列表
- **消息富文本** - 支持 Markdown 和 LaTeX 数学公式渲染

### 消息系统

- **消息气泡** - 他人消息和自己的消息使用不同的气泡样式
- **文件预览** - 图片、视频、音频可直接在聊天中预览
- **图片放大** - 点击图片可放大查看
- **拖放上传** - 支持拖放文件到聊天输入框
- **时间显示** - 完整的年月日时分格式显示

### 技术亮点

- **Vue 3 Composition API** - 使用 `<script setup>` 语法
- **TypeScript** - 严格模式，类型安全
- **Pinia** - 状态管理
- **自定义认证** - 使用 Web Crypto API 进行密码哈希
- **响应式设计** - 适配不同屏幕尺寸

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3.5.27 |
| 构建工具 | Vite 7.3.1 |
| 语言 | TypeScript 5.9.3 |
| 路由 | Vue Router 5.0.1 |
| 状态管理 | Pinia 3.0.4 |
| 后端服务 | Supabase 2.95.3 |
| Markdown 渲染 | marked 17.0.1 |
| LaTeX 渲染 | katex 0.16.28 |
| 表单验证 | Zod 4.3.6 |
| 时间处理 | dayjs 1.11.19 |
| 测试 | Vitest 4.0.18 + Cypress 15.9.0 + Playwright 1.58.2 |
| 代码规范 | ESLint 9.39.2 + Oxlint 1.42.0 + Prettier 3.8.1 |

## 快速开始

### 环境要求

- Node.js: `^20.19.0 || >=22.12.0`
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 文件上传配置
VITE_SUPABASE_STORAGE_BUCKET=chat-attachments
VITE_MAX_FILE_SIZE=52428800  # 50MB
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建（含类型检查） |
| `npm run build-only` | 仅构建（不含类型检查） |
| `npm run preview` | 预览生产构建 |
| `npm run test:unit` | 运行单元测试 |
| `npm run test:e2e:dev` | 运行 E2E 测试（开发模式） |
| `npm run test:e2e` | 运行 E2E 测试（生产模式） |
| `npm run lint` | 代码检查和修复 |
| `npm run format` | 代码格式化 |
| `npm run type-check` | 类型检查 |

## 项目结构

```
src/
├── api/              # API 接口层
├── assets/           # 静态资源
├── components/       # 可复用组件
├── composables/      # 组合式函数
├── layouts/          # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── views/            # 页面级组件
├── App.vue           # 根组件
└── main.ts           # 应用入口
```

## 开发指南

### 推荐开发环境

- **IDE**: VS Code
- **插件**:
  - Vue (Official)（禁用 Vetur）
  - TypeScript Vue Plugin (Volar)
  - ESLint
  - Prettier

### 浏览器扩展

- **Vue.js devtools** (Chrome/Firefox)
  - 开启 Custom Object Formatter 以获得更好的调试体验

### 组件开发规范

- 使用 `<script setup>` 语法和 TypeScript
- 组件文件使用 PascalCase 命名（如 `ChatInput.vue`）
- 优先使用 Composition API

### 状态管理

- 使用 Setup Store 语法（函数式风格）
- Store 文件位于 `src/stores/` 目录

## 路由结构

| 路径 | 组件 | 需要认证 |
|------|------|----------|
| `/` | HomeView.vue | 否 |
| `/login` | LoginView.vue | 否 |
| `/dashboard` | DashboardView.vue | 是 |
| `/room/:id` | ChatRoomView.vue | 是 |
| `/about` | AboutView.vue | 否 |

## 部署

### 部署到 Cloudflare Pages

1. 构建项目: `npm run build`
2. 连接 GitHub 仓库到 Cloudflare Pages
3. 配置构建设置:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 配置环境变量（见上文）
5. 每次推送到 main 分支时自动构建和部署

## Supabase Edge Functions

项目包含 Edge Functions 支持，位于 `supabase/functions/` 目录：

```bash
# 开发模式下运行 Edge Functions
supabase functions serve

# 部署 Edge Functions
supabase functions deploy register
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 相关资源

- [AGENTS.md](./AGENTS.md) - 详细项目文档
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Supabase 官方文档](https://supabase.com/docs)
- [TypeScript 官方文档](https://www.typescriptlang.org/)