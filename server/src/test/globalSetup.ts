import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '../..');

/**
 * Ensures server/prisma/test.db exists and has all Prisma migrations applied
 * before any test file runs, keeping server/prisma/dev.db untouched.
 */
export function setup(): void {
  execSync('npx prisma migrate deploy', {
    cwd: serverRoot,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./test.db',
    },
    stdio: 'pipe',
  });
}
