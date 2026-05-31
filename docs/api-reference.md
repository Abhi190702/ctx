# API Reference

All routes return `{ ok, data }` on success or `{ ok: false, error }` on failure.

## Health

- `GET /api/health`

## Capsules

- `GET /api/capsules`
- `POST /api/capsules`
- `GET /api/capsules/:id`
- `PATCH /api/capsules/:id`
- `DELETE /api/capsules/:id`
- `GET /api/capsules/:id/versions`

## Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`

## Search, Import, Export

- `GET /api/search?q=term`
- `GET /api/export`
- `GET /api/export?id=capsuleId`
- `POST /api/import`

## Activity and Stats

- `GET /api/activity`
- `GET /api/stats`

## Integrations

- `POST /api/extension/capture`
- `POST /api/github/capture`
