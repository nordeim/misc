# Project Requirements Document - ElderCare SG

---

## 1. Project Overview  

ElderCare SG is a warm, mobile-responsive web platform that connects families in Singapore with licensed elderly daycare services. It balances emotional resonance and operational clarity, guiding adult children, caregivers, and healthcare professionals through discovery, trust-building, and booking workflows.

---

## 2. Objectives & Success Metrics  

- **Primary Objectives**  
  - Increase in-center visit bookings  
  - Strengthen brand trust and engagement  
  - Deliver an accessible, high-performance experience  

- **Key Metrics**  
  | Metric                                  | Target                                    |
  |-----------------------------------------|-------------------------------------------|
  | Visit bookings (3 months post-launch)   | +30% vs. baseline                         |
  | Mobile/tablet bounce rate               | < 40%                                     |
  | Average session duration                | ≥ 5 minutes                               |
  | Lighthouse scores (Performance, A11y)   | ≥ 90                                      |
  | Core Web Vitals                         | LCP < 2.5 s; FID < 100 ms; CLS < 0.1       |
  | CTA conversion rate (Book/Watch Tour)   | ≥ 15%                                     |

---

## 3. Scope & User Journeys  

### 3.1 Primary Use Cases  
- **Discovery:** Learn about safety, programs, staff  
- **Virtual Preview:** Watch a hero video or 360° tour  
- **On-Site Bookings:** Schedule visits, confirm via email/calendar  
- **Social Proof:** Browse and filter caregiver/family testimonials  
- **Newsletter Opt-In:** Subscribe for center updates  

### 3.2 User Flows  
1. Landing → Read Hero → “Watch Tour” modal  
2. Hero CTA → “Book Visit” → Booking form → Confirmation + Calendar invite  
3. Scroll → Program Highlights → Read details → Contact/Newsletter  
4. Testimonials → Filter by theme (Wellness, Safety)  
5. Footer → Associations & Certifications → Trust signals  

---

## 4. Technical Architecture & Stack  

| Layer                | Technology                        |
|----------------------|-----------------------------------|
| Frontend             | Blade + TailwindCSS + Alpine.js   |
| Design System        | shadcn/ui components library      |
| Backend              | Laravel 12 (PHP 8.2)              |
| Data Store           | MariaDB                           |
| Task Queue           | Redis                              |
| CI/CD                | GitHub Actions                     |
| CDN & Caching        | Cloudflare; image/video optimizer  |
| Monitoring            | Prometheus, Grafana; Sentry        |
| Accessibility Audit  | axe-core, manual keyboard tests    |

---

## 5. UI/UX Design System  

### 5.1 Branding & Tokens  
- **Color Palette**: primary (#1C3D5A), accent (#F0A500), background (#F7F9FC), success (#3D9A74)  
- **Typography**: Playfair Display (serif headings), Inter (body)  
- **Spacing**: 4px base, multiples via CSS custom properties  

### 5.2 Component Library  
- **Core Components**:  
  - HeroBanner (video + gradient overlay)  
  - ProgramCard (shadcn/Card)  
  - TestimonialCarousel (Embla)  
  - BookingModal (prefetch, embed scheduler)  
- **Accessibility**: semantic HTML; aria-labels; focus styles  

### 5.3 Layout & Responsiveness  
- **Container**: max-width 1280px, px-6  
- **Grid**: mobile-first; 1→2→3 columns at 320–767px, 768–1023px, ≥1024px  
- **Breakpoint System**: Tailwind defaults with custom design tokens  

### 5.4 Interaction & Animation  
- Hover scale(1.03) + subtle shadow  
- IntersectionObserver for reveal-on-scroll  
- CSS variables for easing/duration  
- Disable via `prefers-reduced-motion`  

---

## 6. Functional Requirements  

1. **Booking Workflow**  
   - Prefetch `/booking` route  
   - Embed Calendly or Laravel scheduler  
   - Double-opt-in email + ICS calendar invite  
   - JS event tracking (GA4, Segment)  

2. **Hero Video**  
   - H.265 + WebM; CDN streaming + HLS fallback  
   - Static poster for reduced-motion  
   - Autoplay muted; user controls  

3. **Testimonials**  
   - Min. 5 entries; CMS-driven  
   - Carousel with pause, arrow, keyboard nav  

4. **Newsletter Form**  
   - Email only; consent checkbox (PDPA)  
   - Laravel Controller → Mailchimp API  
   - Validation + error states  

5. **CMS Integration**  
   - Content via Blade partials + markdown  
   - Role-based editing in staging  

6. **Analytics & Monitoring**  
   - Custom Prometheus metrics: page_views, form_submits, video_plays  
   - Grafana dashboard + alert rules (error rate > 1%)  

---

## 7. Non-Functional Requirements  

- **Performance**  
  - Image → WebP; lazy-load offscreen  
  - CSS purged & minified; JS bundles < 150 KB  
  - Cache headers + CDN invalidation strategy  

- **Accessibility (WCAG 2.1 AA)**  
  - Color contrast ≥ 4.5:1  
  - Keyboard nav through all interactive elements  
  - ARIA roles & labels for modals, carousels  

- **Security & Privacy**  
  - HTTPS everywhere; HSTS  
  - PDPA-compliant data handling (user consent logs)  
  - CSP headers; input sanitization  

- **Browser Support**  
  - Latest Chrome, Safari, Firefox, Edge  
  - Graceful degradation in IE11 if required  

---

## 8. Constraints, Dependencies & Risks  

- **Dependencies**  
  - Licensed hero video assets by dev freeze  
  - Copy & testimonials finalized before dev start  
- **Risks**  
  - Calendly embed latency → fallback link  
  - PDPA consent capture complexity  
  - Video streaming compatibility on older devices  
- **Mitigations**  
  - Preload critical assets; performance budgets  
  - Early legal review of consent flows  
  - Fallback static images + transcripts  

---

## 9. Roadmap & Deliverables  

| Phase           | Deliverables                                                              | Milestone Date |
|-----------------|----------------------------------------------------------------------------|----------------|
| Design          | Wireframes; Component specs; Style guide                                   | Week 1         |
| Implementation  | Core components; Booking flow; Video hero; CMS integration                 | Week 3         |
| Testing         | Accessibility report; Performance audit; Cross-browser QA                  | Week 4         |
| Launch Prep     | Content freeze; Final QA; Monitoring & Alerting configuration              | Week 5         |
| Go-Live         | Production release; Post-launch monitoring; Iteration backlog defined      | Week 6         |

---

## 10. Validation & QA Checklist  

- Accessibility (axe-core, manual)  
- Lighthouse (Performance, A11y, SEO)  
- Responsive (320–1440 px)  
- Functional (forms, modals, carousels, video)  
- Cross-browser regression  
- Monitoring alerts tested  
