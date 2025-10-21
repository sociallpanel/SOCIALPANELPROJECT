Deploy guide — Frontend (GitHub Pages) and Backend (free hosting)

Goal: host the static `client/` on GitHub Pages (free) and run the Node backend on a free hosting provider (Render, Railway, or Heroku). SQLite is file-based — for reliable production use, migrate to a managed DB (Postgres). This guide shows a minimal path to get both online.

A. Frontend — GitHub Pages (free)
1. Follow `client/README.md` to push your repo to GitHub. The included GitHub Action will publish `client/` to `gh-pages` branch when you push to `main`.
2. After the workflow completes, enable Pages to serve the `gh-pages` branch if not automatically set. Your site will be at:
   `https://<your-username>.github.io/<repo-name>/`

B. Backend — Deploy to Render.com (free tier)
Render is straightforward for Node apps and supports environment variables.

1. Sign up / log in to Render (https://render.com) and click "New" → "Web Service".
2. Connect your GitHub repo and choose the repo. Branch: `main`.
3. Build command: `npm install`
   Start command: `npm start`
4. Add environment variables in Render dashboard (same keys as `.env`):
   - `JWT_SECRET` = (random string)
   - `PORT` = `8080` (optional)
5. Deploy. Render will build and start your server.

Caveats:
- Render’s filesystem is ephemeral; the `data.db` file will not persist across deploys. For production use, create a managed Postgres DB and update the server to use it.

Alternative free hosts:
- Railway.app (free credits) — similar steps, supports persistent volumes on paid plans.
- Vercel (serverless functions) — not ideal for SQLite.
- Heroku (historically easy, but free dynos removed) — not recommended for free deployment.

C. Quick tests after deployment
- Frontend: visit `https://<your-username>.github.io/<repo-name>/` and confirm pages load.
- Backend: `curl https://<render-service-url>/api/balance?email=test@example.com`

D. Next recommended improvements (short list)
- Replace SQLite with Postgres (managed) for persistence.
- Implement Flutterwave server-side verification webhook before crediting balances.
- Protect `/api/credit` so only your backend or Flutterwave can call it (use secret verification or JWT).

If you want, I can:
- Create a Render deployment template (render.yaml) and action files.
- Modify server to use Postgres and provide a migration script.
- Wire `index.html` and `signup.html` to use the server API for a complete login/signup flow.
