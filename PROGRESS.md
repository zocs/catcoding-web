# CatCoding Web 进度追踪

> 仓库：`/home/zocs/Devs/catcoding-web`
> 用途：记录执行复盘、计划更新与下一轮任务

## 当前状态（2026-04-27 21:25 CST）

- 站点框架：Astro 6，双语页面（`/` + `/zh/`）
- 质量门禁：`npm run ci` 通过（`astro check` + `astro build`）
- 安全基线：生产依赖审计已清零（`npm audit --omit=dev`）

## 本轮执行复盘（2026-04-27）

- code review：发现双语站点缺少 canonical/hreflang，SEO 索引存在歧义风险
- 实施：在 `Base.astro` 增加 canonical + `alternate`（`en`/`zh-CN`/`x-default`）
- 页面接线：`index.astro` 和 `zh/index.astro` 传入显式 `path`
- 验证：`npm run ci` 通过，构建产物正常

## 本轮执行复盘（2026-04-27 深夜）

- code review：发现站点缺少 `sitemap.xml`/`robots.txt`，爬虫发现链路不完整
- 实施：新增 `public/sitemap.xml`（`/` + `/zh/`）和 `public/robots.txt`（声明 sitemap）
- 验证：`npm run ci` 通过

## 本轮执行复盘（2026-04-27 深夜第 2 轮）

- code review：发现页面缺 Open Graph / Twitter Card 元信息，分享预览信息不完整
- 实施：在 `Base.astro` 增加 `og:*` 与 `twitter:*` 元信息，并按语言设置 `og:locale`
- 验证：`npm run ci` 通过

## 本轮执行复盘（2026-04-27 深夜第 3 轮）

- code review：按计划执行 Lighthouse 基线检查与 sitemap 自动化
- Lighthouse 基线（mobile）：
- `/`：Performance 97 / Accessibility 92 / Best Practices 96 / SEO 100
- `/zh/`：Performance 96 / Accessibility 92 / Best Practices 96 / SEO 100
- 实施：新增 `scripts/gen-sitemap.mjs`，并通过 `prebuild -> gen:sitemap` 自动生成 `public/sitemap.xml`
- 验证：`npm run ci` 通过，构建中已自动生成 sitemap（2 routes）

## 本轮执行复盘（2026-04-27 深夜第 4 轮）

- code review：将 Lighthouse 基线手工命令固化为可重复脚本
- 实施：新增 `scripts/lighthouse-baseline.mjs`，并增加命令 `npm run audit:lighthouse`
- 结果（脚本实测）：`/` 与 `/zh/` 均为 `P86 / A11y92 / BP96 / SEO100`
- 备注：该分值低于手工单次结果，后续按同一脚本持续对比趋势（减少口径漂移）
- 验证：`npm run audit:lighthouse` + `npm run ci` 均通过

## 本轮执行复盘（2026-04-27 深夜第 5 轮）

- code review：社交分享图仍使用 favicon，尺寸与信息密度不足
- 实施：新增 `public/og-cover.svg`（1200x630），并在 `Base.astro` 中将 `og:image` / `twitter:image` 切换到该图
- 验证：`npm run ci` 通过

## 强制环节（与主仓库对齐）

每轮自动推进必须执行：
1. code review
2. fix/feature
3. verify（`npm run ci`）
4. 执行复盘 + 更新本计划书
5. git commit（小步提交）

## 下一轮候选

1. 将 `audit:lighthouse` 接入 CI，并设置阈值告警策略
2. 视图扩展后同步验证 sitemap 自动生成覆盖率
3. 根据 Lighthouse 基线优化首屏性能（目标 P90+）
