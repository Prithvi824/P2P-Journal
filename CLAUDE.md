# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

P2P Trade Journal — a full-stack app for tracking USDT P2P trading cycles (buy → deposit → sell). Users log individual trade cycles through three sequential phases, and the backend computes derived P&L fields on every write.

## Repository Structure

```
backend/    FastAPI + SQLAlchemy async Python API
frontend/   React + TypeScript + Vite SPA
```

## Backend

### Dev Commands

All commands run from `backend/`:

```bash
# Install dependencies (uses uv or pip)
pip install -e .

# Run dev server
uvicorn app.main:app --reload

# Run migrations
alembic upgrade head

# Generate a new migration after model changes
alembic revision --autogenerate -m "description"
```

The app is the `app` object exported from `backend/app/main.py` (created by `create_app()`).

### Architecture

- **Entry point**: `app/main.py` — `create_app()` registers routers, middleware (CORS, logging), and a lifespan that runs `alembic`-independent table creation and starts the price-alert background task.
- **Config**: `app/config.py` — `Settings` loaded via `pydantic-settings` from `.env`. Retrieved everywhere via `get_settings()` (cached singleton). Required env vars: `DATABASE_URL`, `DATABASE_URL_SYNC`.
- **Database**: `app/database.py` — async SQLAlchemy engine; `get_session()` is the FastAPI dependency yielding `AsyncSession`. Always set `expire_on_commit=False` (async sessions can't lazy-load after commit).
- **Models**: `app/models/` — all inherit `TimestampedModel` (UUID PK, `created_at`, `updated_at`). Central model is `TradeCycle` which holds FK columns to `BuyingPhase`, `DepositPhase`, and `SalePhase` (phases belong to the cycle, but FK lives on the cycle side — invert FK order when writing delete logic).
- **Services**: `app/services/journal_service.py` — all CRUD. Every function takes `user_id: uuid.UUID` for data isolation. `_get_cycle_or_404` always scopes to `user_id` (returns 404 on cross-user access, no 403). Computed fields are recalculated bottom-up on every write.
- **Auth**: JWT via `python-jose`. `get_current_user` dependency in `app/services/auth_service.py` decodes token → fetches `User` from DB. All journal routes require this dependency and pass `current_user.id` to service functions.
- **Migrations**: Single migration file at `app/alembic/versions/b1c2d3e4f5a6_initial_setup.py` (`down_revision = None`). Alembic config at `backend/alembic.ini`.

### Key Design Decisions

- Computed aggregates (`pnl`, `total_inr_spent`, `remaining_usdt`, etc.) are stored denormalised on `TradeCycle` and `SalePhase`. They are recomputed from scratch via `_recompute_cycle()` / `_recompute_sale_phase()` on every update — not computed on read.
- Delete order: `SaleOrder` → `TradeCycle` row → phases. The cycle row must be deleted before phases because cycle holds FK refs to them.
- After `session.flush()` on order inserts/deletes, call `session.expire(sale, ["orders"])` to invalidate the ORM cache so the next query hits DB.
- `/health` endpoint is at server root (not under `/api/v1`). It runs three parallel async checks via `asyncio.gather`: DB (`SELECT 1`), Binance P2P (HEAD request), and Base chain RPC (`eth_blockNumber`), each with a 3-second timeout.

## Frontend

### Dev Commands

All commands run from `frontend/`:

```bash
npm install
npm run dev      # Vite dev server on :5173
npm run build
npm run preview
```

### Architecture

- **API client**: `src/api/client.ts` — axios instance with `VITE_API_URL` base (default `http://localhost:8000/api/v1`). Attaches JWT from `localStorage` on every request. Auto-redirects to `/login` on 401.
- **Health API**: `src/api/health.ts` — uses plain `axios` (not the authenticated client) because `/health` is at the server root, not `/api/v1`. Strips `/api/v1` suffix from `VITE_API_URL` to derive the server root.
- **State**: Zustand (`src/store/authStore.ts`) holds only `token` and `isAuthenticated`. User data fetched via React Query.
- **Auth hooks**: `src/hooks/useAuth.ts` for login/logout; `src/hooks/useCurrentUser.ts` for the logged-in user's username — only enabled when `isAuthenticated`, cached with `staleTime: Infinity`.
- **Routing**: React Router. Protected routes wrapped in `<ProtectedRoute>`. `/status` is public (no auth required).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin. Uses CSS custom properties for theme tokens (`text-text`, `text-muted`, `bg-success`, `bg-danger`, `border-border`, etc.).

### Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL including `/api/v1` (e.g. `http://localhost:8000/api/v1`) |
