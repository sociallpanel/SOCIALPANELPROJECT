Deploying the frontend to GitHub Pages (free)SocialPanelProject - Backend



This `client/` folder contains the static HTML files for your site. The repository includes a GitHub Actions workflow that will publish `client/` to the `gh-pages` branch whenever you push to `main`.This backend provides persistent user accounts, JWT authentication, balances, and a payment-crediting endpoint using SQLite.



Step-by-step (exact commands for PowerShell):Files added/changed:

- `server.js` - Express server with SQLite (better-sqlite3), JWT auth, signup/login, balance endpoints, and idempotent crediting.

1. Initialize Git (if you haven't already) and commit your changes:- `package.json` - dependencies and start/dev scripts.

- `.env.example` - environment variable examples.

```powershell

cd C:\Users\addis\Desktop\HTML100\SOCIALPANELPROJECTQuick start (Windows PowerShell):

git init

git add .1. Open PowerShell and navigate to the project folder:

git commit -m "Initial project structure: client and server"

``````powershell

cd C:\Users\addis\Desktop\HTML100\SOCIALPANELPROJECT

2. Create a new GitHub repository (you can do this on github.com). Name it e.g. `socialpanelproject`.```



3. Add the GitHub remote and push `main`:2. Copy `.env.example` to `.env` and edit the `JWT_SECRET` value.



```powershell```powershell

git branch -M maincopy .env.example .env

git remote add origin https://github.com/<your-username>/socialpanelproject.gitnotepad .env

git push -u origin main```

```

3. Install dependencies (Node.js & npm required):

4. Wait for GitHub Actions to run the `Deploy client to GitHub Pages` workflow.

```powershell

5. After Actions completes, enable GitHub Pages (if necessary):npm install

   - Go to your repository → Settings → Pages```

   - Source: Branch `gh-pages` → `/ (root)`

   - Save. The site URL will be `https://<your-username>.github.io/socialpanelproject/`.4. Start the server:



Notes:```powershell

- The workflow publishes `client/` folder contents. Keep your static files there.npm run start

- If you update the client and push to `main`, the workflow will republish the site.```

- For custom domains, add DNS records and configure the Pages settings.

For development with auto-reload (requires nodemon):

```powershell
npm run dev
```

Endpoints overview:
- POST `/api/signup` { email, password } → creates user, returns JWT
- POST `/api/login` { email, password } → returns JWT
- POST `/api/flutterwave-pay` { amount, email } → returns a link to `payment-success.html` (keeps your current frontend flow)
- GET `/api/balance?email=...` or with Authorization Bearer token → returns balance
- POST `/api/credit` { email, amount, txRef } → idempotently credits user's balance (txRef unique)

Notes:
- The server creates a `data.db` SQLite file in the project folder.
- For a production Flutterwave integration, verify transactions server-side using Flutterwave webhooks or the verification API before calling `/api/credit`.
- The server does not modify your frontend files — it is designed to work with your existing pages.

If you want, I can now:
- Wire `index.html` and `signup.html` to call `/api/login` and `/api/signup` instead of localStorage (I won't change files unless you confirm), or
- Leave the frontend untouched and you can integrate the server-side calls when ready.
