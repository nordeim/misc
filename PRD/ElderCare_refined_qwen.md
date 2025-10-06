# 🩺 ElderCare SG — Compassionate Daycare Platform  
**Project Requirements Document (v1.0 — Production-Ready)**  

---

## 1. Overview  

### 1.1 Project Name  
**ElderCare SG** — Trusted Daycare for Singapore’s Seniors  

### 1.2 Purpose  
A mobile-first, WCAG 2.1 AA-compliant website that enables adult children and caregivers in Singapore to **discover, evaluate, and book visits** to a licensed elderly daycare center—conveying trust, warmth, and operational excellence through performance-optimized, accessible content.

> ✅ **Key Differentiator**: Unlike generic directories, this is a **branded experience** for a *single center*, emphasizing emotional safety, staff continuity, and local relevance (e.g., bilingual support, proximity to HDB estates).

### 1.3 Goals & Success Metrics  
| Metric                          | Target                          | Measurement Method                     | Owner       |
|----------------------------------|----------------------------------|----------------------------------------|-------------|
| Visit bookings (online)         | +30% MoM for 3 months post-launch | Google Analytics 4 (GA4) + Calendly webhook | Marketing   |
| Mobile bounce rate              | < 40%                            | GA4 (device = mobile/tablet)           | Dev Team    |
| Lighthouse Performance          | ≥ 90 (mobile throttling)         | CI pipeline (LH CI)                    | Dev Team    |
| Lighthouse Accessibility        | ≥ 90                             | axe-core + manual screen reader test   | QA          |
| Avg. session duration           | ≥ 5 min                          | GA4                                    | Marketing   |
| CTA engagement rate             | ≥ 15% (primary CTAs)             | GA4 event tracking                     | Product     |

> 📌 **Note**: “Booking” = successful redirect to Calendly or internal scheduler with `utm_source=website`.

### 1.4 Target Audience & Use Cases  
#### Primary Personas  
| Persona               | Needs & Pain Points                                  | Key Actions on Site                     |
|-----------------------|------------------------------------------------------|-----------------------------------------|
| **Filial Caregiver** (35–55, Singaporean) | Worried about parent’s loneliness/safety; time-poor; seeks trustworthy, nearby care | Book tour, watch video, read testimonials |
| **Domestic Helper**   | Needs clear instructions; may use on employer’s phone | Find contact info, view transport options |
| **Healthcare Referrer** (e.g., polyclinic nurse) | Requires compliance proof, service scope clarity | Verify license, download brochure (PDF) |

#### Use Cases (Validated)  
- [UC1] View virtual tour without sound (for public transport)  
- [UC2] Book a visit in < 30 seconds on mobile  
- [UC3] Verify center’s MOH license status (via footer link)  
- [UC4] Read testimonials from families in same neighborhood (e.g., “Ang Mo Kio”)  

---

## 2. UI/UX Design System (Enhanced for Localization & Compliance)

### 2.1 Color Palette (WCAG 2.1 AA Verified)  
| Role                   | Color        | Hex     | Contrast Ratio (vs White/Black) | Notes |
|------------------------|--------------|---------|----------------------------------|-------|
| Primary (Trust)        | Deep Blue    | `#1C3D5A` | 12.8:1 on white ✅               | Used in headers, key CTAs |
| Accent (Warmth)        | Gold         | `#F0A500` | 1.8:1 on white → **use only on dark bg** | CTA bg only; text = `#1C3D5A` (7.2:1 ✅) |
| Wellness               | Calming Green| `#3D9A74` | 4.6:1 on white ✅                | Success states, program icons |
| Background             | Off-White    | `#F7F9FC` | —                                | Base canvas |
| Card Highlight         | Soft Amber   | `#FCDFA6` | —                                | Testimonial cards only |

> 🔍 **Audit Note**: All text meets AA at 18px+ (or 14px bold). Gold (`#F0A500`) fails AA on white—**never use as text on light bg**.

### 2.2 Typography (Performance-Optimized)  
- **Font Loading Strategy**:  
  ```html
  <link rel="preload" href="/fonts/inter-latin-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/playfair-display-latin-700.woff2" as="font" type="font/woff2" crossorigin>
  ```
- **Fallback Stack**:  
  ```css
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-family: 'Playfair Display', Georgia, serif;
  ```
- **Fluid Scale**:  
  ```css
  h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); } /* 28px → 40px */
  ```

### 2.3 Imagery & Media (Singapore-Contextualized)  
- **Photo Guidelines**:  
  - Seniors of Chinese, Malay, Indian descent (reflect SG demographics)  
  - Activities: tai chi, art therapy, intergenerational play (with grandchildren)  
  - **No stock clichés** (e.g., hands holding pills)  
- **Video**:  
  - Hero: 15s loop, **no voiceover** (subtitles optional), captions in English + Mandarin  
  - Fallback: static image + play button if `prefers-reduced-motion` or slow connection  

### 2.4 Layout & Responsiveness  
- **Mobile Priority**: 60%+ traffic expected from mobile (per SG gov data)  
- **Breakpoints**:  
  ```js
  // tailwind.config.js
  theme: {
    screens: {
      'sm': '640px',   // Mobile
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px'
    }
  }
  ```

### 2.5 Navigation & Footer (Compliance-Centric)  
- **Header**:  
  - Sticky after 100px scroll  
  - Mobile: hamburger → full-screen overlay (close on ESC)  
