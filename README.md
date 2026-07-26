# Pa_mSikA — Integrated Build

This is the Pa_mSikA FastAPI backend wired up to the new React/Vite/TypeScript
frontend ("Pa_mSikA — Malawi's Premium Marketplace"). The frontend's visual
design was **not changed** — every edit was to connect its buttons, forms,
and views to real backend data instead of the mock arrays it shipped with.

```
pamsika-integrated/
├── backend/          FastAPI + PostgreSQL API (unchanged in spirit, a few bugfixes + 1 new endpoint)
├── frontend/          React + Vite + TypeScript SPA (newly integrated)
├── Dockerfile          Combined build: frontend → dist/, backend serves it — USE THIS for deploy
├── docker-compose.yml   nginx + api + redis, for local/self-hosted stacks
├── nginx.conf           Optional reverse proxy in front of the api container
└── .env.example         Copy to .env and fill in real values
```

## What changed, and why

The new frontend was a **pure UI prototype** — every product, order, chat
message, and dashboard number was hardcoded mock data, and there was no
login/register screen at all (every screen assumed a hardcoded "John Doe").
To make it a real, working app backed by your existing API, the following
was added:

1. **`frontend/src/lib/api.ts`** — a typed client covering every backend
   endpoint (auth, cart, orders, favorites, affiliate/"Dolo", seller, admin,
   community, messages, reviews, promo codes, uploads, notifications,
   password reset). Handles silent access-token refresh and guest-cart
   sessions automatically.
2. **`frontend/src/lib/adapters.ts`** — converts backend JSON into the
   exact shapes the existing UI components already expect, so component
   code didn't need to be redesigned.
3. **Login / Register** — `AuthContext.tsx` + `AuthModal.tsx` are new
   (there was no auth UI at all before), styled to match the existing
   purple/serif design system. Every screen that needs a signed-in user now
   prompts this modal instead of assuming one.
4. **Every "action" button now does something real** — checkout places a
   real order, "Add to cart" hits the real cart API, the Dolo affiliate
   dashboard shows real click/sales/commission numbers, seller product
   submission goes into the real admin approval queue, admin approve/reject/
   broadcast/export buttons call the real endpoints, and so on.
5. **`App.tsx`** was rewritten as the data-loading orchestrator: it fetches
   real products/cart/orders/favorites/community/messages/seller/admin/
   affiliate data based on who's signed in, and passes real handlers down —
   the individual view components' JSX/styling were left alone.

### Backend fixes found while integrating

Reading the backend closely to match every API contract turned up a few real
bugs, which are now fixed:

- `GET /api/v1/admin/affiliates` referenced `User.affiliate_referrals`, a
  column that doesn't exist on the model — it would 500 on every call. Now
  computes sub-affiliate referral counts from `referred_by` correctly.
- The community "like" endpoint only ever supported liking a post, never
  unliking — there was no way to toggle it off. Added
  `DELETE /api/v1/community/posts/{id}/like`.
- There was no way for a signed-in user to change their own password (only
  the forgot-password email flow existed). Added
  `POST /api/v1/auth/change-password`.
- `POST /api/v1/affiliate/withdrawal` expects `payout_details` per its
  Pydantic schema; the new frontend's withdrawal form was going to send
  `details`, which would have failed validation. Fixed in the API client.

### Known scope limits (by design, not oversights)

A few screens in the original design were static mockups with **no
interactive elements at all** (no inputs, no buttons) — wiring them up
would mean designing new UI, which was explicitly out of scope:

- Admin **Promo Codes** and **Inbox** tabs are descriptive placeholders in
  the original design. The backend endpoints they'd need
  (`/promo/admin/*`, `/messages/admin/*`) already exist and are in
  `api.ts`, ready for whenever that UI gets built.
- The small "Admin Chat" panel inside the Seller Hub is a separate,
  simplified mockup from the main Messages system; the main Messages tab is
  fully wired to real conversations.
- Community post **comments** only have a count + a "Comments feature
  open!" toast in the design — no comment thread UI exists to wire up.
  The backend comment endpoints exist and work today via the API.

## Deploying

### Option 1 — Docker Compose (recommended for self-hosting)

```bash
cp .env.example .env   # fill in real DATABASE_URL, SECRET_KEY, ENCRYPTION_KEY, etc.
docker-compose up -d --build
```

This builds the frontend, bundles it into the `api` container (FastAPI
serves both the SPA and `/api/v1/*` from one process — no CORS needed), and
puts nginx in front for TLS/gzip/security headers. Visit `http://localhost`.

### Option 2 — Single container, no nginx (e.g. Render, Fly.io, Railway)

```bash
docker build -t pamsika .
docker run -p 8000:8000 --env-file .env pamsika
```

Same combined image as above, just without the nginx layer — point your
platform's HTTPS/proxy layer straight at port 8000. This matches the
existing single-service Render deployment style described in
`backend/README.md`.

### Option 3 — Frontend and backend deployed separately

Use `backend/Dockerfile` (API-only, no bundled frontend) for the API, and
deploy `frontend/` to something like Vercel/Netlify/Cloudflare Pages with
its build command `npm run build` and output directory `dist`. You'll need
to:
- Add the frontend's deployed origin to `ALLOWED_ORIGINS` in `.env`.
- Point the frontend at the API's public URL — the API client defaults to a
  same-origin relative `/api/v1`, so a cross-origin deploy needs that
  adjusted in `frontend/src/lib/api.ts`'s `API_BASE` constant.

## Local development (no Docker)

```bash
# Terminal 1 — backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env   # fill in a real local Postgres URL
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev   # http://localhost:3000, proxies /api and /uploads to :8000
```

## Verified before delivery

- `npx tsc --noEmit` — 0 TypeScript errors across the frontend.
- `npm run build` — production Vite build succeeds cleanly.
- `python -m py_compile` — every backend `.py` file compiles.
- Backend app imports successfully and its OpenAPI schema generates for all
  81 routes (i.e. every Pydantic request/response model is valid).

What wasn't possible to verify in this environment: an actual end-to-end run
against a live Postgres database (no outbound DB access here), so please do
a full smoke test — register, browse, add to cart, checkout, apply as a
seller, submit a product, approve it as admin, join as a Dolo affiliate —
against your real database before going live.
"# pamsika-redesign-" 
