SocialPanelProject - Backend

This backend provides persistent user accounts, JWT authentication, balances, and a payment-crediting endpoint using SQLite.

Files added/changed:
- `server.js` - Express server with SQLite (better-sqlite3), JWT auth, signup/login, balance endpoints, and idempotent crediting.
- `package.json` - dependencies and start/dev scripts.
- `.env.example` - environment variable examples.

Quick start (Windows PowerShell):

1. Open PowerShell and navigate to the project folder:

```powershell
cd C:\Users\addis\Desktop\HTML100\SOCIALPANELPROJECT
```

2. Copy `.env.example` to `.env` and edit the `JWT_SECRET` value.

```powershell
SocialPanelProject - Backend

This backend provides persistent user accounts, JWT authentication, balances, and a payment-crediting endpoint using SQLite. It is designed to run as a standalone Node service (e.g., on Render).

Quick start (Windows PowerShell):

1. Open PowerShell and navigate to the project folder:

```powershell
cd C:\Users\addis\Desktop\HTML100\SOCIALPANELPROJECT\server
```

2. Copy `.env` if needed and edit the `JWT_SECRET` value (or set the env var in your host):

```powershell
copy ..\.env .env
notepad .env
```

3. Install dependencies (Node.js & npm required):

```powershell
npm install
```

4. Start the server:

```powershell
npm run start
```

For development with auto-reload (requires nodemon):

```powershell
npm run dev
```

Render deployment (recommended for free hosting):
1. Create an account at https://render.com and create a new Web Service.
2. Connect your GitHub repo and select the `server` folder as the root (Render supports monorepos; you can specify a build command that runs in the `server/` folder).
3. Build command: `npm install`  Start command: `npm start`.
4. Add environment variables in Render dashboard (JWT_SECRET, PORT if needed).

Docker alternative (if you prefer container deployment):
1. Create a Dockerfile in `server/` (example below) and build/push to a container registry.

Example Dockerfile:
```
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
```

Notes & recommendations:
- SQLite (`data.db`) is file-based; use Postgres for production persistence. Render's free plan is OK for staging but use a managed DB for production.
- Secure the `.env` values and never commit secrets. `.gitignore` excludes `.env` and `data.db`.
- If you want, I can add a `render.yaml` manifest for one-click deploys (I added a draft in the repo). I can also wire your frontend to authenticate and store JWT.

If you want me to make the backend deployable in one click (render.yaml completed and repo settings configured), say "prepare render" and I will finalize the manifest and provide exact Render UI steps.
