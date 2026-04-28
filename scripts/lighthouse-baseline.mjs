import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const cwd = path.resolve('.');
const tempDir = await mkdtemp(path.join(os.tmpdir(), 'catcoding-lh-'));

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: options.stdio ?? 'inherit',
      shell: false,
      env: process.env,
    });
    let timer;
    let timedOut = false;
    let killedHard = false;
    if (options.timeoutMs && Number.isFinite(options.timeoutMs)) {
      timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!killedHard && child.exitCode === null) {
            killedHard = true;
            child.kill('SIGKILL');
          }
        }, 5000);
      }, options.timeoutMs);
    }
    child.on('error', reject);
    child.on('exit', (code) => {
      if (timer) clearTimeout(timer);
      if (timedOut) {
        reject(
          new Error(
            `${cmd} ${args.join(' ')} timed out after ${options.timeoutMs}ms`
          )
        );
        return;
      }
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} failed with code ${code}`));
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const reportPaths = {
  home: path.join(tempDir, 'home.json'),
  zh: path.join(tempDir, 'zh.json'),
};

const thresholds = {
  performance: Number(process.env.LH_MIN_PERFORMANCE ?? 85),
  accessibility: Number(process.env.LH_MIN_ACCESSIBILITY ?? 90),
  bestPractices: Number(process.env.LH_MIN_BEST_PRACTICES ?? 90),
  seo: Number(process.env.LH_MIN_SEO ?? 100),
};
const lighthouseTimeoutMs = Number(process.env.LH_TIMEOUT_MS ?? 120000);

function assertThreshold(route, score) {
  const failures = Object.entries(thresholds)
    .filter(([k, min]) => score[k] < min)
    .map(([k, min]) => `${k}=${score[k]} < ${min}`);
  if (failures.length > 0) {
    throw new Error(`Lighthouse threshold failed for ${route}: ${failures.join(', ')}`);
  }
}

let serverProcess;
try {
  const skipBuild = process.env.LH_SKIP_BUILD === '1';
  if (!skipBuild) {
    await run('npm', ['run', 'build']);
  }

  serverProcess = spawn('npx', ['--no-install', 'http-server', 'dist', '-p', '4321'], {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
  await sleep(1500);

  const runLighthouse = async (url, outputPath) => {
    await run('npx', [
      '--no-install',
      'lighthouse',
      url,
      '--quiet',
      '--chrome-flags=--headless=new --no-sandbox',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--max-wait-for-load=45000',
      '--output',
      'json',
      `--output-path=${outputPath}`,
    ], { timeoutMs: lighthouseTimeoutMs });
  };

  await runLighthouse('http://127.0.0.1:4321/?lh=1', reportPaths.home);
  await runLighthouse('http://127.0.0.1:4321/zh/?lh=1', reportPaths.zh);

  const loadScore = async (file) => {
    const data = JSON.parse(await readFile(file, 'utf8'));
    return {
      performance: Math.round(data.categories.performance.score * 100),
      accessibility: Math.round(data.categories.accessibility.score * 100),
      bestPractices: Math.round(data.categories['best-practices'].score * 100),
      seo: Math.round(data.categories.seo.score * 100),
    };
  };

  const home = await loadScore(reportPaths.home);
  const zh = await loadScore(reportPaths.zh);

  console.log('\nLighthouse baseline (mobile):');
  console.log(`- /    : P ${home.performance} | A11y ${home.accessibility} | BP ${home.bestPractices} | SEO ${home.seo}`);
  console.log(`- /zh/ : P ${zh.performance} | A11y ${zh.accessibility} | BP ${zh.bestPractices} | SEO ${zh.seo}`);
  console.log(
    `Thresholds: P>=${thresholds.performance}, A11y>=${thresholds.accessibility}, BP>=${thresholds.bestPractices}, SEO>=${thresholds.seo}`
  );

  assertThreshold('/', home);
  assertThreshold('/zh/', zh);
} finally {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGINT');
  }
  await rm(tempDir, { recursive: true, force: true });
}
