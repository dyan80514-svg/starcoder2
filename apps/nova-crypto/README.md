# Nova Crypto

A responsive, standalone cryptocurrency dashboard built with plain HTML, CSS, and JavaScript. Tailwind CSS is included via CDN; custom design tokens and component styles live in `styles.css`.

## Run

Open `index.html` directly in a modern browser. No installation or build step is required.

Alternatively, serve this directory:

    python3 -m http.server 8080

Then open http://localhost:8080.

An internet connection is needed for the Tailwind CDN and Google Fonts. The application logic, charts, icons, and core styling are local; system fonts provide a fallback.

## Features

- Responsive dark dashboard with Overview, Markets, Portfolio, and Watchlist views.
- Eight sample crypto assets with searchable market rows.
- Price sorting, top-gainer filtering, and saved favorites.
- SVG charts with asset and time-range selectors.
- Simulated buy/sell flow with order previews and balance validation.
- Virtual funding and portfolio valuation.
- Local browser persistence for cash, holdings, and watchlist.
- Account reset with confirmation.
- Educational and demo-information dialogs.
- Keyboard-accessible controls, native modal dialogs, live status messages, and reduced-motion support.
- Press `/` to focus market search.

## Demo behavior

This is not an exchange. Prices, chart histories, market cap, volume, and sentiment are fixed illustrative data. Changing the chart range generates a different deterministic visual series; it does not retrieve historical prices. The displayed chart percentage is illustrative for each selected range.

Orders execute against the fixed displayed asset prices with zero demo fees. Amounts are entered in USD for both buying and selling. The minimum simulated order is $1. The Max button rounds down to cents and may leave small asset fractions.

Portfolio value equals available virtual cash plus holdings valued at the fixed sample prices. No real money, wallet connection, authentication, API keys, or backend is involved.

Data is stored under `nova-demo-v1` in localStorage. If storage is blocked, the app continues in memory for the current session. Use the sidebar profile button to reset the demo. Browser storage behavior for directly opened local files may vary; use a local server for consistent persistence.

## Files

- `index.html` — dashboard structure and CDN resources.
- `styles.css` — design tokens, components, and responsive layouts.
- `app.js` — data, charts, filtering, simulated orders, and persistence.
- `README.md` — setup and behavior documentation.

Not financial advice.
