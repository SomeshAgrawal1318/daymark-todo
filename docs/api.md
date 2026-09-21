# Daymark API

Base URL: `/api`

All task routes require an `X-Client-ID` header containing a UUID. The header provides anonymous browser-level list partitioning; it is not authentication.

## Response shapes

Successful list:

```json
{ "tasks": [] }
```

Successful create or update:

```json
{ "task": { "id": "...", "title": "..." } }
```

Error:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Please correct the highlighted fields.",
    "fields": { "title": "Title is required." }
  }
}
```

## Endpoints

### `GET /health`

Returns `200` with `{ "status": "ok" }`. No client ID is required.

### `GET /tasks`

Returns only tasks owned by the supplied anonymous client ID. Ordering is active before completed, nearest due date before undated work, then newest first.

### `POST /tasks`

Accepted body:

```json
{
  "title": "Finalize API contract",
  "note": "Confirm response shapes",
  "priority": "high",
  "dueDate": "2026-09-20"
}
```

`title` is required. Other fields are optional. `priority` is `low`, `medium`, or `high`; `dueDate` is a calendar date in `YYYY-MM-DD` form or `null`. Server-owned and unknown fields are rejected.

Returns `201` with the created task.

### `PATCH /tasks/:id`

Accepts one or more editable fields:

```json
{
  "title": "Final API contract",
  "note": "Confirmed",
  "priority": "medium",
  "dueDate": null,
  "completed": true
}
```

Completing sets `completedAt`; reopening clears it. Returns `200` with the updated task. A task belonging to another client is returned as `404` rather than revealing its existence.

### `DELETE /tasks/:id`

Deletes an owned task and returns `204` with no body. Missing or differently owned tasks return `404`.

## Public task shape

```json
{
  "id": "68c...",
  "title": "Finalize API contract",
  "note": "Confirm response shapes",
  "priority": "high",
  "dueDate": "2026-09-20",
  "completed": false,
  "completedAt": null,
  "createdAt": "2026-09-20T20:00:00.000Z",
  "updatedAt": "2026-09-20T20:00:00.000Z"
}
```

`ownerId`, MongoDB internals, and stack traces are never included in public responses.

