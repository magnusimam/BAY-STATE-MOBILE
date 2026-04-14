# HUMAID Mobile App — Development Tracker

**Project:** BAY-STATE-MOBILE (Expo/React Native)
**Repo:** https://github.com/magnusimam/BAY-STATE-MOBILE
**Web App Repo:** https://github.com/magnusimam/BAY-STATE-DATABASE
**Started:** 2026-04-13

---

## Phase 1: Foundation & Scaffolding

- [x] Create Expo project with TypeScript and Expo Router
- [x] Set up tab-based navigation structure
- [x] Configure Firebase auth (same project as web: `humaid-bay-states`)
- [x] Build API client pointing to Cloudflare Workers backend
- [x] Port API types from web app (`MasterRow`, `LgaProfileRow`, etc.)
- [x] Generate brand icons (H + data-pulse logo, amber theme)
- [x] Initialize git repo and push to GitHub
- [x] Configure `eas.json` for dev/preview/production builds

## Phase 2: Auth

- [x] Email/password sign-in (shared Firebase accounts with web)
- [x] Email/password sign-up with display name
- [x] Password reset via email
- [x] Auth state persistence with AsyncStorage v3
- [x] Protected route logic (redirect to sign-in if not authenticated)
- [x] Glassmorphic dark auth UI matching web design
- [ ] Google Sign-In (native — requires EAS build + `google-services.json`)
- [ ] GitHub Sign-In (native — requires EAS build)
- [ ] Forgot password screen (dedicated page, not just alert)

## Phase 3: Design Sync with Web App

- [x] Dark theme (`#0a0a0f`) matching web app throughout
- [x] Glassmorphic cards (`rgba(255,255,255,0.05)` + border)
- [x] Correct state colors: Borno=amber `#f4b942`, Adamawa=cyan `#6ec6e8`, Yobe=violet `#8b5cf6`
- [x] Gradient buttons with amber glow shadows
- [x] Risk zone color mapping (Conflict-Affected, Stable/Urban, etc.)
- [x] LinearGradient for banners and CTAs
- [x] Animated counters on KPI cards
- [ ] Sparkline mini-charts on KPI cards
- [ ] Floating particle effects on auth screens

## Phase 3.5: Design System (Pro UI/UX Upgrade)

