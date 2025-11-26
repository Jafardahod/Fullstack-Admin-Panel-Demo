// backend/api/index.js  (ESM)
import serverless from 'serverless-http';
import app from '../src/app.js';

export default serverless(app);