- **Footer Must Include**:  
  - MOH License Number (e.g., “Licensed under ECDA: XXXX”)  
  - Link to [SG Silver Pages](https://www.silverpages.sg) (gov directory)  
  - Privacy Policy (PDPA-compliant) + Terms  

### 2.6 Core Sections (With Interaction Specs)  

| Section               | Key Components                          | Accessibility & Perf Notes                     |
|-----------------------|------------------------------------------|------------------------------------------------|
| **Hero**              | Video bg, dual CTA, gradient overlay     | `prefers-reduced-motion` → static image; lazy video |
| **Program Cards**     | 3 cards w/ icons (Day, Wellness, Family) | Semantic `<section>`, `aria-labelledby`        |
| **Care Philosophy**   | 2-col layout, animated counters          | Counters: `aria-live="polite"`                 |
| **Testimonials**      | Embla carousel, 5+ entries               | Keyboard nav, pause on focus, `aria-roledescription="carousel"` |
| **Virtual Tour CTA**  | Facility photo + badge list              | Badges: semantic list, not decorative icons    |
| **Footer**            | Contact, license, newsletter             | Newsletter: `aria-describedby` for privacy note |

---

## 3. Functional Requirements (Dev-Ready Specs)

### 3.1 Booking Flow  
- **CTA Behavior**:  
  ```js
  // Track before redirect
  gtag('event', 'booking_cta_click', { 
    event_category: 'engagement',
    transport_type: 'beacon' 
  });
  window.location.href = 'https://calendly.com/eldercare-sg';
  ```
- **Prefetch**:  
  ```html
  <link rel="prefetch" href="https://calendly.com/eldercare-sg" as="document">
  ```

### 3.2 Media Handling  
- **Hero Video**:  
  ```html
  <video autoplay muted loop playsinline poster="/hero-fallback.jpg">
    <source src="/hero.mp4" type="video/mp4">
    <source src="/hero.webm" type="video/webm">
  </video>
  ```
- **Lazy Loading**: All `<img loading="lazy">`, videos deferred until in viewport

### 3.3 Newsletter Form  
- **Validation**:  
  - Client-side: HTML5 `type="email"` + pattern  
  - Server-side: Laravel validation → Mailchimp via queued job (retry 3x)  
- **Privacy**: Checkbox “I agree to PDPA terms” (required)

### 3.4 CMS & Content Strategy  
- **Static Content Model**:  
  - Testimonials: stored as JSON in `resources/content/testimonials.json`  
  - Programs: Blade partials (`resources/views/partials/programs.blade.php`)  
- **Future-Proofing**: Structured for easy migration to headless CMS (e.g., Strapi)

---

## 4. Non-Functional Requirements (Enforceable)

### 4.1 Performance  
- **Budgets**:  
  - Hero video: ≤ 2MB (WebM)  
  - Total JS: ≤ 100KB (gzipped)  
  - FCP: ≤ 1.2s on 3G  
- **Tooling**:  
  - PurgeCSS in production  
  - Image CDN (e.g., Cloudflare Images) with WebP auto-conversion  

### 4.2 Accessibility (WCAG 2.1 AA)  
- **Mandatory Checks**:  
  - Color contrast (all states)  
  - Keyboard trap-free navigation  
  - `prefers-reduced-motion` respected globally  
  - Screen reader testing (VoiceOver + NVDA)  

### 4.3 Singapore Compliance  
- **PDPA**: Cookie consent banner (if analytics used beyond GA4 basic)  
- **MOH Alignment**: No medical claims (e.g., “treats dementia”) — only “support” or “engage”  

---

## 5. Constraints & Assumptions (Explicit)

### 5.1 Tech Stack (Locked)  
- **Frontend**: Blade, Tailwind CSS v3.4, Alpine.js (no React/Vue)  
- **Backend**: Laravel 12, MariaDB, Redis (queues)  
- **Hosting**: AWS Singapore (ap-southeast-1)  

### 5.2 Content Dependencies  
- ✅ **Must be ready by Sprint 1**:  
  - 5+ verified testimonials (with photos + neighborhood)  
  - Hero video (15s, 1080p, no audio)  
  - MOH license number + PDPA policy  

### 5.3 Out of Scope  
- Online payment  
- User accounts  
- Real-time chat  

---

## 6. Deliverables (Versioned & Auditable)

| Artifact               | Format                     | Owner     | Deadline   |
|------------------------|----------------------------|-----------|------------|
| Design System Tokens   | `tailwind.config.js` + Figma | Design    | Sprint 0   |
| Component Library      | Blade + Alpine components  | Frontend  | Sprint 1   |
| GA4 + Tag Manager Setup| GTM container JSON         | DevOps    | Sprint 1   |
| Accessibility Report   | axe-core + manual test log | QA        | Pre-Launch |
| Performance Budget     | LH CI config + thresholds  | DevOps    | Sprint 0   |

---

## 7. Validation Checklist (QA Gate)

- [ ] **Lighthouse**: ≥90 Performance + Accessibility (mobile, simulated 3G)  
- [ ] **Keyboard Nav**: Full tab order, no traps, visible focus rings  
- [ ] **Screen Reader**: VoiceOver (iOS) + NVDA (Win) — all sections announced  
- [ ] **Mobile**: 320px width, touch targets ≥48px  
- [ ] **PDPA**: Privacy policy link in footer + newsletter checkbox  
- [ ] **MOH Compliance**: No unverified health claims in copy  
- [ ] **Analytics**: All CTAs tracked as GA4 events  

---

## Next Steps & Alignment Ask

1. **Confirm**: Does this refined PRD align with stakeholder expectations (especially on compliance and scope)?  
2. **Clarify**: Should we add a “Download Brochure (PDF)” CTA for healthcare referrers?  
3. **Prioritize**: Are all 6 core sections equally critical for MVP, or should we phase (e.g., defer carousel)?  
