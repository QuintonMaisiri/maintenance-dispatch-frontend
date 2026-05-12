# Maintenance Dispatch — Frontend

Next.js 15 frontend for the Maintenance Dispatch System. Consumes a Django REST
Framework backend over session-cookie auth.

- **Live app:** https://maintenance-dispatch-frontend.vercel.app/
- **Backend repo:** https://github.com/QuintonMaisiri/maintenance-dispatch-frontend.git
- **Backend API:** https://maintenance-dispatch-api.onrender.com

## Demo credentials

| Role | Username | Password |
|---|---|---|
| Property Manager | `manager` | `manager123` |
| Maintenance Staff | `staff1` | `staff12345` |
| Resident | `resident` | `resident123` |

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Session-cookie authentication via a custom `fetch` wrapper

## Running locally

Requires the Django backend running on `http://localhost:8000`.

```bash
npm install
cp .env.local
npm run dev
```

Open http://localhost:3000.

## Project layout