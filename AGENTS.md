# chatt2 项目说明

## 项目概述

chatt2 是一个基于 Vue 3 + TypeScript + Vite 的实时聊天应用程序。项目采用 Composition API 编写风格，集成了完整的开发工具链，包括路由管理、状态管理、用户认证、实时消息传递等功能。后端使用 Supabase 提供数据库、身份验证和实时订阅服务。

### 核心技术栈

- **框架**: Vue 3.5.27 (Composition API + `<script setup>`)
- **构建工具**: Vite 7.3.1
- **语言**: TypeScript 5.9.3
- **路由**: Vue Router 5.0.1
- **状态管理**: Pinia 3.0.4
- **后端服务**: Supabase 2.95.3 (认证、数据库、实时订阅)
- **日期处理**: dayjs 1.11.19
- **Markdown 渲染**: marked 17.0.1
- **LaTeX 渲染**: katex 0.16.28
- **表单验证**: Zod 4.3.6
- **通知提示**: vue-toastification 2.0.0-rc.5
- **测试**: Vitest 4.0.18 (单元测试) + Cypress 15.9.0 (E2E 测试)
- **代码规范**: ESLint 9.39.2 + Oxlint 1.42.0 + Prettier 3.8.1
- **开发工具**: vite-plugin-vue-devtools 8.0.5

### 项目架构

```
src/
├── api/              # API 接口层
│   ├── auth.ts       # 认证相关 API
│   ├── email.ts      # 邮箱验证 API
│   └── supabase.ts   # Supabase 客户端配置
├── assets/           # 静态资源（图片、CSS）
├── components/       # 可复用组件
│   ├── __tests__/    # 组件单元测试
│   ├── icons/        # 图标组件
│   ├── ChatInput.vue     # 聊天输入组件
│   ├── Header.vue       # 头部组件
│   ├── HelloWorld.vue    # 示例组件
│   ├── MessageItem.vue  # 消息项组件
│   ├── RoomCard.vue     # 聊天室卡片组件
│   ├── RoomList.vue     # 聊天室列表组件
│   ├── TheWelcome.vue   # 欢迎组件
│   └── WelcomeItem.vue  # 欢迎项组件
├── composables/      # 组合式函数
│   ├── useAuth.ts    # 认证逻辑
│   ├── useChat.ts    # 聊天逻辑
│   └── useRealtime.ts # 实时订阅逻辑
├── layouts/          # 布局组件
│   ├── AuthLayout.vue    # 认证页面布局
│   └── DefaultLayout.vue # 默认页面布局
├── router/           # 路由配置
│   └── index.ts      # 路由定义和导航守卫
├── stores/           # Pinia 状态管理
│   ├── auth.ts       # 认证状态
│   ├── chat.ts       # 聊天状态
│   ├── theme.ts      # 主题状态（仅支持浅色主题）
│   └── counter.ts    # 计数器示例
├── types/            # TypeScript 类型定义
│   ├── auth.ts       # 认证相关类型
│   ├── chat.ts       # 聊天相关类型
│   ├── supabase-generated.ts # Supabase 生成类型
│   └── supabase.ts   # Supabase 类型
├── utils/            # 工具函数
│   ├── email.ts      # 邮箱工具
│   ├── helpers.ts    # 辅助函数
│   ├── markdown.ts   # Markdown 和 LaTeX 渲染工具
│   └── validation.ts # 验证函数
├── views/            # 页面级组件
│   ├── HomeView.vue      # 首页
│   ├── LoginView.vue     # 登录/注册页
│   ├── DashboardView.vue # 仪表盘
│   ├── ChatRoomView.vue  # 聊天室页面
│   └── AboutView.vue     # 关于页
├── App.vue           # 根组件
└── main.ts           # 应用入口
```

### Node 版本要求

- Node.js: `^20.19.0 || >=22.12.0`

## 环境配置

