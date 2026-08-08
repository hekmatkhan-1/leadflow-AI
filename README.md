LeadFlow AI
Turn every website visitor into a qualified lead — automatically.
LeadFlow AI is a production-ready SaaS platform that gives any business an AI-powered
chatbot that engages website visitors 24/7, qualifies them through natural conversation,
scores every lead, and organizes everything into a clean CRM dashboard — all from a
single embed script.
No forms. No missed leads. No live-chat staffing required.
Why LeadFlow AI
Most websites lose visitors the moment they leave — a static contact form isn't enough
to capture interest in the moment. LeadFlow AI replaces that with a conversational AI
agent that:
Greets visitors and asks qualifying questions naturally, one at a time
Handles objections gracefully instead of pushing too hard
Extracts structured lead data (name, email, phone, company, budget, timeline, needs)
Scores every lead 0–100 using a transparent, rule-based scoring engine
Surfaces your hottest opportunities first — Hot / Warm / Cold
Every business that signs up gets a fully isolated account, secured at the database
level with Supabase Row Level Security. There is zero cross-account data exposure.
Live Demo
leadflow-ai-fawn.vercel.app
Sign up for a free account, or click the chat bubble in the bottom-right corner to talk
to the AI agent directly.
Features
🤖 AI chatbot — natural, multi-turn lead qualification conversations
📊 Lead scoring engine — real, explainable scoring based on budget, timeline,
company, industry, and contact completeness
📁 CRM dashboard — live stats, searchable/filterable lead table, CSV export
💬 Conversation history — every chat is saved and viewable per lead
⚙️ Customizable settings — greeting message, welcome message, branding, business
hours, all saved per business
🔐 Secure multi-tenancy — Supabase Auth + Row Level Security, each business sees
only its own data
📱 Fully responsive — works cleanly on mobile and desktop
🔌 One-line embed widget — drop the chatbot onto any website with a single script tag
Tech Stack
Layer
Technology
Framework
Next.js 15 (App Router), TypeScript, Tailwind CSS
Database & Auth
Supabase (Postgres, Row Level Security, email/password auth)
AI
Mistral AI (mistral-small-latest)
Hosting
Vercel
The entire stack currently runs on free tiers (Vercel, Supabase, Mistral AI) —
meaning this project has effectively $0 infrastructure cost to operate at small
scale today, with a clear upgrade path as usage grows.
Getting Started
Prerequisites
Node.js 20+
A Supabase project (free tier is enough to start)
A Mistral AI API key (free tier available)
Setup
Bash
Create a .env.local file (see .env.local.example) with:
Code
Run the database migration in supabase/migrations/001_schema.sql via the Supabase
SQL Editor, then:
Bash
Deployment
Push to GitHub, import the repo into Vercel, add the same environment variables in
Vercel's dashboard, and deploy. No custom build configuration needed — Vercel
auto-detects Next.js.
Project Structure
A full architecture breakdown — database schema, API routes, authentication flow,
and file-by-file purpose — is documented for anyone continuing development on this
codebase.
Known Limitations
This project is transparent about what's built and what isn't. See
KNOWN_GAPS.md for an honest breakdown, including billing
integration, testing coverage, and production-scale rate limiting — all straightforward
additions on top of a solid, working foundation.
License
Proprietary — all rights reserved. Contact the owner for licensing or acquisition inquiries.
