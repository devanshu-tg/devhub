/**
 * One-time seed: pulls blog posts from tigergraph.com/blog and
 * upserts them into the `resources` table with type='blog'.
 *
 * Run:  node src/scripts/seedBlogs.js
 */

require('dotenv').config();
const { syncBlogs } = require('../services/scheduler');

(async () => {
  try {
    await syncBlogs();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
