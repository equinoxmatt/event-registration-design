# Internal Event Registration System

## Stack

| Layer | Technology |
|---|---|
| API | Laravel 11 (PHP 8.4) |
| Frontend | Next.js 16 (React 19) |
| Database | MySQL 8.4 |
| Proxy | Nginx |
| Runtime | Docker Compose |

## Key decisions

### Atomic registration counts
I needed to ensure two concurrent users clicking Register at the same moment could not lose an increment. MySQL's InnoDB serialises writes to the same row, so a single `UPDATE events SET registrations = registrations + 1` is safe without application-level locking. Decrement uses `WHERE registrations > 0` on the same atomic statement to floor at zero.

### Type safety
I used `openapi.yaml` as the source of truth for the API shape. On the Laravel side, PHPStan at level 10 and PHP `readonly` DTOs enforce type correctness across the API layer. On the frontend, `openapi-typescript` generates TypeScript types from the spec and `openapi-fetch` uses those types to enforce correct request parameters and bodies alongside response shapes, a breaking API change produces a compile error in the frontend before it can reach production. Regenerate types after changing the spec:

```bash
make generate-types
```

### Optimistic UI
The count updates immediately via React's `useOptimistic`, then syncs to the real server value once the request completes. If the request fails, the count reverts and an inline error is shown.

## Running locally

```bash
cp .env.example .env   # fill in DB_PASSWORD and DB_ROOT_PASSWORD
make setup             # build images, start services, run migrations
```

Then open [http://localhost](http://localhost).

### Useful commands

```bash
make seed              # seed the database with sample events
make test              # PHPUnit test suite
make test-web          # Jest + React Testing Library
make stan              # PHPStan level 10
make lint              # Pint + ESLint
make generate-types    # regenerate TypeScript types from openapi.yaml
make shell-api         # shell into the API container
make shell-db          # MySQL prompt
make logs              # tail all service logs
```

## Tests

### API
I wrote full PHPUnit coverage for all runtime behaviour across the API.

PHPStan at level 10 checks type correctness statically, which narrows the runtime surface that tests need to cover.

### Frontend
The meaningful runtime behaviour covered at build time: API request and response shapes by TypeScript types generated from `openapi.yaml` and enforced by `openapi-fetch`, component props and imports by TypeScript and the Next.js build. The rest of the runtime logic is tested thourgh Jest + React Testing Library.

## What I would add next

- **Real-time updates across users** — SSE so every open browser sees count changes without refreshing. 
- **Authentication** — the brief does not mention auth, but I would add SSO (e.g. Google Workspace OAuth) before exposing this more broadly, to tie registrations to individuals and prevent anonymous manipulation of counts.
- **SSL/TLS** — nginx currently serves plain HTTP. I would terminate SSL at nginx with Let's Encrypt, or offload it to a load balancer in front.
