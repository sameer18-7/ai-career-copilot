# AI Career Copilot — Full Site Research

## 1. How the site is put together

There are two experiences inside one site:

- **Marketing site** (public pages): Home, Features, Pricing, Login, Signup
- **Product app** (logged-in look): Dashboard, Resume, Job Matches, Learning Path, Interview Coach

Everything shares one set of building blocks, so headers, cards, colours and buttons look identical everywhere.

## 2. Pages and what each one does

| Page | Address | Built by | Layout wrapper |
|---|---|---|---|
| Home | `/` | `HomePage` | Marketing header + footer |
| Features | `/features` | `FeaturesPage` | Marketing header + footer |
| Pricing | `/pricing` | `PricingPage` | Marketing header + footer |
| Sign up | `/signup` | `AuthPage mode="signup"` | Split screen, no nav |
| Log in | `/login` | `AuthPage mode="login"` | Split screen, no nav |
| Dashboard | `/dashboard` | `DashboardPage` | App shell (sidebar + top bar) |
| Resume Analyzer | `/resume` | `ResumePage` | App shell |
| Learning Path | `/learning` | `LearningPage` | App shell |
| Interview Coach | `/interviews` | `InterviewsPage` | App shell |
| Job Matches | `/jobs` | `JobsPage` | App shell |

Each address is one small file under `src/routes/`. That file only does two things: set the page title/description used by Google and social previews, and point at the page component. All the visible content lives in the four files under `src/components/career/`.

## 3. The shared building blocks (`shared.tsx`)

- **Logo** — rocket badge + wordmark; links home. Has a white version for the blue hero.
- **MarketingNav** — public top bar. Links: Features, Pricing, Dashboard, Login, and a "Get Started Free" button. On the blue hero it renders transparent/white; elsewhere white with a border. On phones it collapses into a menu button that opens a dropdown panel.
- **CtaBanner** — blue closing band with email field + "Get started free".
- **Footer** — dark footer, four link columns (Product, Company, Resources, Legal) plus a description and copyright.
- **AppShell** — the whole product frame: fixed sidebar (Dashboard, Resume, Job Matches, Learning Path, Interview Coach, Analytics, Settings), collapse toggle, mobile slide-in drawer with dark overlay, sticky top bar with search, notification bell with red dot, language switch, profile chip, then the page title, subtitle and optional action button.
- **Panel** — the standard white rounded card with soft shadow; used for nearly every block in the product pages.
- **SectionHeading** — eyebrow label + big headline + supporting line; used across marketing sections.
- **IconBadge** — rounded coloured icon tile in blue / green / amber / coral.
- **MetricCard** — label, big number, coloured icon and a "this month" trend line.

The sidebar highlights the current item by comparing the current address; Analytics and Settings intentionally do not highlight since they point at the dashboard placeholder.

## 4. Marketing content (`marketing.tsx`)

- **HomePage** flows: blue hero (badge, "Land Your Dream Job with AI.", two CTAs, feature pills, floating dashboard mockup) → trusted-by strip → five feature cards → five-step journey timeline → browser-frame product showcase with floating "ATS Score 87%" / "3 New Job Matches" cards → testimonials → pricing teaser → CTA banner → footer.
- **DashboardMockup** — miniature fake app window (browser dots, small metric tiles, an area chart) reused in the hero and showcase.
- **features** — the single list of the five pillars (Resume Analyzer, Skill Gap Analysis, Learning Path, Interview Coach, Job Matching). The home cards and the whole Features page both read this same list, so text never drifts apart.
- **PricingTeaser** — three compact plans (Student $0, Pro $12, Campus custom) linking to the pricing page.
- **FeaturePageHeader** / **FeatureVisual** — light-blue header with breadcrumb for the Features page, plus the generic mock illustration used beside each feature block.

## 5. Product pages (`app-pages.tsx`)

- **Dashboard** — four metric cards (ATS Score 87%, Skill Gaps, Applications, Interview Score); Learning Progress line chart over six months; Recent Activity list; Skill Gap Breakdown bars; blue Mock Interview reminder card; Notifications; and a Top Job Matches strip.
- **Resume Analyzer** — drag-and-drop upload card with an uploaded-file example; circular ATS gauge (drawn with a conic gradient, no library) plus formatting/keyword/readability/section bars; extracted Skills, Education, Experience, Certifications; missing-keyword chips you can click; target-role selector; a Quick Fixes checklist; and Re-analyze / Download buttons.
- **Learning Path** — radar chart comparing your skills against market demand, a summary panel, missing-skill cards with severity, a roadmap timeline with statuses and Continue buttons, an adaptive quiz widget, and recommended resources.

## 6. Product pages (`more-pages.tsx`)

- **FeaturesPage** — alternating left/right feature blocks generated from the shared five-pillar list, each with a coloured icon, bullet list and mock visual; then a comparison table against generic tools, CTA banner and footer.
- **PricingPage** — monthly/annual toggle (annual shows the discount), three plan cards with Pro marked most popular, a full plan-comparison table with ticks and limits, an FAQ accordion, CTA and footer.
- **InterviewsPage** — four tabs: Setup (company track chips Google / Amazon / Microsoft / Startup, interview type, difficulty, Start button), Live session (interviewer placeholder, timer, record toggle, transcript, Next Question / End), Feedback (overall score, breakdown bar chart, strengths, improvements, question-by-question accordion), History (past sessions table).
- **JobsPage** — filter panel (work type, experience, match score, etc. with checkboxes), search field and sort dropdown, five job cards showing logo, role, company, location, salary, match percent, skill tags, a working Save/bookmark toggle and Apply, then pagination.
- **AuthPage** — one component powering both Login and Signup: blue benefits panel on the left, white form on the right, social buttons, email/password fields with a show/hide eye toggle, terms checkbox on signup, and cross-links between the two pages.

## 7. Interactive behaviour that actually works today

- Navigation between all ten pages, including mobile menu and sidebar drawer
- Sidebar collapse/expand
- Pricing monthly/annual toggle
- Interview tabs, company-track chips, record toggle, feedback accordion
- Job saving (bookmark fills in), filter checkboxes
- Password visibility toggle, FAQ accordion, resume checklist
- All charts (line, area, radar, bar) with hover tooltips

Everything is presentation only: content comes from lists written in the code. There is no database, no accounts, no file processing and no AI calls yet — logging in, uploading a resume or applying to a job does not store anything.

## 8. Design system

Colours, fonts, radii and shadows are defined once in `src/styles.css`: royal-blue primary, white cards, cool-grey canvas, navy text, plus green/amber/coral accents, 16px base rounding, two shadow depths, Poppins headings and Inter body text. Components only reference those names, so a single change re-themes the whole site.

## 9. What would need real backend work

Sign-up and login, resume upload and parsing, real ATS scoring, live job data, saved jobs, quiz progress and interview recording would all need accounts, storage and AI — the current pages are the finished front end for those flows.
