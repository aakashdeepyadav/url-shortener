# API Endpoints

## Health

- `GET /health`

## Shorten URL

- `POST /api/shorten`
- Body: `{ "url": "https://example.com" }`
- Response: `201` with `{ code, short_url, long_url, environment, version }`

## Redirect

- `GET /<code>` → `302` redirect to long URL

## Resolve

- `GET /api/resolve/<code>` → `{ code, long_url, environment, version }`

## Stats

- `GET /api/stats/<code>` → `{ code, long_url, created_at, hits, environment, version }`

## Version

- `GET /api/version` → `{ version, build, environment }`
