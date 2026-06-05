# Deploy Asicom to asicom.cramba.ro

_Date: 2026-06-05 · Target: production · Estimated time: ~45 min one-time_

## Why Render, not Cloudflare nameservers

We held on the CF Tunnel path because moving `cramba.ro` nameservers to Cloudflare risks
breaking the main `cramba.ro` site (Netlify) and any business email. Render keeps the existing
NS1 / Netlify DNS untouched — we just add **one CNAME record** for `asicom.cramba.ro` pointing
at our Render service. Zero risk to the rest of the domain.

## Step 1 — Create the Render account

If you don't already have one, sign up at https://render.com using the email on your GitHub
account (the same one that owns `luciancramba/asicom`). Render's free tier covers everything
except the disk; the disk needs the Starter plan (~$7/mo + ~$0.25/mo for 1 GB).

## Step 2 — Connect the GitHub repo

Render dashboard → **New +** → **Blueprint** → select the `asicom` repo. Render reads our
`render.yaml`, plans the service + disk, and asks you to confirm. The blueprint provisions:

- One **web service** running our Dockerfile (Frankfurt region, closest to Romania)
- One **1 GB disk** mounted at `/data` for SQLite + uploaded photos / PDFs
- Auto-deploys from `main` on every push

## Step 3 — Set the three secrets

The blueprint declares three secrets with `sync: false`, meaning Render won't manage their
values from the file — you set them once in the dashboard and they persist across deploys.

| Env var | What it is | How to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | The Claude key the production server uses | Use a new key (rotate from your local key if you want) at https://console.anthropic.com/settings/keys |
| `ASICOM_PASSWORD_HASH` | scrypt hash of Tripon's login password | `cd ~/asicom/apps/web && node scripts/hash-password.mjs '<new-strong-password>'` |
| `SESSION_SECRET` | Cookie signing secret | `openssl rand -hex 32` |

Pick a **new strong password** for production (don't reuse `asicom2026`). Share it with Tripon
over a secure channel.

In the Render dashboard: **Environment → Add Environment Variable** for each of the three.
Press **Save Changes** at the bottom — the service will redeploy.

## Step 4 — First deploy

Render builds the Dockerfile (`apt-get` installs `libjpeg-turbo-progs` for the photo-rotation
action), runs `npm ci`, builds the shared package + Next.js, then starts. First build takes
~6 min; subsequent deploys are ~3 min thanks to Docker layer caching.

When the service goes green, Render gives you a default URL like
`https://asicom-xxxx.onrender.com`. **Open it in a browser, log in once with the new password**
to confirm: extraction works, uploads land in `/data/uploads`, SQLite writes go to
`/data/asicom.db`.

## Step 5 — Attach `asicom.cramba.ro` as a CNAME

In Render dashboard for the service: **Settings → Custom Domain → Add Custom Domain →
`asicom.cramba.ro`**. Render shows you the CNAME target (something like
`asicom-xxxx.onrender.com.`).

In your DNS provider (Netlify, since cramba.ro is on NS1 via Netlify):
1. Netlify dashboard → cramba.ro → **DNS settings**
2. **Add a new record** of type **CNAME**
3. Name: `asicom`
4. Value: the target Render gave you (trailing dot included if shown)
5. TTL: 3600 (default fine)

Save. Render polls DNS — when it sees the CNAME, it issues a Let's Encrypt certificate
automatically (usually 1–2 min). Once green, `https://asicom.cramba.ro` serves Tripon's app.

## Step 6 — Tell Tripon

Send him the new URL + the new password. He can immediately archive the
`provincial-context-says-answers.trycloudflare.com` URL and use the proper one.

## Operational notes

- **Auto-deploy**: every push to `main` triggers a Render deploy. To stop, dashboard →
  Settings → Auto-Deploy → Off.
- **Logs**: Render dashboard → service → **Logs** tab. Tail in real time.
- **Disk inspection**: Render dashboard → service → **Shell** tab → you get a remote shell on
  the running container. `ls /data/uploads`, `sqlite3 /data/asicom.db`.
- **Rollback**: dashboard → **Deploys** tab → click any green deploy → **Rollback to this
  deploy**. Disk content stays.
- **Backups**: Render disks are persistent but not auto-backed-up. Schedule a daily
  `cp /data/asicom.db /tmp/backup-$(date).db` cron later if needed.
- **Scaling**: not needed — Starter is fine for 139 polițe/lună. Bump to Standard ($25/mo) only
  if response times degrade.

## What stays the same vs the local dev

- Same `npm run dev` workflow locally; production uses `npm run start` after `next build`.
- Same DB schema (Drizzle migrations apply at first connection per `getDb()` logic in `lib/db.ts`).
- Same env-var names — just different values.

## What's different

- Photo / PDF uploads land on the Render disk at `/data`, not `./data` like locally.
- The `jpegtran` binary is installed via apt; rotation works the same as on Mac (`sips`
  fallback is dead code in this image but harmless).
- No `cloudflared`. The tunnel goes away once the CNAME flips.
