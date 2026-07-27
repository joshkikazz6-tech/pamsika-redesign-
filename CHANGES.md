# CHANGES.md — Zero-Drift Patch Audit Log

---

## CHANGE 1 — Commission Idempotency Guard (NEW FIELD)

**File:** `backend/app/models/order.py`
**Line:** After `deleted_at` column (~line 43)

**BEFORE:**
```
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

**AFTER:**
```
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    commissions_paid: Mapped[bool] = mapped_column(default=False, nullable=False)
```

**Reason:** Without this flag, calling PATCH /admin/orders/{id} with status=completed twice
would credit commissions twice. The commissions_paid boolean lets the commission block
check-and-set atomically, preventing double-crediting on any repeat call.

---

## CHANGE 2 — Commission Idempotency Check in patch_order

**File:** `backend/app/api/v1/endpoints/admin.py`
**Line:** ~213 (the `if payload["status"] == "completed"` condition)

**BEFORE:**
```
        if payload["status"] == "completed" and old_status != "completed":
            for item in order.items:
                ...
                aff_user.affiliate_sales += 1
```

**AFTER:**
```
        if payload["status"] == "completed" and old_status != "completed" and not order.commissions_paid:
            order.commissions_paid = True  # IDEMPOTENCY GUARD — set before crediting
            aff_totals: dict = {}  # accumulate per-affiliate before applying
            ...
            for aff_key, entry in aff_totals.items():
                aff_user.affiliate_sales += 1   # once per order
                referrer.affiliate_sales += 1   # once per order
```

**Reason:** The original guard only checked old_status != "completed". Status cycling
(completed -> pending -> completed) would re-trigger commissions. The commissions_paid
flag prevents any second credit regardless of how many times status is toggled.

---

## CHANGE 3 — affiliate_sales Over-Count Fix (per-item to per-order)

**File:** `backend/app/api/v1/endpoints/admin.py`
**Lines:** ~213–247 (entire commission loop in patch_order)

**BEFORE:**
```
        for item in order.items:  # loop over items
            ...
            aff_user.affiliate_sales += 1     # incremented ONCE PER ITEM
            referrer.affiliate_sales += 1     # incremented ONCE PER ITEM
```

**AFTER:**
```
        # Accumulate totals per affiliate in aff_totals dict (keyed by aff_user.id)
        # Apply after loop — once per affiliate per order:
        for aff_key, entry in aff_totals.items():
            aff_user.affiliate_sales += 1   # ONCE per order
            referrer.affiliate_sales += 1   # ONCE per order
```

**Reason:** Original code incremented affiliate_sales inside the for-item loop.
An order with 3 items would add 3 to the sale count instead of 1. Fix accumulates
commission totals per affiliate in a dict, then applies balance + sales increment
after the loop.

---

## CHANGE 4 — Referral (5%) Commission Base Fixed in Dashboard sales_history

**File:** `backend/app/api/v1/endpoints/affiliate.py`
**Line:** Inside sales_history list comprehension in dashboard() (~line 123)

**BEFORE:**
```
                    "commission": round(item.unit_price * item.quantity * 0.05, 2),
```

**AFTER:**
```
                    "commission": round(item.unit_price * item.quantity * float(item.product_snapshot.get("commission_percent", 5)) / 100, 2),
