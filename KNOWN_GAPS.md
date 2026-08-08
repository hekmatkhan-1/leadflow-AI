# LeadFlow AI — Known Gaps & Limitations

This document lists what is NOT yet built or production-ready, for full transparency to a buyer.

## Not Implemented

- **Billing / subscriptions**: No Stripe integration. Pricing tiers (Free/Pro/Business) are described in the landing page copy but not enforced anywhere in code. A buyer will need to add Stripe (or another billing provider) before charging customers.
- **Automated tests**: No unit, integration, or end-to-end tests exist.
- **Real-time updates**: Conversations do not use Supabase real-time subscriptions. The embed widget works via polling (HTTP requests), not WebSockets.
- **Team / multi-user accounts**: Each business account maps to exactly one Supabase auth user. No team invites or role management.

## Works, But Not Production-Grade

- **Rate limiting on the chat API**: Uses an in-memory limiter. This resets every time the app redeploys and does not work correctly across multiple serverless instances. For real production traffic, this should be replaced with Redis or Upstash-backed rate limiting.
- **AI provider**: Currently wired to Mistral AI (mistral-small-latest) via direct API calls, not the original OpenAI plan. Swapping providers again is straightforward — the integration is isolated to `src/app/api/chat/route.ts`.
- **Lead scoring**: Real scoring logic exists (`src/lib/scoring.ts`) and is wired into the chat endpoint, saving computed scores to the `leads` table. Scoring is rule-based (budget, timeline, company, industry, contact info, requirements), not AI-based.

## Recently Fixed (as of this build)

- Dashboard home stats (Total/Hot/Warm/Cold Leads, Conversion Rate) now pull live data from Supabase — previously hardcoded placeholder numbers.
- Settings page now persists changes to the `businesses.settings` column — previously the Save button had no effect.
- Chat widget is wired to a real `business_id`, so conversations and leads are correctly attributed and saved.

## Recommended Next Steps for a Buyer

1. Add Stripe billing to enforce the pricing tiers already described in the marketing copy.
2. Replace in-memory rate limiting with Upstash Redis for real production traffic.
3. Add basic test coverage, especially around the chat API and lead scoring.
4. Consider Supabase real-time subscriptions for the Conversations page for a live-chat feel.