项目需要配置 Supabase 环境变量。在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 构建和运行

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
```

启动 Vite 开发服务器，默认端口 5173，支持热模块替换（HMR）和 Vue DevTools。

### 生产构建

```bash
npm run build
```

此命令会：
1. 执行类型检查 (`vue-tsc --build`)
2. 构建生产版本 (`vite build`)

### 预览生产构建

```bash
npm run preview
```

在本地预览生产构建版本，默认端口 4173。

## 测试

### 单元测试 (Vitest)

```bash
npm run test:unit
```

运行 Vitest 单元测试，测试文件位于 `src/**/__tests__/*` 目录。

### 端到端测试 (Cypress)

开发模式（推荐日常使用）：
```bash
npm run test:e2e:dev
```

针对 Vite 开发服务器运行 E2E 测试，速度更快。

生产模式（部署前验证）：
```bash
npm run build
npm run test:e2e
```

针对生产构建版本运行 E2E 测试。

## 代码规范

### 代码检查和修复

```bash
npm run lint
```

此命令会依次执行：
1. Oxlint 检查并自动修复 (`oxlint . --fix`)
2. ESLint 检查并自动修复 (`eslint . --fix --cache`)

### 代码格式化

```bash
npm run format
```

使用 Prettier 格式化 `src/` 目录下的代码。

### 类型检查

```bash
npm run type-check
```

使用 `vue-tsc` 进行类型检查。

## 应用功能

### 认证系统

- **邮箱注册**: 用户输入邮箱、用户名和密码完成注册，Supabase 自动发送邮箱验证链接
- **邮箱登录**: 使用邮箱和密码登录
- **自动会话管理**: 使用 localStorage 持久化会话，支持自动刷新令牌
- **用户配置文件**: 存储用户名等扩展信息
- **导航守卫**: 基于认证状态的路由保护

### 聊天系统

- **聊天室管理**: 创建、查看聊天室列表
- **实时消息**: 通过 Supabase Realtime 实现实时消息推送
- **消息历史**: 加载和显示历史消息（最多 100 条）
- **用户信息关联**: 消息关联发送者的用户名
- **在线用户管理**: 实时显示聊天室内的在线用户列表，支持 Presence 事件（sync、join、leave）

### 消息渲染系统

- **Markdown 支持**: 使用 marked 库渲染标准 Markdown 语法（标题、列表、代码块、引用等）
- **LaTeX 数学公式**: 使用 katex 库渲染数学公式
  - 行内公式: `$E=mc^2$`
  - 块级公式: `$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$`
- **渲染工具**: `src/utils/markdown.ts` 提供统一的渲染函数 `renderMarkdown()`

### 主题系统

- **浅色主题**: 当前仅支持浅色主题模式
- **主题初始化**: 路由切换时自动初始化并应用浅色主题
- **状态管理**: 使用 Pinia Store (useThemeStore) 管理主题状态
- **主题切换**: 主题切换功能已禁用，默认使用浅色主题

### 路由结构

| 路径 | 名称 | 组件 | 需要认证 | 布局 |
|------|------|------|----------|------|
| `/` | home | HomeView.vue | 否 | none |
| `/login` | login | LoginView.vue | 否 | auth |
| `/dashboard` | dashboard | DashboardView.vue | 是 | default |
| `/room/:id` | chat-room | ChatRoomView.vue | 是 | default |
| `/about` | about | AboutView.vue | 否 | none |
| `/:pathMatch(.*)*` | not-found | - | - | 重定向到首页 |

**导航守卫行为**:
- 未认证用户访问受保护路由时重定向到登录页，并保存目标路径
- 已认证用户访问登录页或首页时重定向到仪表盘
- 自动初始化认证状态
- 每次路由变更时自动初始化主题

## 开发约定

### 组件开发

- 使用 `<script setup>` 语法和 TypeScript
- 组件文件使用 PascalCase 命名（如 `ChatInput.vue`）
- 组合式 API 优先，使用 Composition API 的 `ref`、`computed` 等

### 状态管理 (Pinia)

- 使用 Setup Store 语法（函数式风格）
- Store 文件位于 `src/stores/` 目录
- 认证相关状态使用 `useAuthStore`
- 聊天相关状态使用 `useChatStore`
- 主题相关状态使用 `useThemeStore`

### API 层

- 所有 API 调用集中在 `src/api/` 目录
- Supabase 客户端配置在 `src/api/supabase.ts`
- 遵循 RESTful 和 Supabase 最佳实践

### 组合式函数 (Composables)

- 可复用的组合式逻辑放在 `src/composables/` 目录
- `useAuth`: 封装认证相关逻辑
- `useChat`: 封装聊天相关逻辑
- `useRealtime`: 封装实时订阅逻辑

### 主题实现

- 使用 Pinia Store (useThemeStore) 管理主题状态
- 使用 CSS 变量定义主题颜色
- 通过 `document.documentElement.classList` 添加/移除 dark 类来切换主题
- 当前仅支持浅色主题，toggleTheme 功能已禁用

### 路径别名

- `@` 指向 `src` 目录
- 在导入时使用 `@/components/...` 等别名

### 类型定义

- 类型定义集中在 `src/types/` 目录
- 使用 TypeScript 严格模式
- Supabase 相关类型自动生成

### 配置文件说明

- `.env`: 环境变量配置（Supabase 配置）
- `.editorconfig`: 编辑器配置（统一代码风格：2空格缩进、LF换行、最大100字符）
- `.oxlintrc.json`: Oxlint 配置（插件：eslint、typescript、unicorn、oxc、vue；浏览器环境支持；正确性问题设为错误级别）
- `.prettierrc.json`: Prettier 配置（无分号、单引号、100字符换行）
- `eslint.config.ts`: ESLint 扁平配置（支持 Vue、TypeScript、Vitest、Cypress、Oxlint）
- `vite.config.ts`: Vite 构建配置，包含 Vue、JSX 和 DevTools 插件，开发端口 5173
- `tsconfig.json`: TypeScript 根配置（引用 app、node、vitest 配置）
- `tsconfig.app.json`: 应用代码的 TypeScript 配置（@/* 路径别名）
- `tsconfig.node.json`: 构建脚本的 TypeScript 配置（基于 @tsconfig/node24）
- `tsconfig.vitest.json`: Vitest 测试的 TypeScript 配置
- `vitest.config.ts`: Vitest 测试框架配置（jsdom 环境）
- `cypress.config.ts`: Cypress E2E 测试配置（baseUrl: http://localhost:4173）

## 推荐开发环境

- **IDE**: VS Code
- **插件**:
  - Vue (Official)（禁用 Vetur）
  - TypeScript Vue Plugin (Volar)
  - ESLint
  - Prettier
- **浏览器扩展**:
  - Vue.js devtools（Chrome/Firefox）
  - 开启 Custom Object Formatter 以获得更好的调试体验

## 关键命令速查

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run test:unit` | 运行单元测试 |
| `npm run test:e2e:dev` | 运行 E2E 测试（开发模式） |
| `npm run test:e2e` | 运行 E2E 测试（生产模式） |
| `npm run lint` | 代码检查和修复 |
| `npm run format` | 代码格式化 |
| `npm run type-check` | 类型检查 |