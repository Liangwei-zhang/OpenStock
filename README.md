# OpenStock

OpenStock is a lightweight stock tracking app built around a simple workflow:

1. sign in
2. search a stock
3. open a clean stock detail page
4. save symbols to a watchlist
5. create price alerts

It is not a brokerage, not a social network, and not an all-in-one research terminal.

## Current product scope

The simplified build intentionally focuses on a smaller feature set:

- Email/password authentication
- Global stock search with command palette support
- Dashboard with market overview, quotes, and top stories
- Stock detail pages with chart, company profile, and financials
- Personal watchlist management
- Price alerts with background checking

## Tech stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Better Auth
- MongoDB + Mongoose
- Finnhub
- TradingView widgets
- Inngest

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB connection string
- A Finnhub API key
- A Better Auth secret

### Install

```bash
git clone https://github.com/Liangwei-zhang/OpenStock.git
cd OpenStock
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/openstock
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
FINNHUB_API_KEY=your_finnhub_key
```

`NEXT_PUBLIC_FINNHUB_API_KEY` is still supported as a fallback, but server-side `FINNHUB_API_KEY` is preferred for new deployments.

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build

```bash
npm run build
npm start
```

## Simplified architecture

```text
app/
  (auth)/        sign-in and sign-up pages
  (root)/        dashboard, help, watchlist, stock details
  api/inngest/   alert background job route
components/
  ui/            base UI primitives
  watchlist/     watchlist and alert UI
  Header.tsx
  Footer.tsx
  SearchCommand.tsx
  TradingViewWidget.tsx
  WatchlistButton.tsx
database/
  models/
  mongoose.ts
lib/
  actions/       auth, alerts, finnhub, watchlist
  better-auth/
  inngest/
  constants.ts
  utils.ts
middleware.ts    route protection
```

## Core user flow

1. Create an account or sign in
2. Search for a ticker
3. Review the stock detail page
4. Add the stock to your watchlist
5. Create a price alert if needed

## Notes

- Market data may be delayed depending on provider rules.
- Alert checks run in the background, but notification delivery is intentionally minimal in the simplified build.
- This project is for tracking and monitoring, not financial advice.

## License

This repository remains licensed under AGPL-3.0. See `LICENSE` for details.
