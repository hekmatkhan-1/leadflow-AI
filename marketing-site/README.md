# LeadFlow AI — marketing site

The public marketing site for LeadFlow AI: landing page, planned pricing, FAQ,
waitlist, and the Privacy and Terms pages.

It is a separate app from the product in the repository root — TanStack Start
(React + Vite + Tailwind v4), served on port 3000.

## Running it

```bash
bun install
bun run dev      # development
bun run publish  # build and serve production on port 3000
```

`publish.sh` frees port 3000 itself, so it is safe to re-run. On failure, read
`.run/server.log`.

## Layout

```
src/
  routes/
    __root.tsx        # HTML shell, head metadata
    index.tsx         # landing page ("/")
    privacy.tsx       # "/privacy"
    terms.tsx         # "/terms"
    api/waitlist.ts   # POST /api/waitlist — email capture
  components/site.tsx # shared nav, footer, logo, legal layout
  db.ts               # Postgres handle (needs DATABASE_URL)
```

Adding `src/routes/about.tsx` creates `/about`; the router is generated.

## The waitlist

`POST /api/waitlist` writes to Postgres through `src/db.ts`. It needs
`DATABASE_URL` to be set. **Without it the endpoint returns 503 and the form
tells the visitor signup isn't live yet — it never reports a false success.**
Keep that behaviour: a waitlist that silently drops addresses is worse than one
that admits it isn't ready.

## Honesty rules

The product is pre-launch and has no customers. The site must not invent social
proof: no testimonials, customer logos, customer counts, star ratings, or
compliance badges. No links to the product's `/signup` or `/login` until the
product is actually deployed, because those would 404. Every call to action
points at the waitlist.

Pricing is published as *planned* launch pricing and is explicitly labelled as
not purchasable, because there is no billing integration yet.

## Publishing

The live site is whatever serves on port 3000. Nothing is live until
`bun run publish` succeeds — editing files alone changes nothing.
