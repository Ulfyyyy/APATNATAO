# APATNATAO GymLog

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
