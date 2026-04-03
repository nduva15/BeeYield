// Sets ESBUILD_BINARY_PATH explicitly (helps Windows EPERM) then runs `pnpm build`.
const { spawnSync } = require('child_process');

const esbuildBin = require.resolve('esbuild/bin/esbuild');
const env = { ...process.env, ESBUILD_BINARY_PATH: esbuildBin };

const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(cmd, ['build'], { stdio: 'inherit', env });

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
