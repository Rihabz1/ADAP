# ADAP

ADAP (Application Data Analysis Platform) is a Next.js application for multi-source activity analysis. It correlates events from Foodi, Pathao ride sharing, Rokomari, and Steadfast Courier through server-side provider adapters and a normalized activity model.

> **Sensitive data warning:** The supplied CSV files contain personal names and phone numbers. Keep them private, restrict access, and do not commit or deploy them to a public environment. The app does not perform live tracking, criminal prediction, guilt/threat scoring, facial recognition, or autonomous targeting.

## Features

- Exact phone-number search across four provider adapters
- Process-level CSV parsing cache with indexes for phone and `user_id`
- Concurrent, partial-failure-tolerant provider queries
- Unified timeline with provider, date, and status filters
- Provider-specific record views and browser-local bookmarks/notes
- Leaflet map of historical recorded points and optional event-sequence lines
- Dynamic Recharts analytics, daily correlation, activity calendar, and area frequency
- Historical Haversine geofence simulation and informational alerts
- Browser-local case management and audit trail
- Filtered per-user CSV export and printable HTML report
- Responsive dashboard, session cookie gate, accessible controls, and safe API errors
- Zod request/row validation, parse-health metrics, tests, and Vercel-compatible Node routes

## Screenshots

Add deployment screenshots here after hosting:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/profile.png`
- `docs/screenshots/map.png`
- `docs/screenshots/analytics.png`

## Architecture

```text
                    Next.js Dashboard
                           |
                           v
                    Route Handlers
                           |
             Promise.allSettled() + normalization
             /              |             \
            v               v              v
     Provider adapters  Analytics       Locations
       |   |   |   |                      |
       v   v   v   v                      v
     Server-only validated CSVs       Map/geofence
       + phone/user_id indexes
