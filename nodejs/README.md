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
copy .env.example .env
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
