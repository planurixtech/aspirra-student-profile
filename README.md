# Aspirra Student Profile

A student study tracker with a React frontend and an ASP.NET Core REST API backend.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS — deployed on Vercel
- **Backend**: ASP.NET Core 8 Web API, Entity Framework Core, PostgreSQL — deployed on Render

## Run Locally

**Prerequisites:** Node.js, .NET 8 SDK, PostgreSQL

### 1. Backend

```bash
cd backend/src/Aspirra.Api
dotnet run
```

API runs at `http://localhost:5080`

### 2. Frontend

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:5080
```

Then start the dev server:

```bash
npm install
npm run dev
```

## Deployment

- **Backend** → Render (configured via `render.yaml`)
- **Frontend** → Vercel (configured via `vercel.json`)

Set `VITE_API_URL` in the Vercel dashboard to point to your Render backend URL before deploying.