```

CSV files remain in `data/`, never `public/`. The loader parses and validates each file once per warm Node.js process, then caches rows and both lookup indexes on `globalThis`. Next.js output tracing includes the files in Vercel server functions.

The UI depends on the `ProviderAdapter` interface rather than CSV details, so a future authorized source can replace an adapter without changing consumers.

## CSV source files and schemas

The repository includes:

```text
data/
├── foodi_demo_100_users_6_months_english.csv
├── pathao_ride_demo_100_users_6_months_english.csv
├── rokomari_demo_100_users_6_months_english.csv
└── steadfast_demo_100_users_6_months_english.csv
```

Core identity fields are `user_id`, `phone`, and `customer_name`. Chronology uses `order_time` for Foodi/Rokomari, `request_time` for Pathao, and `booking_time` for Steadfast. `source_updated_at` is retained separately and is never used as event time. Provider-specific fields are validated in [schemas.ts](src/lib/data/schemas.ts).

Current source health:

| Provider       | Valid records |                     Users |
| -------------- | ------------: | ------------------------: |
| Foodi          |         1,054 |                       100 |
| Pathao         |         1,189 |                       100 |
| Rokomari       |           896 |                       100 |
| Steadfast      |           887 |                       100 |
| **Total**      |     **4,026** | **100 shared identities** |

The application calculates these values at runtime; this table documents the included source snapshot.

## Installation and local development

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and use the credentials below.

Production validation and serving:

```bash
npm test
npm run lint
npm run build
npm start
```

No environment variables, database, Redis, Docker, or provider credentials are required.

## Credentials

```text
Username: analyst
Password: adap123
```

This is an intentionally simple demonstration cookie gate. Replace it with a production identity provider before using the architecture in a real protected environment.

Example user IDs (phone numbers are intentionally omitted from documentation):

`USR001`, `USR025`, `USR050`, `USR100`

## Routes

| Route                           | Purpose                                             |
| ------------------------------- | --------------------------------------------------- |
| `/`                             | Public landing page                                 |
| `/login`                        | Login                                               |
| `/dashboard`                    | Search, record totals, and provider health          |
| `/users`                        | Paginated summary-only user directory               |
| `/users/[identifier]`           | Profile, provider views, notes, and recent activity |
| `/users/[identifier]/timeline`  | Filtered unified timeline and export                |
| `/users/[identifier]/map`       | Historical recorded points and sequence mode        |
| `/users/[identifier]/analytics` | Dynamic descriptive charts                          |
| `/users/[identifier]/report`    | Printable report / browser Save as PDF              |
| `/geofences`                    | Historical synthetic circle simulation              |
| `/cases`                        | Browser-local case management                       |
| `/audit`                        | Browser-local UI action trail                       |
| `/data-sources`                 | Adapter status and parse health                     |
| `/about`                        | Purpose, safety boundary, and architecture          |

## API documentation

All responses use a consistent envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Errors return `400`, `404`, or `500` without internal stack traces:

```json
{
  "success": false,
  "error": { "message": "No synthetic user found." }
}
```

### Endpoints

| Endpoint                            | Description                                     |
| ----------------------------------- | ----------------------------------------------- |
| `GET /api/search?query=%2B880...`    | Resolve an exact phone number                   |
| `GET /api/users`                    | Summary directory only; no raw provider records |
| `GET /api/users/USR001`             | Profile summary and calculated statistics       |
| `GET /api/users/USR001/latest`      | Newest item by `occurredAt`                     |
| `GET /api/users/USR001/timeline`    | Paginated normalized activities                 |
| `GET /api/users/USR001/stats`       | Descriptive analytics                           |
| `GET /api/users/USR001/locations`   | Recorded points for this user only              |
| `GET /api/providers/status`         | Dynamic counts and parse health                 |
| `POST /api/auth/login`              | Establish the session cookie                    |
| `POST /api/auth/logout`             | Remove the session cookie                       |

Timeline, stats, and locations support:

```text
provider=pathao,steadfast
from=2026-07-01
to=2026-08-09
status=completed
sort=desc
limit=50
page=1
```

Examples:

```text
GET /api/users/USR001/timeline?provider=pathao&from=2026-07-01&to=2026-08-09
GET /api/users/USR001/timeline?provider=pathao,steadfast&limit=25&page=2
GET /api/users/USR001/stats?from=2026-05-01
GET /api/users/USR001/locations?provider=foodi
```

In development only, append `simulateProviderFailure=pathao` to timeline/stats/locations or provider-status requests to demonstrate graceful partial failure.

Example timeline metadata:

```json
{
  "success": true,
  "data": [{ "id": "TRIP0009", "provider": "pathao", "activityType": "ride" }],
  "meta": {
    "total": 19,
    "page": 1,
    "limit": 50,
    "pages": 1,
    "providerFailures": []
  }
}
```

## Project structure

```text
src/
├── app/
│   ├── api/                 # Validated Node.js route handlers
│   ├── users/               # Directory, profile, map, charts, report
│   ├── dashboard/           # Search and source overview
│   ├── geofences/ cases/ audit/ data-sources/ about/ login/
│   └── globals.css
├── components/
│   ├── analytics/ map/ profile/ geofence/ cases/ audit/ layout/
│   └── ui.tsx
├── lib/
│   ├── data/                # Schemas, parsing, indexing, normalization
│   ├── providers/           # Four CSV-backed adapters
│   ├── __tests__/           # Utility/data/geofence tests
│   ├── activity.ts analytics.ts geofence.ts format.ts
│   └── types.ts
└── test/
data/                        # Server-only CSV sources
proxy.ts                     # Next.js 16 session gate
```

## Vercel deployment

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Select the Next.js framework preset if it is not detected automatically.
4. Deploy. No environment variables are required.

`next.config.ts` traces `data/*.csv` into API/server output. The relevant routes explicitly use the Node.js runtime because the loader uses `node:fs`.

## Testing

Vitest covers CSV parsing, phone/User ID lookup, event-time latest calculation, provider normalization, date/provider filtering, Haversine distance, inside/outside classification, and entered/exited transitions.

## Limitations and future improvements

- The included authentication is not suitable for production identity or authorization.
- Cases, notes, bookmarks, geofences, and audit events are local to one browser profile.
- CSV caching is per server instance; serverless instances do not share memory.
- OpenStreetMap tiles require network access in the browser. Activity data remains local to the app.
- Sequence lines connect discrete historical records and are not exact routes.
- A production evolution could add a real identity provider, encrypted persistent storage, server-side authorization/audit, and formally authorized provider adapters.

Provider names are used only as source labels. The interface and icons are generic and do not copy provider products.
////