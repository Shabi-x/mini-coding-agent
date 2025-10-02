# Mini Coding Agent

基于 yo code 探索开发的 VSCode Vibe Coding 插件，致力于实现一个简单架构的 Coding Agent 插件；
类似于 CodeBuddy 插件版、GitHub Copilot、 Amazon CodeWhisperer等AI Coding助手。

## 项目概述

本项目是一个探索性的 VSCode Extension，旨在构建一个基础的 Coding Agent VSCode插件的最小实现架构。通过使用 VS Code 的 Webview 技术，结合 React 前端框架，实现一个可以在 VSCode 环境下运行的交互式 Vibe Coding 助手。

## 技术栈

- **后端**: TypeScript + VS Code API
- **前端**: React 实现 Webview
- **构建工具**: esbuild
- **包管理**: pnpm + Monorepo

## 项目结构

```
mini-coding-agent/
├── src/                          # VS Code Extension
│   ├── extension.ts              # VSCode Extension 入口文件
│   ├── agentWebviewProvider.ts  # Webview数据交互处理Provider
│   ├── APIHandler.ts            # API 请求处理，链接大模型接口
│   ├── task.ts                  # 任务处理逻辑，处理流式请求和响应
├── agent-webview/                # React WebView
│   ├── src/                      # 前端源代码
│   ├── package.json             # 前端依赖配置
├── .env                         # 环境变量配置
├── .gitignore                   # Git 忽略文件
├── assets/                      # 扩展资源
├── package.json                 # 扩展依赖配置
├── tsconfig.json                # TypeScript 配置
├── esbuild.js                   # 构建脚本
├── pnpm-workspace.yaml          # pnpm 工作区配置
└── pnpm-lock.yaml               # 依赖锁定文件
```

## 当前进度

### ✅ 已完成功能

1. **基础架构搭建**
   - 使用 yo code 生成 VS Code 扩展基础结构
   - 配置 TypeScript 和 ESLint 开发环境
   - 设置 pnpm 工作区管理依赖

2. **VS Code 扩展核心功能**
   - 实现扩展激活和停用机制
   - 注册 Webview 视图提供者
   - 创建侧边栏视图容器
   - 实现命令注册和消息传递

3. **VSCode Extension Webview 页面搭建**
   - 使用 React + TypeScript + Vite 创建前端应用
   - 实现与 VS Code 扩展的双向通信
   - 添加 VS Code API 类型支持和模拟实现
   - 解决 Webview 安全策略和资源访问问题

4. **消息传递机制**
   - 基础消息发送和接收已实现
   - 实现流式响应的实时展示
   - 修复前后端通信问题，确保消息正确传递和显示

5. **API 接入**
   - 集成 OpenAI API（通过阿里云 Dashscope 兼容接口）
   - 实现环境变量配置管理（API 密钥、基础 URL 和模型）
   - 实现流式请求和响应处理
   - 添加前端展示流式返回结果

### 📋 TODO List

1. **完善 API 接口**
   - 支持多种 AI 服务（Claude Code 等），支持用户自行配置API Key
   - 实现 markdown 渲染
   - 添加请求重试和错误恢复机制

2. **抓取Agent System Prompts**
   - System Prompts
   - 将tools编写为func_call
   - attempt_completion
   - read_file

3. **Coding Agent Loop**
   - Agent_loop
   - Tool_use
   - Text_context

4. **测试和文档**
   - 完善单元测试
   - 添加集成测试
   - 完善用户文档

## 开发指南

### 环境要求

- Node.js 18+
- VS Code 最新版本
- pnpm 包管理器

### 安装步骤

1. 克隆项目

   ```bash
   git clone <repository-url>
   cd mini-coding-agent
   ```

2. 安装依赖

   ```bash
   pnpm install
   ```

3. 构建前端应用

   ```bash
   cd agent-webview
   pnpm install
   pnpm build
   ```

4. 在 VS Code 中调试扩展
   - 打开项目文件夹
   - 按 F5 启动调试
   - 在新窗口中测试扩展功能

### 开发流程

1. **插件WebView开发**

   ```bash
   cd agent-webview
   pnpm dev  # 启动前端开发服务器
   ```

2. **插件服务开发**
   - 在 VS Code 中打开项目
   - 按 F5 启动扩展调试
   - 修改 `src/` 目录下的代码

3. **构建和测试**

   ```bash
   pnpm compile      # 编译扩展
   pnpm package      # 打包扩展
   pnpm test         # 运行测试
   ```

## 技术难点和解决方案

### 1. Webview 安全策略

**问题**: VS Code Webview 默认不允许访问本地资源和执行脚本。

**解决方案**:

- 通过 `asWebviewUri` 转换本地资源 URI
- 设置 `enableScripts: true` 允许脚本执行
- 配置 `localResourceRoots` 限制资源访问范围

### 2. 前后端通信

**问题**: Webview 和 Vscode 扩展之间的消息传递需要可靠的机制。

**解决方案**:

- 使用 `postMessage` 和 `onDidReceiveMessage` 实现双向通信
- 定义清晰的消息格式和处理逻辑
- 添加错误处理和日志记录

## 许可证

MIT License