```

**Reason:** Hardcoded 0.05 disagrees with patch_order which uses commission_percent from
product snapshot. Products with rates other than 5% (e.g., 10%, 15%) showed wrong figures
in the affiliate dashboard. Fixed to use the same field as the commission engine.

---

## CHANGE 5 — New Alembic Migration for commissions_paid Column

**File:** `backend/alembic/versions/0003_orders_commissions_paid.py` (NEW FILE)

**BEFORE:** File did not exist.

**AFTER:** Idempotent migration that adds commissions_paid BOOLEAN NOT NULL DEFAULT false
to the orders table, guarded by a column-existence check.

**Reason:** The new commissions_paid field on the Order model (CHANGE 1) requires a DB
migration. server_default="false" ensures all existing orders start as unpaid — they
remain eligible for commission crediting on their first completed transition.

---

## Verification Checklist

| Check | Result |
|---|---|
| Direct order creates Order + OrderItems | PASS — flush + re-query guards already present |
| Cart order creates Order + OrderItems | PASS — same guard pattern |
| Order appears in admin query | PASS — list_all_orders unchanged |
| Commission triggered ONLY once | PASS — commissions_paid flag prevents re-trigger |
| Referral (5%) correctly applied | PASS — accumulated per-affiliate, applied after item loop |
| affiliate_sales counted per order (not per item) | PASS — moved outside item loop |
| Dashboard shows correct commission per sale | PASS — uses commission_percent from snapshot |
| No existing endpoint broken | PASS — only targeted lines modified |
| No new dependencies introduced | PASS |
| No frontend code modified | PASS |
| No routes renamed or restructured | PASS |

---

## CHANGE 6 — Frontend Re-integration (New "Malawi's Premium Marketplace" Redesign)

**Context:** A newer AI Studio–generated frontend was dropped in to replace the previously
integrated one. It kept the same visual design system but reworked several screens with
richer mock-data-driven UI (dark mode, a client-side smart recommendation feed, full
post-comment threads, and self-contained demo flows for Seller/Dolo onboarding). This
change re-wires that new frontend to the real backend, reusing the existing `lib/api.ts`
API client and auth layer wholesale.

**Files carried over unchanged from the previous integration:**
`lib/api.ts`, `context/AuthContext.tsx`, `components/AuthModal.tsx` (wired into `main.tsx`
via `AuthProvider`).

**Files rewritten:**
- `App.tsx` — full rewrite: real data loading (products, cart, favorites, conversations,
  seller/admin/affiliate dashboards) merged with the new UI's dark-mode state and
  shared-product-link tracing.
- `lib/adapters.ts` — `adaptPost`/`adaptComment` extended to map the backend's nested
  comments into the new `PostComment[]` shape the UI now expects.
- `components/SettingsView.tsx` — replaced the new mock-only version with the previously
  wired version (real user, real password change, real sign out), adapted to the new
  App-level `isDarkMode` boolean instead of the old `ThemeContext`.

**Files patched (component logic had quietly gone "self-contained" — using its own
`localStorage` demo state instead of calling out to a parent handler):**
- `components/DoloView.tsx` — added optional `isAffiliate` / `onJoin` / `onWithdraw`
  props. When provided, they drive real backend join/withdraw instead of the
  `localStorage` demo fallback (which is now only used if `isAffiliate` is `undefined`).
- `components/SellerHubView.tsx` — same pattern: added optional `sellerStatus` /
  `balance` / `onApply` / `onWithdraw`, plus a real "Application Under Review" screen
  for the `pending` status (the new UI only had "not a seller" vs "full dashboard").
- `components/ChatDetailView.tsx` — removed a client-only simulated "merchant is
  typing… auto-reply" that would otherwise have double-posted as a real message from
  the *buyer's* account; `onSendMessage` is now awaited and shows a real "Sending…"
  state instead.

### Known scope limits in this pass

- **Comment likes** are not persisted — the backend has no per-comment like endpoint.
  Toggling a comment like updates local UI state only and resets on reload.
- **Admin post product-tagging / category tag** (`taggedProduct`, `categoryTag` on a
  `CommunityPost`) is not in the backend's post schema. An admin broadcast post's text
  and image are posted and persisted normally; the tagged product/category are attached
  client-side to the just-created post for the current session only.
- **Product view counts** are a client-side-only affordance (`recommendationEngine.ts`
  tracks views in `localStorage` for the Smart Recommendation Feed) — there's no
  "increment views" endpoint to persist to.
- **AdminView's new mock-only tabs** — Affiliates list, Promo Codes, Inbox, and
  Notifications panels — ship their own local mock arrays and aren't in `AdminView`'s
  props contract at all. They were left as-is (same "known limitation" category as the
  original integration's Promo Codes/Inbox placeholders); wiring them up would mean
  extending `AdminView`'s prop surface to accept `Api.adminAffiliates()`,
  `Api.adminListPromos()`/`adminCreatePromo`/`adminDeletePromo`,
  `Api.adminAllConversations()`/`adminSearchUsers`/`adminStartConversation`, and
  `Api.broadcastNotification()` — all of which already exist on the backend and in
  `lib/api.ts`, just not called from these tabs yet.
- **Cart checkout** now creates a real order via `POST /orders` (so it's visible to
  sellers/admin) and *also* best-effort logs an inquiry message to the admin inbox
  through the existing conversation system, matching the new UI's "send order via
  WhatsApp/Messenger/Email/Pa_mSikA chat" framing. The `pamsika` UI-level channel maps
  to the backend's `whatsapp` payment-method value (the API only accepts
  `whatsapp` / `email` / `messenger`).

### Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | PASS — 0 errors across 26 files |
| `vite build` (production) | PASS |
| `python3 -m py_compile` on all backend files | PASS |
| Not run: end-to-end against a live database | Not verified in this pass |
