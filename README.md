# EmpFleet

Working Next.js 15 prototype for company car booking and trip management. The UI talks to a mock REST API from json-server.

## Prerequisites

- Node.js 18+
- Two terminals (API + web app)

## Setup

```bash
cd D:\company-car-booking
npm install
```

## Run

Terminal 1 — mock API:

```bash
npm run json-server
```

This serves `db.json` at `http://127.0.0.1:3001`.

Terminal 2 — Next.js app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@company.com | Admin123! |
| Employee | farhana@company.com | Emp123! |
| Employee | imran@company.com | Emp123! |
| Driver | karim@company.com | Drv123! |
| Driver | shahid@company.com | Drv123! |
| Driver | rina@company.com | Drv123! |

`nadia@company.com` / `Emp123!` is a **pending** employee and cannot sign in until an admin approves the registration.

## What to try

1. Sign in as Farhana and open **My requests** (pending, assigned, completed).
2. Sign in as admin: approve registrations, assign the pending Uttara trip, inspect the calendar and live map.
3. Sign in as Karim to see the in-progress Motijheel trip; Shahidul has an assigned airport drop to Accept.
4. Open **Live map** as admin (seeded GPS points). Open **Replay route** on the completed Dhanmondi → Uttara trip.

## Stack

- Next.js 15 App Router, Tailwind CSS v3
- Formik + Yup on every form
- json-server (`db.json`)
- Leaflet + React-Leaflet with OpenStreetMap tiles