- [x] `constants/Tokens.ts` — spacing, typography, radius, elevation, semantic colors
- [x] Reusable `<Card>` component with elevation levels (L1-L4), accent colors, onPress animations
- [x] Reusable `<Text>` component with typography variants (h1-h4, body, label, caption, overline, numLg, etc.)
- [x] Reusable `<Badge>` component (filled/subtle variants)
- [x] Reusable `<Button>` component (primary gradient / secondary / ghost / danger)
- [x] Reusable `<Skeleton>` loaders (SkeletonKPI, SkeletonRow)
- [x] Reusable `<EmptyState>` with icon + title + description + CTA
- [x] Reusable `<AnimatedCounter>` with ease-out cubic
- [x] Reusable `<FadeInView>` for entrance animations
- [x] Haptic feedback on all interactive elements (expo-haptics)
- [x] WCAG-compliant text contrast (tertiary bumped to #9ca3af = 4.6:1)
- [x] 44pt minimum touch targets on all buttons/pills/tabs
- [x] All 7 tab screens refactored to use token system
- [x] Both auth screens refactored to use token system

## Phase 4: Data & API Integration

- [x] Fix API URL (Workers deployment, not Pages)
- [x] Switch from `?view=overview` to `?view=master` for dashboard
- [x] Compute KPIs from raw master_data (matching web app logic)
- [x] `computeSummary()`, `sumIndicator()`, `avgIndicator()` helpers
- [x] Pull-to-refresh on all data screens
- [ ] Offline caching (AsyncStorage for last-fetched data)
- [ ] Loading skeletons instead of spinner
- [ ] Error retry with exponential backoff

## Phase 5: Screens — Dashboard (Home Tab)

- [x] 6 KPI cards (Displaced, Conflict, Borno/Adamawa/Yobe LGAs, SMEs)
- [x] State overview cards with computed metrics (Displaced, Conflict, SMEs, Literacy)
- [x] Top Improvers section (4-year change_pct)
- [ ] BAY States Humanitarian Need area chart
- [ ] State Displacement pie/donut chart
- [ ] Youth Program Enrollment stacked bar chart
- [ ] Humanitarian Severity Index line chart
- [ ] Quick access cards (link to States, Analysis, Compare, Briefs)
- [ ] Admin sync button (for admin users)

## Phase 6: Screens — States Tab

- [x] State filter pills (All / Borno / Adamawa / Yobe)
- [x] LGA search input
- [x] State summary cards with colored dot, population, LGA count
- [x] LGA cards with risk zone badge + 4 metric pills
- [x] Zone color coding matching web
- [ ] State displacement bar chart
- [ ] Top 5 LGAs by Youth Unemployment chart
- [ ] Tabs: States view vs LGA view (web has this)
- [ ] Tap LGA card to see full detail

## Phase 7: Screens — Analysis Tab

- [x] Header with AI icon and data point count
- [x] 4 KPI cards (Displacement + % change, Conflict, Improving, Declining)
- [x] Risk Zone Distribution (horizontal bar per state: High/Medium/Low)
- [x] State Indicator Profile (per-indicator comparison across 3 states)
- [x] Anomaly Detection (>30% change flagged, sorted by severity)
- [x] Pattern Detection (top/bottom LGAs per indicator with avg change)
- [x] Key Insights (narrative text from trend_analysis table)
- [ ] Radar chart visualization (web has Recharts RadarChart)
- [ ] Risk Zone stacked bar chart (web has Recharts BarChart)

## Phase 8: Screens — Compare Tab

- [x] State toggle selector (tap to include/exclude, min 1)
- [x] Metrics table (8 metrics: Population, Displaced, Need, Severity, Programs, Unemployment, Literacy, Food Insecurity)
- [x] Visual bar comparison per metric
- [x] Live data injection (unemployment, literacy, displaced from master_data)
- [ ] Metric selector dropdown for focused comparison
- [ ] Radar/spider chart (multi-dimensional)
- [ ] Timeline line chart (humanitarian need trend)
- [ ] Export comparison report

## Phase 9: Screens — Trends Tab

- [x] State filter pills
- [x] Indicator filter (horizontal scroll)
- [x] All / Improvers / Decliners tabs with counts
- [x] 4 KPI summary cards (Total Tracked, Improving, Declining, Stable)
- [x] Trend cards with year-over-year values (2022→2025)
- [x] Change % badge and trend label
- [ ] Trend direction breakdown chart (improving/declining/stable per indicator)
- [ ] Year-over-year aggregate line chart
- [ ] State comparison line chart (when indicator selected)
- [ ] CSV/data export

## Phase 10: Screens — Policy Briefs Tab

- [x] 3 brief cards with severity badges (Critical/High/Medium)
- [x] Expandable key points and recommendations
- [x] Share button (native Share API)
- [x] Live data injection from master_data (displacement, conflict, literacy, unemployment per state)
- [x] Published status badge
- [ ] Brief generation modal (select region, title, focus areas)
- [ ] Download brief as PDF
- [ ] Draft/Published filter
- [ ] Region/date metadata on cards

## Phase 11: Screens — Profile Tab

- [x] Avatar with user initial
- [x] Display name, email, joined date, last sign-in
- [x] About section (app version, platform, region)
- [x] Sign out with confirmation dialog
- [ ] Edit display name
- [ ] Change password
- [ ] Notification preferences
- [ ] Dark/light theme toggle

## Phase 12: Build & Store Deployment

- [x] `eas.json` configured (development, preview, production profiles)
- [x] `app.json` with bundle IDs (`com.baystates.humaid`)
- [x] App icons generated (icon, adaptive-icon, splash, favicon)
- [ ] **Download `google-services.json` from Firebase Console**
- [ ] **Download `GoogleService-Info.plist` from Firebase Console**
- [ ] **Get Web Client ID from Firebase → update auth-context.tsx**
- [ ] Login to EAS (`npx eas login`)
- [ ] First preview build (`npx eas build --platform android --profile preview`)
- [ ] Test APK on physical Android device
- [ ] Test Google Sign-In on native build
- [ ] Production build (`npx eas build --platform android --profile production`)
- [ ] Production build iOS (`npx eas build --platform ios --profile production`)
- [ ] Google Play Store listing (screenshots, description, privacy policy)
- [ ] Apple App Store listing (screenshots, description, privacy policy)
- [ ] Submit to Google Play (`npx eas submit --platform android`)
- [ ] Submit to App Store (`npx eas submit --platform ios`)

## Phase 13: Polish & Enhancements (Future)

- [ ] Push notifications (new data syncs, alerts)
- [ ] Offline mode with cached data
- [ ] Biometric auth (fingerprint/face ID)
- [ ] Deep linking (open specific LGA/state from notification)
- [ ] App review/rating prompt
- [ ] Analytics (screen views, feature usage)
- [ ] Crash reporting (Sentry or Firebase Crashlytics)
- [ ] Localization (Hausa, French)
- [ ] Widget for Android (KPI summary)
- [ ] Apple Watch complication (displacement count)

---

## Bug Fixes & Issues Resolved

- [x] Bun lockfile version mismatch (regenerated with bun 1.2.15 for Cloudflare)
- [x] `expo-auth-session` crash in Expo Go (`ExpoCryptoAES` native module missing)
- [x] Firebase `auth/already-initialized` on hot reload (try/catch fallback to `getAuth`)
- [x] API returning 404 (was pointing to Pages URL, fixed to Workers URL)
- [x] Dashboard showing zeros (was using `?view=overview` with empty header rows, switched to `?view=master`)
- [x] `.open-next` build artifacts committed to web repo (added to `.gitignore`)
- [x] State colors wrong (was Borno=red, fixed to Borno=amber matching web)

---

## Architecture Notes

- **Web + Mobile share:** Same Firebase project, same Cloudflare D1 database, same API endpoints
- **API Base URL:** `https://humaid-bay-states.bay-state-intelworkers.workers.dev`
- **Primary data source:** `?view=master` (650 rows) — all KPIs computed client-side
- **Auth flow:** Firebase Auth → same user pool → email/password works across both platforms
- **State codes:** Borno=`BN`, Adamawa=`AD`, Yobe=`YB` (web uses uppercase codes, mobile uses lowercase names)
