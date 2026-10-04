const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { DatabaseSync } = require('node:sqlite'); // built into Node 22.5+, no install needed

const app = express();
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// ---- Seed an in-memory database ----
const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL)`);
db.exec(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)`);
db.exec(`INSERT INTO products (name, price) VALUES
  ('Laptop', 999.99), ('Phone', 599.99), ('Headphones', 149.99)`);
db.exec(`INSERT INTO users (username, password) VALUES
  ('admin', 'S3cr3tP@ssw0rd!'), ('alice', 'alicepass123')`);

// ---- BUG 1: SQL injection via string concatenation ----
app.get('/search', (req, res) => {
  const q = req.query.q || '';
  const sql = `SELECT id, name, price FROM products WHERE name LIKE '%${q}%'`;
  try {
    const rows = db.prepare(sql).all();
    res.json({ results: rows });
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

// ---- BUG 2: Path traversal via unsanitized filename ----
app.get('/files/:name', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.name); // no sanitization
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.type('text/plain').send(content);
  } catch (e) {
    res.status(404).json({ error: 'not found' });
  }
});

// ---- BUG 3: Command injection via unsanitized shell interpolation ----
app.post('/convert', (req, res) => {
  const filename = req.body.filename || req.body.input || '';
  exec(`echo "Converting: ${filename}"`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: String(stderr) });
    res.json({ output: stdout.trim() });
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`vulnerable-shop listening on ${PORT}`));
}
module.exports = app;
