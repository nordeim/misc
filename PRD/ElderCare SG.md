# Project Requirements Document (PRD)  
🩺 Elderly Daycare Web Platform (Singapore)  
Version: 1.0  
Date: 2025-09-29  

---

## 1. Overview  

### 1.1 Project Name  
ElderCare SG — Compassionate Daycare Solutions  

### 1.2 Description / Purpose  
A warm, modern, mobile-responsive platform that introduces families in Singapore to trusted elderly daycare services. The platform should establish credibility, convey care philosophy, enable visit bookings, and showcase the center’s programs, facilities, and staff through a humanized, accessible, and performance-optimized website.

### 1.3 Goals & Success Metrics  
- 30% increase in visit bookings within 3 months post-launch  
- Bounce rate < 40% on mobile and tablet  
- Lighthouse scores: Performance & Accessibility > 90  
- At least 5 minutes avg. session duration  
- All critical interactions (booking, testimonial scroll, CTA engagement) measured and optimized  

### 1.4 Target Audience & Use Cases  
- Adult children (30–55 yrs) of elderly Singaporean residents  
- Family members or domestic caregivers seeking daytime care for seniors  
- Healthcare professionals looking for a reliable referral center  

Use Cases:
- Learn about daycare services, safety, and staff quality  
- Watch a virtual tour to preview the environment  
- Schedule an in-person or virtual tour via CTA  
- Browse real caregiver/family testimonials  
- Access content seamlessly on mobile/tablet  

---

## 2. UI/UX Design System  

### 2.1 Color Scheme  
| Purpose               | Color         | Hex Code   |
|------------------------|----------------|------------|
| Primary Header / Trust | Deep Blue      | #1C3D5A    |
| Background             | Off-White      | #F7F9FC    |
| Accent Highlight       | Gold           | #F0A500    |
| Card Accent Background | Soft Amber     | #FCDFA6    |
| Positive / Wellness    | Calming Green  | #3D9A74    |
| Text (Dark Neutral)    | Slate Gray 1   | #334155    |
| Text (Mid Neutral)     | Slate Gray 2   | #64748B    |

- Contrast-ratio checks: All primary text combinations (dark-on-light, white-on-dark) meet WCAG 2.1 AA.  
- CTA text on #F0A500 uses #1C3D5A for contrast (passes AA).

### 2.2 Typography  
- Headings: Playfair Display (Google Fonts), font-display: swap  
- Body Text: Inter (Google Fonts), font-display: swap  

| Style       | Font               | Weight | Size     | Responsive Behavior |
|-------------|--------------------|--------|----------|---------------------|
| H1          | Playfair Display   | 700    | 40–64px  | Fluid (clamp)       |
| H2-H3       | Playfair Display   | 600    | 32–48px  | Fluid               |
| Body        | Inter              | 400    | 16–18px  | Base 1rem, scales   |
| CTA Button  | Inter (Caps)       | 600    | 18px     | Fixed               |

- Line height: 1.5em (body), 1.25em (headings)  
- Letter spacing: -0.01em (headings), normal (body)

### 2.3 Iconography / Imagery  
- Icons: Lucide outline style (monoline), SVG injected with aria-hidden + titles for accessibility  
- Photography: Lifestyle-focused, seniors engaged in meaningful activities (licensed)  
- Video: Ambient video of center life; H.265 + WebM fallback; muted autoplay with overlay  

### 2.4 Layout & Grid System  
- Container width: max-w-[1280px], px-6 gutter  
- Grid: Tailwind’s responsive grid + flex system  
- Mobile-first stack:  
  - Mobile (<768px): stacked, full-width  
  - Tablet (768–1023px): 2-column split  
  - Desktop (>1024px): 3-column grid when appropriate  

### 2.5 Navigation / Header / Footer  
- Header:  
  - Logo left, nav center, CTA right  
  - Sticky + glassmorphism blur after scroll  
  - Mobile nav: overlay with slide-in animation  
- Footer:  
  - Left: Contact info  
  - Center: Newsletter form (email only)  
  - Right: Associations, certifications, grayscale logos  
  - Above footer: Press logos (social proof)  

### 2.6 Main Screen Sections (Landing Page)

1. Hero Section  
   - Background: full-screen looping muted video  
   - Overlay: 60% dark gradient  
   - Copy: Primary headline, subhead, dual CTA ("Book Visit", "Watch Tour")  
   - Lightbox video player with static fallback image if prefers-reduced-motion  

2. Program Highlights  
   - 3 Cards: “Day Programs,” “Wellness,” “Family Support”  
   - shadcn/card with hover elevation & icons  
   - Alternating color backgrounds (warm/neutral)

