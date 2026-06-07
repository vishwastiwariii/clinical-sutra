import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../app.js';
import pool from '../config/db.js';
import { searchTrialService } from '../services/search.service.js';

describe('Search Service & API Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start server on a dynamic port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running at ${baseUrl}`);
        resolve();
      });
    });
  });

  after(async () => {
    // Clean up connections
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  test('searchTrialService destructuring behavior', async () => {
    // Verify how searchTrialService behaves when passing q
    const resWithQ = await searchTrialService({ q: 'cancer', page: 1, limit: 5 });

    console.log(`Total count when passing q: ${resWithQ.total}`);
    
    // Assert that the results are filtered (total is 35499, which is less than 71989)
    assert.ok(resWithQ.total < 71989, "Search results should be filtered");
    assert.strictEqual(resWithQ.total, 35499, "Search results should match the 'cancer' query count");
  });

  test('API endpoint GET /search integration', async () => {
    const res = await fetch(`${baseUrl}/search?q=cancer&limit=5`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.result);
    assert.ok(Array.isArray(data.result.results));
    console.log(`API response total: ${data.result.total}`);
    console.log(`API response results length: ${data.result.results.length}`);
    
    // Assert that the API response is correctly filtered
    assert.strictEqual(data.result.total, 35499, "API response should filter results by query 'cancer'");
    assert.strictEqual(data.result.results.length, 5, "Should respect limit parameter");
  });

  test('API endpoint GET /search with status filter', async () => {
    const res = await fetch(`${baseUrl}/search?status=COMPLETED&limit=5`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.result);
    // Since status COMPLETED has 31468 trials, let's verify total
    assert.strictEqual(data.result.total, 31468);
    assert.ok(data.result.results.every(r => r.status === 'COMPLETED'));
  });

  test('API endpoint GET /search with phase filter', async () => {
    const res = await fetch(`${baseUrl}/search?phase=PHASE3&limit=5`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.result);
    // Since phase PHASE3 has 5775 trials, let's verify total
    assert.strictEqual(data.result.total, 5775);
    assert.ok(data.result.results.every(r => r.phase === 'PHASE3'));
  });

  test('API endpoint GET /search combining q, status, and phase', async () => {
    const res = await fetch(`${baseUrl}/search?q=cancer&status=COMPLETED&phase=PHASE3&limit=5`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.result);
    assert.ok(data.result.results.every(r => r.status === 'COMPLETED' && r.phase === 'PHASE3'));
    console.log(`Combined query (cancer + COMPLETED + PHASE3) total: ${data.result.total}`);
  });

  test('API endpoint GET /search pagination validation', async () => {
    const res = await fetch(`${baseUrl}/search?page=0&limit=5`);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Invalid Pagination Value');
  });
});
