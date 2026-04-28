# CatCoding Web

Marketing and landing site for CatCoding, built with Astro.

## Quality Gate

Core checks:

- `npm run ci` (`astro check` + `astro build`)
- `npm run audit:lighthouse`

GitHub workflow:

- `.github/workflows/ci-quality.yml`
- runs on `master` push / PR
- includes concurrency control and Lighthouse thresholds

## Autonomous Progress Sync

During autonomous execution, each cycle updates:

- `PROGRESS.md` (execution replay and next tasks)

Then commits are pushed in small batches to reduce CI trigger noise.
