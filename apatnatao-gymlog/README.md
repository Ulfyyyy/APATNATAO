# APATNATAO GymLog

Check-in logging for a gym. Static frontend in `public/`, Vercel Functions in `api/`, Postgres on Neon.

## Deploy

1. Put this folder in a GitHub repository.
2. In Vercel, choose Add New Project and import the repository. Framework preset: Other. No build command.
3. Add a database: in the Vercel project, open Storage or the Marketplace, add Neon, and connect it to the project. This creates the `DATABASE_URL` variable. If you use neon.tech directly, add `DATABASE_URL` yourself under Settings, Environment Variables, using the connection string from the Neon dashboard.
4. Before the first visit, add two more variables so the staff account is yours: `STAFF_EMAIL` and `STAFF_PASSWORD`. If you skip this, the test login is `staff@apatnatao.com` with password `staff123`. Change it before real use.
5. Deploy (or redeploy). The tables are created automatically on the first request.

## Use

- Staff log in with the staff email and password. They register walk-ins (temporary password `welcome123`), add membership time, suspend accounts, and scan member IDs at the desk.
- Members create an account with name, email, mobile number, and a password. Staff then add membership time at the desk, and check-in is allowed.
- The gym floor capacity is the `cap` number at the top of the script in `public/index.html`.

## Local test

```
npm i -g vercel
npm install
vercel env pull .env.local
vercel dev
```

## Demo mode

If the page cannot find the API (for example the file is opened directly, or no server is deployed), it switches to demo mode and keeps accounts in the browser. Staff login in demo mode: `staff@apatnatao.com`, password `staff123`. When the API exists, the app always uses it, even if the database reports an error.
