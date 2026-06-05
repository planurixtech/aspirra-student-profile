# Aspirra Student Profile

A student study tracker with a React frontend and an ASP.NET Core REST API backend.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS — deployed on **Vercel**
- **Backend**: ASP.NET Core 8 Web API + Entity Framework Core + PostgreSQL — deployed on **Render**

## Run Locally

**Prerequisites:** Node.js, .NET 8 SDK, PostgreSQL

### Backend

```bash
cd backend/src/Aspirra.Api
dotnet run
# API available at http://localhost:5080
```

### Frontend

```bash
npm install
VITE_API_URL=http://localhost:5080 npm run dev
```

## Deployment

- **Backend** → Render (auto-deploys from `render.yaml` via GitHub)
- **Frontend** → Vercel (auto-deploys from `vercel.json` via GitHub)

Set the `VITE_API_URL` environment variable in the Vercel dashboard to your Render backend URL.
