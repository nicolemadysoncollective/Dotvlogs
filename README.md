# dotblogs

A Y2K-styled beauty diary app, built with React + Vite + Tailwind.

## Running it locally

You'll need [Node.js](https://nodejs.org) installed (any recent version, 18+).

```bash
npm install
npm run dev
```

This starts a local dev server (usually at `http://localhost:5173`) — open that in your browser to see the app.

## Building for deployment

```bash
npm run build
```

This creates a `dist` folder with the finished, optimized site — that's what you deploy.

## Deploying

The easiest path once this is on GitHub:

1. Go to [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com)
2. Sign up / log in, then choose "Import from GitHub" (or similar)
3. Select this repository
4. Leave the build settings as detected (`npm run build`, output folder `dist`) — both platforms auto-detect Vite projects
5. Deploy — you'll get a live URL, no Claude branding, and the live camera should work properly since it's a real, unrestricted website

## Notes

- `src/App.jsx` is the entire app — all screens, state, and logic live in this one component.
- `src/main.jsx` sets up a small `localStorage`-backed polyfill for `window.storage`, so saved accounts/posts persist the same way they did during development.
- Video attachments are kept in memory for the browsing session only (not saved to `localStorage`) since a single video can be several MB — only the cover photo is persisted. If you want videos to survive a page reload or be shared between users, you'll eventually want a real backend (e.g. object storage like S3/Cloudflare R2) instead of browser storage.
