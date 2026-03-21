# JobTracker AI - Complete Features Documentation

## 📊 Pipeline Analytics & Health
The application ships with a fully automated, real-time Analytics Engine that continuously analyzes your job hunt performance.
- **Holistic Health Score**: A mathematically calculated score (0-100) determining the momentum of your job hunt based on active applications, recent momentum, and interview conversion.
- **Active Pipeline**: Tracks how many opportunities are currently in motion (Applied + Follow-up + Interview).
- **Interview Rate**: An incredibly accurate metric that automatically registers whenever an application successfully receives an interview or offer—even accurately pulling historical successes from jobs that ultimately ended up in "Rejected" via the newly added **Rejection Stage Tracking** dropdown.
- **Response Rate**: Percentage of applications that yielded any response from the employer.

## 📋 Kanban Board & Tangible Interactivity
The core of the application is a visually stunning Kanban board powered by `@dnd-kit/core`.
- **6 Fixed Statuses**: Wishlist, Applied, Follow-up, Interview, Offer, Rejected.
- **Tangible Drag Physics**: When picking up a card, the card actively tilts (rotates 3 degrees) and casts a deep shadow below your cursor to simulate picking up a physical sticky note.
- **Celebratory Confetti**: The moment you successfully drag an application into the **Offer** column, the application unleashes a massive, colorful burst of confetti to celebrate your success.
- **Trello-Style Inline Column Addition**: Classic tiny `+` header icons were replaced by sprawling, dashed-border `Add` buttons sitting dynamically at the bottom of the physical card list. Includes micro-interactions that scale up the `+` icon precisely when hovered!

## 🏷️ Advanced Data Cards
- **Line-Clamp Notes Preview**: Essential notes appended to a job automatically render beautifully truncated into a rapid two-line preview underneath the specific Job Card.
- **Priority Tracking (P1 - P5)**: Rapid visual priority tags assigned to your jobs, seamlessly generating badges (with special pulsing `animate-ping` highlights for P5 '🔥 Dream Job' flags) directly printed onto the bottom row.
- **Direct Link Extraction**: Copy the URL to your LinkedIn or Greenhouse portals, enabling a completely safe, one-click `View Link` action natively from the 3-dot dropdown attached to every board item.

## 🗓️ Context-Aware Date Tracking & Urgency
The application constantly reads the user's local timezone to dynamically render highly contextual, urgent information onto the bottom of the Job Cards.
- **Dynamic Chips**: Instead of just showing dates, chips actively adapt phrasing like: "Today at 2:30 PM 🔥",  "Expire in 2d", or "Applied 3 days ago".
- **Overdue Recognition**: If an application sits in 'Applied' for > 7 days without a follow-up, or 'Follow-up' for > 14 days, the card automatically generates a prominent `⚠ Overdue` badge physically overlaid on the board.
- **Urgent Pulsing Elements**: Interviews scheduled for *Today* and Offer Deadlines expiring in under 48 hours receive a rhythmic glowing CSS pulse (`animate-pulse`) to urgently demand your attention when you merely glance at the board.

## 🚀 Speed & Accessibility
Built completely for keyboard power-users and speed traversing.
- **Command Palette**: Press `Cmd + K` (or `Ctrl + K`) to instantly trigger an omni-search palette overlay, letting you rapidly locate any company or role across all 6 columns in less than a second.
- **Quick Add**: Press `N` absolutely anywhere on the screen (when you are not filling out a text input) to instantly summon the Job Creation Modal.
- **Click-Outside Safety Engine**: All dropdown menus natively listen to standard document pointer events and gracefully dismiss effortlessly when clicking any blank space natively across the viewport, mimicking robust OS-level contextual menus.

## ✨ Premium UI & Glassmorphism Aesthetics
The app entirely rejects flat colors in favor of gorgeous, modern aesthetic choices.
- **Comprehensive Dark & Light Modes**: 100% of the UI (modals, backgrounds, drop-shadows, scrollbars, and borders) is uniquely programmed for both dark and bright viewing, intelligently persisting your choice directly via local browser storage immediately.
- **Rich Desktop Gradients**: Featuring deep radial background gradients (heavy slate-to-midnight in dark mode, ambient frosted white in light mode) that structurally render incredible dimensional depth across the entire viewport.
- **Glassmorphism Components**: The sticky top Navigation Bar employs heavy backdrop filtering blurs and semi-translucent styling, specifically programmed to allow the underlying background gradient to beautifully refract slowly behind your fixed headers as you scroll down.
- **Custom Thematic Scrollbars**: Fully custom internal webkit scrollbars that natively read your exact dark or light theme, smoothly bending into the overall color scheme instead of violently breaking the aesthetic flow with bright gray default OS-level scrollers.
- **"Pill" Status Selecting**: The standard Job Modal's generic HTML `<select>` dropdown was entirely gutted in favor of an interactive horizontal flex-grid of colorful, clickable badges that natively trigger status properties and scale `105%` out towards the user when chosen!

## 🔔 Proactive Intelligence
- **Morning Briefing Engine**: The first time you boot the application every single day, you are actively greeted with an intelligent customized modal beautifully summarizing precisely what urgently requires your immediate attention right now (Pending Interviews, Looming Deadlines, Urgent Follow-ups).
- **Follow-up Alerts Panel**: A sticky notification bell hovering directly on your app Header constantly computes mathematically which companies have effectively 'ghosted' you, automatically categorizing them as prime immediate targets for rapid follow-up emails!

## 💾 100% Offline & Local-First Platform (PWA)
- **Zero Latency IndexedDB System**: Utterly lacking any remote external API calls. Absolutely every single keystroke automatically commits directly into your native browser's IndexedDB via `idb`, effectively rendering standard API load times completely non-existent.
- **Progressive Web App (PWA)**: Natively generates completely valid dynamic web manifesting arrays (Vite PWA), empowering you to genuinely "Install" the local tracker directly onto your Desktop filesystem, or pin it robustly to your iOS/Android home screens as a native application box.
- **JSON Export Payload Engine**: Built-in capacity to serialize your comprehensive database tree into a raw `.json` file backup, allowing absolute data control and localized security exports natively with one click.