3. Our Care Philosophy  
   - 2-column: image left, text right  
   - “Our Pillars”: Safety, Engagement, Dignity  
   - Timeline steps with shadcn/Steps  
   - Animated counters: years of service, certifications

4. Testimonials Carousel  
   - Horizontal auto-scroll  
   - Built with Embla or shadcn/Carousel  
   - Pause on hover, arrow nav, aria-labels  

5. Virtual Tour CTA  
   - Split layout: facility photo + overlay card  
   - CTA Button with animated gradient border  
   - Feature badges: Meals, Transportation, Medical Safety  

6. Footer  
   - Described above  

### 2.7 Responsive Behavior / Breakpoints  
| Device     | Min Width | Max Width | Behavior                              |
|------------|-----------|-----------|----------------------------------------|
| Mobile     | 320px     | 767px     | Full-width stack, nav overlay          |
| Tablet     | 768px     | 1023px    | 2-column layout, sticky nav            |
| Desktop    | 1024px+   | —         | Grid layout, hover effects enabled     |

### 2.8 Interaction & Animation Guidelines  
- Hover: scale(1.03), subtle shadow  
- Scroll-triggered fade-in (IntersectionObserver)  
- Button pulse (CTA only)  
- Carousel: auto-scroll + keyboard controls  
- Easing: ease-out-cubic, duration: 300ms  
- Disable all animations via prefers-reduced-motion  

---

## 3. Functional Requirements  

- Booking CTA  
  - Prefetch /route/booking for speed  
  - External link to embedded scheduler (assumed: Calendly or internal Laravel page)  
  - Track click via JS

- Video & Media  
  - Hero: MP4/WebM source  
  - Static fallback for accessibility  

- Carousel  
  - Testimonial content (5 entries min)  
  - Autoplay with user pause  
  - Accessible via keyboard

- Newsletter Form  
  - Input: email only  
  - Backend: Laravel form controller → Mailchimp API  

- CMS Integration  
  - TBD — likely static content via Blade partials  
  - Testimonials, programs, mission stored as Blade sections

---

## 4. Non‑Functional Requirements  

### 4.1 Performance Targets  
- Lighthouse Performance Score: >90  
- Image optimization: WebP preferred  
- Lazy loading: images, video, non-critical scripts  
- Minified + purged CSS (Tailwind purge)

### 4.2 Accessibility Standards  
- WCAG 2.1 AA compliance  
- Keyboard navigability (header, modals, carousels)  
- alt text, aria-labels, semantic HTML5  

### 4.3 Browser / Platform Support  
- Chrome (90+), Safari (13+), Firefox (85+), Edge (Chromium)  
- Responsive to iOS Safari, Android Chrome  

---

## 5. Constraints & Assumptions  

### 5.1 Technology Stack  
- Backend: Laravel 12, PHP 8.2  
- Frontend: Blade templates, TailwindCSS, Alpine.js  
- Data: MariaDB  
- Background Tasks: Redis Queues  
- CI/CD: GitHub Actions  

### 5.2 Resource / Time Constraints  
- Copywriting & testimonials must be ready pre-dev freeze  
- Video/photography must be licensed for commercial use  
- Accessibility audit budgeted into QA phase  

### 5.3 Branding / Legal  
- All logos, color palette, and mission values aligned to eldercare license compliance  
- Content tone to reflect balance of professionalism + warmth  

---

## 6. Deliverables  

| Type               | Description                                               |
|--------------------|-----------------------------------------------------------|
| 🎨 Style Guide     | Color tokens, typography scales, spacing, motion rules   |
| 🧩 Component Spec   | Card, Carousel, Hero CTA, Modal, NavBar, Footer           |
| 📐 Wireframes       | Desktop + Mobile variants for 6 core sections            |
| 🖼️ Assets           | Hero video, icons, badges, press logos                   |
| 📄 Content          | Copy for hero, services, testimonials, mission           |
| ✅ QA Checklist     | Lighthouse, keyboard test, screen reader basics          |
| 🧪 Accessibility    | axe-core audit report                                     |

---

## 7. Validation Checklist

- [ ] Accessibility audit: axe-core, keyboard navigation, alt text  
- [ ] Performance test: Lighthouse > 90 (mobile & desktop)  
- [ ] Responsiveness: 320px → 1440px via Chrome DevTools  
- [ ] Functional test: all CTAs, nav, scrolls, modal triggers  
- [ ] Content review: clarity, compliance, tone-of-voice  
- [ ] Cross-browser QA: Chrome, Safari, Firefox, Edge  
- [ ] Animation QA: respects prefers-reduced-motion  
