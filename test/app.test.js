const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');

let server, baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(() => server.close());

test('search returns matching products for a normal query', async () => {
  const res = await fetch(`${baseUrl}/search?q=Laptop`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.results.some((r) => r.name === 'Laptop'));
});

test('files endpoint serves a legitimate uploaded file', async () => {
  const res = await fetch(`${baseUrl}/files/readme.txt`);
  assert.strictEqual(res.status, 200);
});

test('convert endpoint works for a normal filename', async () => {
  const res = await fetch(`${baseUrl}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: 'photo.png' }),
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.output.includes('photo.png'));
});
