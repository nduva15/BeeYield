// Sets ESBUILD_BINARY_PATH explicitly (helps Windows EPERM) then runs `pnpm build`.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuildBin = require.resolve('esbuild/bin/esbuild');
const env = { ...process.env, ESBUILD_BINARY_PATH: esbuildBin };

const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(cmd, ['build'], { stdio: 'inherit', env });

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
