# vulnerable-shop

A deliberately vulnerable Express demo app for PatchProof.
Contains three intentional bugs:

1. SQL injection in `GET /search?q=`
2. Path traversal in `GET /files/:name`
3. Command injection in `POST /convert`

Requires Node 22.5+ (uses the built-in `node:sqlite` module).

## Run

    npm install
    npm start

## Test (passes on this vulnerable code as-is)

    npm test
