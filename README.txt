MARK IAN BUENZALIDA — PORTFOLIO

Live site:
https://mark-ian-portfolio.vercel.app/

DESIGN DIRECTION
Technical field manual × electronics instrumentation × editorial portfolio.

The site intentionally avoids generic dashboard cards and decorative 3D. It uses:
- oversized editorial typography
- IBM Plex Mono technical labels
- Instrument Serif accents
- one controlled signal-orange accent
- a hand-built electronics-style capability diagram
- an accurate workflow diagram for the public Staff Evaluation System project
- restrained glassmorphism on navigation and high-impact surfaces only
- responsive layouts designed separately for desktop and mobile

SELECTED PUBLIC WORK
1. Staff Evaluation System
   https://github.com/FetzCriey/staff_evaluation
   Public repository includes the evaluation interface, login flow, Supabase application logic, and k6 load tests for the site, autosave, and realtime behavior.

2. This portfolio
   https://github.com/FetzCriey/mark-ian-portfolio

3. Hangman Game
   https://github.com/FetzCriey/hangman

PRODUCTION
- Static HTML, CSS, and JavaScript
- Deployed through Vercel from GitHub main
- Semantic HTML and keyboard-safe navigation
- Reduced-motion and reduced-transparency support
- Canonical metadata, JSON-LD, robots.txt, sitemap.xml
- Security headers configured in vercel.json
- No Three.js or 3D dependency

NOTE
No personal portrait is included until the final transparent PNG is provided.


INTERACTIVE 3D PORTRAIT
- The hero portrait is a real low-poly 3D mesh derived from Mark Ian's uploaded photo.
- The mesh uses 273 vertices and 460 triangular faces with sampled vertex colors.
- It reacts continuously to pointer movement without requiring a click.
- Scroll position adds a second motion layer.
- Three.js is loaded only for the portrait and has a static fallback.
- Reduced-motion preferences disable the animated movement.
