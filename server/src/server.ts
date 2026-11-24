import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 API ready at http://localhost:${env.PORT}/api/v1 (${env.NODE_ENV})`);
});
