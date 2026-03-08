# AI 心理健康平台前端（ai-vue）

一个基于 **Vue 3 + Vite + Element Plus** 的心理健康平台前端项目，包含：

- 用户端：主页、AI 咨询、情绪日记、知识库、文章详情。
- 管理端：数据分析、知识文章管理、咨询记录管理、情绪日志管理。

---

## 1. 项目简介

本项目提供了完整的双端路由能力（前台用户端 + 后台管理端），并通过统一的 Axios 请求封装与后端 API 对接。核心功能围绕心理健康服务展开：

- AI 心理咨询会话与历史记录管理
- 情绪分析与情绪日记记录
- 心理知识文章发布、查询与详情阅读
- 管理后台的数据看板与内容治理

---

## 2. 技术栈

- **框架**：Vue 3
- **构建工具**：Vite 7
- **UI 组件**：Element Plus + @element-plus/icons-vue
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **HTTP 请求**：Axios（带请求/响应拦截器）
- **图表**：ECharts + vue-echarts
- **富文本编辑**：@wangeditor/editor、@wangeditor/editor-for-vue、@tinymce/tinymce-vue
- **样式**：Sass

---

## 3. 环境要求

- Node.js 18+（建议使用 LTS 版本）
- npm 9+

> 仓库中包含了参考安装包（位于 `资料/node环境/`），实际开发时建议使用 nvm 管理多版本 Node。

---

## 4. 快速开始

### 4.1 安装依赖

```bash
npm install
```

### 4.2 启动开发环境

```bash
npm run dev
```

默认访问地址（Vite）：

- <http://localhost:5173>

### 4.3 构建生产包

```bash
npm run build
```

### 4.4 本地预览生产构建

```bash
npm run preview
```

---

## 5. 项目脚本

`package.json` 中已定义以下脚本：

- `npm run dev`：启动开发服务器
- `npm run build`：打包构建
- `npm run preview`：预览构建结果

---

## 6. 目录结构说明

```text
ai-vue/
├─ public/                     # 静态资源
├─ src/
│  ├─ api/                     # 接口封装（登录、知识库、咨询、情绪、看板等）
│  ├─ assets/                  # 项目静态资源（图片等）
│  ├─ components/              # 通用组件（布局、编辑器、渲染器等）
│  ├─ router/                  # 路由配置与路由守卫
│  ├─ stores/                  # Pinia 状态管理
│  ├─ views/                   # 页面视图（前台 + 后台）
│  │  └─ front/                # 前台页面
│  ├─ App.vue                  # 根组件
│  └─ main.js                  # 入口文件
├─ vite.config.js              # Vite 配置（含代理）
└─ README.md
```

---

## 7. 路由与权限设计

### 7.1 路由分区

- 前台路由前缀：`/front`
- 后台路由前缀：`/back`
- 认证页面：
  - `/auth/login`
  - `/auth/register`

### 7.2 角色访问控制

路由守卫基于 `localStorage` 的 `token` 与 `userInfo.userType` 进行访问控制：

- `userType === 2`：后台用户（优先访问 `/back/*`）
- `userType === 1`：前台用户（限制访问 `/front/*`）
- 未登录访问后台时自动跳转登录页

---

## 8. 接口请求与代理配置

### 8.1 Axios 统一封装

项目通过 `src/api/request.js` 统一处理：

- 请求拦截：自动注入 `Authorization: Bearer <token>`
- 响应拦截：
  - 业务码 `code === '200'` 时返回业务数据
  - 其他业务码弹出错误提示
  - 对 `401/403/404/500` 进行统一错误处理

### 8.2 开发环境代理

`vite.config.js` 中配置了 `/api` 代理：

- 代理目标：`http://159.75.169.224:1235`
- 前端请求以 `/api` 开头时将被转发到后端服务

> 如需切换环境，请修改 `vite.config.js` 中 `server.proxy` 的 `target`。

---

## 9. 核心功能模块

### 9.1 用户前台

- 首页展示
- AI 咨询对话（会话列表、消息记录、会话删除等）
- 情绪日记
- 知识库文章列表与详情

### 9.2 后台管理

- 数据分析看板
- 知识文章管理（分页、增删改、状态管理）
- 咨询记录查看
- 情绪日志管理

### 9.3 通用能力

- Markdown 渲染组件
- 富文本编辑器组件
- 布局组件（前台/后台）

---

## 10. API 模块概览

位于 `src/api/`：

- `login.js`：登录、退出、注册
- `knowledge.js`：知识库分类、文章分页、详情、增删改、状态更新、文件上传
- `consultation.js`：咨询会话分页、消息列表、新建会话、删除会话
- `emotion.js`：情绪日记分页、删除、会话情绪分析、创建/更新日记
- `dashboard.js`：后台概览数据

---

## 11. 开发建议

- 建议统一通过 `src/api/request.js` 发起请求，避免散落式网络层实现。
- 新增页面时优先按路由分区放在：
  - 前台：`src/views/front/`
  - 后台：`src/views/`
- 图标统一使用 Element Plus 图标库并在 `main.js` 全局注册。
- 样式建议优先组件内作用域编写，公共样式放入 `src/style.css`。

---

## 12. 常见问题

### 12.1 本地启动后请求失败

请检查：

1. 后端地址是否可访问（默认 `159.75.169.224:1235`）
2. 是否通过 `/api` 前缀请求后端
3. 浏览器本地存储的 `token` 是否有效

### 12.2 登录后页面跳转异常

请检查 `localStorage` 中 `userInfo.userType` 值是否符合约定：

- `1` 前台用户
- `2` 后台用户

---

## 13. 许可

当前仓库未声明开源许可证。如需开源，请补充 `LICENSE` 文件并在本 README 中声明。
