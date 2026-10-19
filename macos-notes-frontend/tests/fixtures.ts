import { test as base, expect } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

type Backend = { restart: () => Promise<void>; stop: () => Promise<void> };
export const test = base.extend<{ backend: Backend }>({
  backend: [async ({}, use) => {
    const directory = await mkdtemp(join(tmpdir(), 'rock-notes-e2e-'));
    let child: ChildProcess | undefined;
    let logs = '';
    async function stop() {
      if (!child || child.exitCode !== null || child.signalCode !== null) return;
      const current = child;
      await new Promise<void>(done => {
        const timer = setTimeout(() => current.kill('SIGKILL'), 5000);
        current.once('close', () => { clearTimeout(timer); done(); });
        current.kill('SIGTERM');
      });
      child = undefined;
    }
    async function start() {
      await rm(join(directory, 'backend-ready'), { force: true });
      logs = '';
      child = spawn(resolve('../.venv/bin/python'), ['-B', 'tests/run-backend.py'], {
        env: { ...process.env, ROCK_E2E_DATA_DIR: directory }, stdio: ['ignore', 'pipe', 'pipe'],
      });
      child.stderr?.on('data', value => { logs += value.toString(); });
      child.on('error', error => { logs += error.message; });
      const deadline = Date.now() + 10000;
      while (Date.now() < deadline) {
        if (child.exitCode !== null || child.signalCode !== null) throw new Error('临时后端退出：' + logs);
        try {
          await access(join(directory, 'backend-ready'));
          if ((await fetch('http://127.0.0.1:18000/health')).ok) return;
        } catch {}
        await new Promise(done => setTimeout(done, 50));
      }
      throw new Error('临时后端未启动：' + logs);
    }
    try {
      await start();
      await use({ stop, restart: async () => { await stop(); await start(); } });
    } finally { await stop(); await rm(directory, { recursive: true, force: true }); }
  }, { auto: true }],
});
export { expect };
