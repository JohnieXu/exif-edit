# 构建无限卡死（Hang）问题记录

**日期**：2026-04-02
**现象**：运行 `pnpm run build` 后，Vite 在终端输出至 `transforming (1) src\main.ts` 时彻底卡死无响应，没有任何报错输出，且永远无法构建完成。

## 🔍 问题根本原因 (Root Cause)

1. **TailwindCSS v4 的核心架构差异**
   项目将 Tailwind CSS 更新到了 v4 (`@tailwindcss/vite` ^4.2.2)。此版本摒弃了之前纯 JS 实现的 PostCSS 生态，转向采用由 Rust 编写的高性能原生引擎 `@tailwindcss/oxide`（以及相关的 `lightningcss`）。
   
2. **特定的环境依赖冲突（Node 22 + Windows + 原生绑定）**
   在当前的 Windows 系统环境和 Node.js 22 IPC 通信机制下，构建系统在尝试加载或调用 `oxide` 二进制包时发生了底层阻塞（死锁）。因为 Vite 的 `transform` 钩子处于无限期 `await` 状态，整个 Node 进程进入了无法退出也无法报错的卡死状态。

3. **包管理器的限制行为**
   使用 `pnpm v10` 默认拦截了未授权的生命周期脚本（拦截了 Node 原生扩展及 `esbuild` 相关的 Post-install 下载进程），间接导致这些 C++ 原生运行环境未正确初始化。

4. **隐藏的 Vue 语法错误阻碍**
   `src/components/ExifEdit.vue` 第 99 行存在 `onMounted` 的重复引入语法错误，该错误在常规情况下应该主动抛出终止进程，但由于 Tailwind 插件卡死了转换流，这行错误也被完全掩盖，给排查制造了困难。

5. **缺少 ES Modules 类型声明**
   `package.json` 没有明确标记 `"type": "module"`，引发了 Vite 最新版本在部分依赖（尤其带有条件导出功能的依赖库）的模块化解析链路阻塞。

---

## 🛠️ 解决方案详细步骤

为了确保持续稳定的构建并在当前软硬件条件顺利执行，我们彻底移除了不稳定的 v4 原生混合包栈，采用了稳定且成熟的 PostCSS 处理路径。

1. **回退依赖栈并切换到 PostCSS 集成**
   - 卸载引起冲突的依赖：`pnpm remove @tailwindcss/vite tailwindcss`
   - 安装极为成熟的 v3 版本分支：`pnpm add -D tailwindcss@^3.4.17 postcss autoprefixer`

2. **恢复常规工程化配置**
   - 新建 `postcss.config.js` 和 `tailwind.config.js`。
   - 配置 `vite.config.ts`：移除 `tailwindcss()` 原生 Vite 插件，交由 Vite 默认内置识别的 `postcss` 工作流处理。

3. **CSS 指令及原子化配置兼容**
   - 将由 `v4` 的内联书写习惯（使用 `@theme` ）迁移到经典的 `tailwind.config.js` 中的 `theme.extend` 配置中。
   - 还原了 `style.css` 头部为标准的三大宏指令：
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```

4. **语法级错误消除**
   修正了 `src/components/ExifEdit.vue` 中的 Vue API 导入冗余现象。为 `package.json` 强行追加 `"type": "module"`。

---

## ⚠️ 后续维护注意事项

1. **避免盲目升级 Tailwind CSS v4**
   如果您或其他开发者未来要更新依赖（比如进行全局 `pnpm update` 或使用 Dependabot 等自动化更新拉取），**切记暂时将 `tailwindcss` 的版本锁定在 3.x 范围内**。不要升级到 `v4` 或者使用 `@tailwindcss/vite`，直到在本地能够确认 Node.js / pnpm 的原生模块挂死问题被其官方修复为止。

2. **如果非要使用 V4 机制的尝试方案**
   未来假若一定要跟进 V4：
   - 请考虑不要使用 `@tailwindcss/vite`，而继续采用 `@tailwindcss/postcss` 这层包裹模式可能避免 Vite 的直接挂死。
   - 确保当前 Windows 系统安装了全面的 **Microsoft Visual C++ Redistributables** 支持包，防止 `oxide` C++ 原生计算程序抛锚。
   - 执行 `pnpm install` 前务必检查和执行 `pnpm approve-builds`，使得原生模块被完全赋予下载并执行的权限。

3. **遇到控制台卡住（Hang）的排查思路**
   以后遇到 `vite build` 卡住的问题，可尝试设置 Node.js 的全局调试环境变量追踪：
   ```powershell
   $env:DEBUG="vite:*"; pnpm run build
   ```
   追踪最后的 `resolve` 日志位置，以此辨析是哪一个插件或哪一种文件类型导致了进程的无限期挂起。
