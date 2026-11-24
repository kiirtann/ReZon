import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./test.db',
    },
    globalSetup: ['./src/test/globalSetup.ts'],
    // SQLite tests share server/prisma/test.db; run test files sequentially to avoid write locks.
    fileParallelism: false,
  },
});
