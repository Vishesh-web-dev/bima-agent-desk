# Bima Agent Desk

A phone-friendly website for a new National Insurance (NICL) agent. It has three parts:

- **Plan** (`/#plan`): where customers come from, a 30-day checklist, rough commission per policy, and the rules to follow.
- **Messages** (`/#messages`): WhatsApp messages in English, Hindi and Gujarati, with Copy and Open-in-WhatsApp buttons.
- **Clients** (`/#clients`): a renewal tracker with a one-tap WhatsApp reminder for each person. A passcode protects it.

Plan and Messages are open to anyone with the link. The client list needs the passcode.

## Files

```
public/          static site (index.html, styles.css, app.js, icons, manifest)
api/clients.js   Vercel Function: GET / POST / PUT / DELETE /api/clients
lib/clients.js   API logic: passcode check, validation, SQL (creates the table itself)
vercel.json      output dir, security headers, noindex
```

## Deploy on Vercel (about 10 minutes)

1. **Put the code on GitHub** (easiest), or deploy straight from this folder with `npx vercel`.
   ```bash
   cd ~/personalProject/bima-agent-desk
   git init && git add . && git commit -m "Bima Agent Desk"
   # create an empty repo on github.com, then:
   git remote add origin https://github.com/<you>/bima-agent-desk.git
   git push -u origin main
   ```
2. **Import it in Vercel**: vercel.com → Add New → Project → pick the repo. The framework preset shows as **Other**. Leave the build command empty and click **Deploy**.
3. **Add the database**: open the project → **Storage** → **Create Database** → **Neon** (Serverless Postgres) → free plan → connect it to this project. This adds `DATABASE_URL` for you. The `clients` table is created on first use.
4. **Set the passcode**: Project → **Settings → Environment Variables** → add `APP_PASSCODE` with something long (8+ characters, not a birthday), for Production and Preview.
5. **Redeploy**: Deployments → the latest one → ⋯ → **Redeploy**. New environment variables only apply after a redeploy.
6. **Send your brother** the `https://<project>.vercel.app` link and the passcode, in separate messages.

### On his phone

- Open the link → **Clients** → enter the passcode once. The phone remembers it until he taps **Lock this phone**.
- Add it to the home screen so it opens like an app: Chrome → ⋮ → **Add to Home screen** (Android), or Safari → Share → **Add to Home Screen** (iPhone).
- Fill in **Your name** and **Your phone** in Messages once, so reminders are signed.

## Without a database

If `DATABASE_URL` isn't set, the site still works, but clients are saved in that phone's browser only, and the page shows a warning. Once you connect Neon, the Clients page offers **Upload them**, which moves those entries into the database.

## Backups

On the Clients page, tap **Download backup (CSV)**. The file opens in Excel or Google Sheets. Neon also keeps its own restore history.

## Run locally

```bash
npm install
cp .env.example .env.local      # fill in DATABASE_URL and APP_PASSCODE
npx vercel dev                  # needs `npx vercel login` once
```

## Changing things

- Message wording: the `TPL` list near the top of `public/app.js` (one entry per message, with `en`, `hi` and `gu` text).
- Plan text: `public/index.html`, inside `<section id="view-plan">`.
- To change the passcode, update `APP_PASSCODE` in Vercel and redeploy. Every phone will ask for the new one.

## Privacy

The client list holds people's names and phone numbers. Keep the passcode private. Only save details of people who agreed to it. Use **Lock this phone** on a shared phone. The site sends `noindex` headers, so search engines won't list it.
