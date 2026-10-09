# AI Career Copilot — Multi-page Website Plan

## Goal
Build a polished, responsive SaaS marketing site and product UI for AI Career Copilot, closely following the supplied royal-blue admin-dashboard reference while using original, reusable React components.

## Pages
- `/` — marketing homepage with hero, product mockup, feature flow, testimonials, pricing teaser, CTA, and footer
- `/features` — detailed alternating feature showcases and comparison table
- `/pricing` — plans, comparison matrix, FAQ, CTA, and footer
- `/dashboard` — authenticated-style career dashboard UI
- `/resume` — resume upload and completed analysis state
- `/learning` — skill-gap radar, learning roadmap, adaptive quiz, resources
- `/interviews` — interview setup, active session, feedback, and history
- `/jobs` — filters, sorting, job matches, and pagination
- `/signup` and `/login` — responsive split-screen account forms

## Shared Design System
- Royal-blue hero and action surfaces, bright white cards, cool-gray app canvas, navy text, and orange/teal/pink status accents
- Heavy Poppins display typography with Inter body text, generous spacing, 16–24px radii, subtle borders and soft shadows
- Reusable pills, icon badges, metric cards, browser/dashboard mockups, dot-grid decoration, and a custom lightweight rocket illustration
- Responsive behavior for mobile navigation, collapsible app sidebar, stacked layouts, horizontal overflow where appropriate, and accessible focus states

## Shared Components
- Marketing shell: responsive navbar, mobile menu, CTA banner, and multi-column footer
- App shell: collapsible sidebar, mobile drawer, top search bar, notifications, language selector, and profile control
- Data UI: metric cards, progress bars, tags, gauges, timelines, job cards, and activity rows
- Charts: Recharts line/area, radar, bar, and sparkline visualizations with responsive containers and highlighted tooltips
- Auth shell: common split layout and form primitives for login/signup

## Interaction Scope
- Navigation and responsive menus work across routes
- Tabs, toggles, dropdowns, accordions, filters, upload mock state, password visibility, sidebar collapse, and chart tooltips are interactive client-side demos
- Login/signup are presentation-only in this build; no account creation, database, or authentication backend will be added

## Technical Notes
- Keep TanStack Start file-based routing and route-specific SEO metadata
- Use existing shadcn components, Lucide icons, Tailwind v4 semantic tokens, and Recharts
- Build with reusable content/config data to keep repeated UI consistent
- Verify the live preview at desktop and mobile widths, including route navigation and key interactions
