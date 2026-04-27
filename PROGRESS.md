# CatCoding Web 进度追踪

> 仓库：`/home/zocs/Devs/catcoding-web`
> 用途：记录执行复盘、计划更新与下一轮任务

## 当前状态（2026-04-28 01:04 CST）

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

## 本轮执行复盘（2026-04-27 深夜第 6 轮）

- code review：将 Lighthouse 从“可执行”升级为“可作为质量门禁”
- 实施：`scripts/lighthouse-baseline.mjs` 新增阈值断言（默认 `P>=85, A11y>=90, BP>=90, SEO>=100`）
- 流程：新增 `npm run ci:quality`，串联 `ci + audit:lighthouse`
- 验证：`npm run ci:quality` 通过，当前分数 `/` 与 `/zh/` 均为 `P86 / A11y92 / BP96 / SEO100`

## 本轮执行复盘（2026-04-27 深夜第 7 轮）

- code review：发现仓库缺少远端 CI 配置，质量门禁仅能本地执行
- 实施：新增 `.github/workflows/ci-quality.yml`，在 push/PR 上执行 `npm ci` + `npm run ci` + `npm run audit:lighthouse`
- 门禁阈值：workflow 中显式配置 `LH_MIN_*` 环境变量，与本地脚本一致
- 验证：本地已提前通过 `npm run ci:quality`；远端 workflow 将在下一次 push/PR 自动生效

## 本轮执行复盘（2026-04-27 深夜第 8 轮）

- code review：`ci:quality` 串联时发现 `ci` 与 `audit:lighthouse` 都会 build，存在重复构建
- 实施：`lighthouse-baseline.mjs` 支持 `LH_SKIP_BUILD=1`，`ci:quality` 传入该变量复用 `ci` 产物
- 验证：`npm run ci:quality` 通过，分数保持 `P86 / A11y92 / BP96 / SEO100`

## 本轮执行复盘（2026-04-28 凌晨第 9 轮）

- code review：继续针对首屏性能做优化，减少关键路径资源与非关键脚本干扰
- 实施：
- `Base.astro` 移除 Google Fonts 外链（避免外部字体请求阻塞）
- `cat-hunt.js` 改为“用户意图触发 + idle 回退”动态加载
- 验证：`npm run ci:quality` 通过，Lighthouse 基线提升为：
- `/`：`P100 / A11y92 / BP96 / SEO100`
- `/zh/`：`P100 / A11y92 / BP96 / SEO100`

## 本轮执行复盘（2026-04-28 凌晨第 10 轮）

- code review：既然基线已达 `P100`，将远端回归守卫阈值抬高，避免回退
- 实施：`ci-quality.yml` 中 `LH_MIN_PERFORMANCE` 从 `85` 提升到 `90`
- 验证：本地以 `LH_MIN_PERFORMANCE=90` 运行 `npm run ci:quality` 通过

## 本轮执行复盘（2026-04-28 凌晨第 11 轮）

- code review：按计划引入分环境阈值策略，并优化 workflow 重复构建
- 实施：
- `ci-quality.yml` 中 `LH_MIN_PERFORMANCE` 改为按分支动态策略：`master=95`，其余 `90`
- workflow 的 Lighthouse 步骤加 `LH_SKIP_BUILD=1`，复用前一步构建产物
- 验证：本地以 `LH_MIN_PERFORMANCE=95` 执行 `npm run ci:quality` 通过

## 强制环节（与主仓库对齐）

每轮自动推进必须执行：
1. code review
2. fix/feature
3. verify（`npm run ci`）
4. 执行复盘 + 更新本计划书
5. git commit（小步提交）

## 下一轮候选

1. 视图扩展后同步验证 sitemap 自动生成覆盖率
2. 评估在 CI 中缓存 `node_modules` 与 Lighthouse 依赖以缩短总时长
3. 观察一段时间后再评估是否将 `master` 性能阈值提升到 98
