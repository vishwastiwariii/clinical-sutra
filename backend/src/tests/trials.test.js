import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../app.js';
import pool from '../config/db.js';

describe('Trials API Tests', () => {
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

  test('GET /trials returns correct default pagination and structure', async () => {
    const res = await fetch(`${baseUrl}/trials`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.strictEqual(data.data.length, 10); // Default limit is 10
    assert.ok(data.nextCursor);
  });

  test('GET /trials with cursor pagination parameters', async () => {
    // Fetch first page
    const res1 = await fetch(`${baseUrl}/trials?limit=5`);
    const data1 = await res1.json();
    assert.strictEqual(data1.data.length, 5);
    const cursor = data1.nextCursor;
    assert.ok(cursor);

    // Fetch next page using cursor
    const res2 = await fetch(`${baseUrl}/trials?limit=5&cursor=${cursor}`);
    const data2 = await res2.json();
    assert.strictEqual(data2.data.length, 5);
    // The items in the second page should have IDs strictly greater than the cursor
    assert.ok(data2.data.every(trial => trial.id > cursor));
  });

  test('GET /trials/:nct_id returns a trial when it exists', async () => {
    const testNctId = 'NCT07162324';
    const res = await fetch(`${baseUrl}/trials/${testNctId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.ok(data.data);
    assert.strictEqual(data.data.nct_id, testNctId);
  });

  test('GET /trials/:nct_id returns 404 when trial does not exist', async () => {
    const testNctId = 'NCT00000000';
    const res = await fetch(`${baseUrl}/trials/${testNctId}`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();

    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, `Trial with NCT ID ${testNctId} not found`);
  });
});
