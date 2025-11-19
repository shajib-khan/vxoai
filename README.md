VXOAI Quote Assistant — Dev README (Simplified)
A streamlined, full‑custom AI quoting assistant for General Managers. This README gives the dev everything needed to build agent.vxoai.com with Next.js, Supabase, Stripe, and OpenAI.

This app must match the visual identity of vxoai.com — clean, modern SaaS, white background, blue accents, Inter font, minimal layout.

1. Tech Stack
   Frontend Framework: Next.js (App Router) Styling: Tailwind CSS + shadcn/ui Auth: Supabase Auth Database: Supabase Postgres + pgvector (for RAG) Payments: Stripe Billing (subscription gating) LLM: OpenAI (chat + RAG) Storage: Supabase Storage (attachments) Deployment: Vercel (app) + Supabase (backend)

Why Next.js:

Built‑in API routes for chat, quote engine, embeddings, and Stripe webhooks.
Server/Edge functions remove need for separate backend.
Better performance and cleaner architecture than plain React. 2. Branding Requirements (Match vxoai.com)
Color Palette:

Primary Blue: #3B82F6
Dark Text: #0F172A
Grays: #6B7280, #9CA3AF
Background: #FFFFFF / #F9FAFB
Font: Inter (all weights)

UI Principles:

Minimal, white background, no sidebar
Large spacing, clean layout
Rounded corners (12–16px)
Subtle shadows (only where needed)
Blue user messages, gray assistant messages
Professional, direct tone 3. Core Features
MVP Chat Model: Single Persistent Conversation
For the MVP, each user has one continuous chat thread with the AI assistant.

No sidebar
No conversation switching
No multiple threads
No archiving
Behavior:

When user logs in → load the single conversation tied to their account.
When they chat → append messages to this one thread.
When they log out / close browser → the chat persists in Supabase.
When they return → they see the same conversation.
LLM Context Handling:

We store the full conversation in Supabase, but
We only send a trimmed version (summary + last N messages) to the LLM.
Future Expansion:

Once ready, we add a sidebar.
Then enable: new chat, archive, rename, conversation list.
Current data model is compatible with this future update.
Sign Up / Sign In (Supabase Auth)
Subscription Gating (Stripe Checkout → Webhook → Unlock Access)
Chat Interface (minimal UI, no sidebar)
RAG Answering (OpenAI + pgvector)
Quote Intake Workflow (structured follow‑up questions)
Quote Engine (deterministic pricing logic)
PDF Quote Generation (customer copy + internal margin view)
Attachments Upload (Supabase Storage) 4. User Flow

1. Visit https://agent.vxoai.com → Landing / Login page.

2. User signs up using Supabase Auth.

3. If no subscription: User sees a screen:

"Start Subscription" button → Stripe Checkout. 4) Stripe Checkout completes → redirect back to app.

5. Stripe Webhook marks user as active subscriber in Supabase.

6. User enters /chat and can now use the agent.

5) Routes Overview
   Public
   /signup — create account
   /login — log in
   / — redirect to /chat if signed in
   Protected
   /subscribe — Stripe checkout button
   /chat — AI assistant page
   /quote/[id] — view generated quotes
   /settings — billing portal link, profile
   API Routes
   POST /api/chat → RAG + LLM
   POST /api/quote → deterministic pricing
   POST /api/upload → file upload
   POST /api/embeddings/sync → KB sync
   POST /api/stripe/webhook → subscription updates
6) Supabase Schema (Simplified)
   users (Supabase-managed)

id
email
org_id
entitlements

user_id
status (active/inactive)
plan
current_period_end
quotes

id
user_id
json_payload
total
created_at
sku_rates (pricing data)

id
sku
label
base_rate
multipliers (after hours, weekend)
kb_documents / kb_chunks

for RAG knowledge base 7. Quote Engine (Simple Overview)
The quote math must be deterministic:

Look up base SKU rates
Apply multipliers (zone, after‑hours, weekend)
Add surcharges
Generate line items
Calculate total
LLM cannot calculate totals — only explains them.

8. UI Requirements for Dev
   Chat Page Layout:

Full-screen white background

Centered chat column

Message bubbles:

User: blue background, white text
Assistant: light gray background, dark text
File upload pill

Loading animation (3 dots)

Styling Libraries:

Tailwind classes + shadcn/ui components 9. Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID= 10. First Sprint Tasks (For the Dev)
Auth + Gating (Priority 1)
Setup Supabase Auth
/signup + /login pages
Add protectedRoute() wrapper
Add /subscribe page with Stripe Checkout button
Add Stripe webhook to activate subscription
Chat Interface (Priority 2)
Build minimal chat UI
Add message bubbles + streaming
Add file upload
Connect to /api/chat
Quote Engine (Priority 3)
Create /api/quote endpoint
Create quote-engine.ts with base logic
Render quote summary in chat
RAG System (Priority 4)
Vector table setup
/api/embeddings/sync
RAG retrieval function 11. Deployment
Deploy app on agent.vxoai.com via Vercel
Configure Supabase project
Configure Stripe Checkout + Webhooks
Test subscription flow end-to-end
Provide iframe or link to WordPress 12. Project Goal
A minimal, fast, painless AI quoting assistant that:

Looks like the VXOAI site
Works for GMs out of the box
Gives accurate quotes based on rules
Is subscription-gated and scalable
This README is final and ready for the GitHub repo.
