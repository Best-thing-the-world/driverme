# DriverLink Platform Build Plan

## Phase 1: Init Project (Main Agent)
- Read webapp-building-swarm SKILL.md
- Run init-webapp.sh
- Gather research findings from completed report

## Phase 2: Design (Pro_Designer Subagent)
- Design the complete platform: landing page, driver storefronts, booking, dashboard
- Design documents in /mnt/agents/output/design/

## Phase 3: Scaffold (1 agent)
- Landing page + shared components + router + theme
- Generate media assets

## Phase 4-7: Parallel page agents
- Group 1: Public pages (Browse Drivers, Driver Profile, Booking)
- Group 2: Driver Dashboard (CRM, Services, Earnings, Storefront)
- Group 3: Admin + Auth + Misc

## Key Pages
1. **Home** - Hero, features, how it works, pricing, testimonials
2. **Browse Drivers** - Search and filter driver directory
3. **Driver Profile** - Public storefront with services, reviews, booking
4. **Booking Flow** - Multi-step booking with dynamic fields
5. **Driver Dashboard** - Booking management, CRM, earnings, storefront editor
6. **Admin Dashboard** - Driver approvals, platform analytics
7. **Pricing** - Tier comparison
8. **About** - Company info

## Tech Stack
- Node.js 20, Tailwind CSS v3.4.19, Vite v7.2.4, React 19 + TypeScript, shadcn/ui
