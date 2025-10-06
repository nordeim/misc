# ElderCare SG — Compassionate Daycare Solutions

<div align="center">
  <img src="assets/logo.svg" alt="ElderCare SG Logo" width="200">
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Lighthouse Score](https://img.shields.io/badge/Lighthouse-92%2B-green)](https://github.com/GoogleChrome/lighthouse)
  [![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](https://www.w3.org/TR/WCAG21/)
  [![Build Status](https://github.com/eldercare-sg/web-platform/workflows/CI/badge.svg)](https://github.com/eldercare-sg/web-platform/actions)
  [![Coverage Status](https://coveralls.io/repos/github/eldercare-sg/web-platform/badge.svg?branch=main)](https://coveralls.io/github/eldercare-sg/web-platform?branch=main)
  
  <h3>A warm, modern, mobile-responsive platform connecting Singaporean families with trusted elderly daycare services</h3>
  
  [🌐 Live Demo](https://eldercare-sg.example.com) | [📖 Documentation](./docs) | [🎨 Design System](./docs/design-system.md) | [🧪 Accessibility Report](./docs/accessibility-report.md)
</div>

---

## Table of Contents

- [🌟 Project Overview](#-project-overview)
- [🎯 Goals & Impact](#-goals--impact)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🎨 Design System](#-design-system)
- [🔧 Development Workflow](#-development-workflow)
- [🧪 Testing Strategy](#-testing-strategy)
- [♿ Accessibility](#-accessibility)
- [📊 Performance](#-performance)
- [🇸🇬 Singapore Compliance](#-singapore-compliance)
- [🚀 Deployment](#-deployment)
- [📈 Monitoring](#-monitoring)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Project Overview

ElderCare SG is a thoughtfully designed web platform that serves as a bridge between Singaporean families and quality elderly daycare services. Built with compassion and technical excellence, our platform combines warm, human-centered design with robust, scalable architecture to create an experience that builds trust and facilitates meaningful connections.

### Key Features

- 📱 **Mobile-First Responsive Design**: Optimized for devices from 320px to 4K displays
- 🎥 **Virtual Tours**: Immersive video experiences showcasing facilities
- 📅 **Seamless Booking**: Integrated scheduling system for in-person and virtual visits
- 💬 **Authentic Testimonials**: Real stories from families and caregivers
- ♿ **Full Accessibility**: WCAG 2.1 AA compliant with Singapore-specific adaptations
- 🌏 **Multilingual Support**: English, Mandarin, Malay, and Tamil language options
- 🔒 **Privacy-First**: Full PDPA compliance with Singapore data residency

### Target Audience

- Adult children (30-55 years) of elderly Singaporean residents
- Family members or domestic caregivers seeking daytime care for seniors
- Healthcare professionals looking for reliable referral centers

---

## 🎯 Goals & Impact

### Business Goals

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Visit bookings increase | 30% within 3 months | Google Analytics conversion tracking |
| Mobile bounce rate | <40% | Google Analytics device-specific reports |
| Lighthouse Performance | >90 | Lighthouse CI integration |
| Lighthouse Accessibility | >90 | Lighthouse CI + axe-core automated tests |
| Average session duration | >5 minutes | Google Analytics engagement metrics |

### Social Impact

- 🏥 **Improved Access**: Connecting more families to quality eldercare services
- 👥 **Informed Decisions**: Providing transparent information to facilitate better choices
- 🌉 **Community Building**: Creating a supportive ecosystem for elderly care in Singapore
- 📚 **Knowledge Sharing**: Educating families about eldercare options and best practices

---

## 🏗️ Architecture

<div align="center">
  <img src="assets/architecture-diagram.svg" alt="System Architecture Diagram" width="800">
</div>

### Technology Stack

**Frontend**
- **Framework**: Next.js 14 with React Server Components
- **Styling**: TailwindCSS with custom design system tokens
- **State Management**: Zustand for client state, React Query for server state
- **Component Library**: Custom components built on Radix UI primitives
- **Animation**: Framer Motion with reduced motion support

**Backend**
- **API**: Laravel 12 with PHP 8.2
- **Database**: MariaDB with read replicas for scaling
- **Caching**: Redis for session and application caching
- **Search**: Elasticsearch for content search
- **File Storage**: AWS S3 with Singapore region

**Infrastructure**
- **Hosting**: AWS Singapore region
- **CDN**: Cloudflare with Singapore edge locations
- **Containerization**: Docker with Kubernetes orchestration
- **CI/CD**: GitHub Actions with automated testing and deployment

### Key Architectural Decisions

1. **Singapore Data Residency**: All infrastructure hosted in Singapore to comply with PDPA requirements
2. **Progressive Enhancement**: Core functionality works without JavaScript for maximum accessibility
3. **Mobile-First Design**: Responsive approach prioritizing mobile experience
4. **Performance-First**: Image optimization, lazy loading, and strategic caching throughout
5. **Security by Design**: End-to-end encryption, regular security audits, and comprehensive input validation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PHP 8.2+ and Composer
- MariaDB 10.6+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eldercare-sg/web-platform.git
   cd web-platform
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   composer install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Start development servers**
   ```bash
   # Frontend development server
   npm run dev
   
   # Backend development server
   php artisan serve
   ```

7. **Visit the application**
   ```
   Frontend: http://localhost:3000
   Backend API: http://localhost:8000
   ```

---

## 📁 Project Structure

```
eldercare-sg/
├── frontend/                 # Next.js frontend application
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   │   ├── layout/         # Layout components (header, footer, etc.)
│   │   └── sections/       # Page section components
│   ├── pages/              # Next.js pages
│   ├── styles/             # Global styles and Tailwind configuration
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── public/             # Static assets
│   └── tests/              # Frontend tests
├── backend/                 # Laravel backend application
│   ├── app/                # Application code
│   │   ├── Http/Controllers/ # API controllers
│   │   ├── Models/         # Eloquent models
│   │   └── Services/       # Business logic services
│   ├── database/           # Database migrations and seeders
│   ├── routes/             # API routes
│   ├── config/             # Configuration files
│   └── tests/              # Backend tests
├── docs/                   # Project documentation
│   ├── design-system.md    # Design system documentation
│   ├── api/                # API documentation
│   ├── deployment.md       # Deployment guides
│   └── accessibility.md    # Accessibility guidelines
├── assets/                 # Shared assets (images, icons, etc.)
├── scripts/                # Build and deployment scripts
└── .github/                # GitHub workflows and templates
```

---

## 🎨 Design System

Our design system reflects the warmth and professionalism of eldercare services while maintaining accessibility and performance standards.

### Color Palette

| Purpose | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Primary Header / Trust | Deep Blue | #1C3D5A | Headers, important CTAs |
| Background | Off-White | #F7F9FC | Main background |
| Accent Highlight | Gold | #F0A500 | Highlights, accents |
| Card Accent Background | Soft Amber | #FCDFA6 | Card backgrounds |
| Positive / Wellness | Calming Green | #3D9A74 | Success states, wellness features |
| Text (Dark Neutral) | Slate Gray 1 | #334155 | Primary text |
| Text (Mid Neutral) | Slate Gray 2 | #64748B | Secondary text |

All color combinations meet WCAG 2.1 AA contrast requirements.

### Typography

- **Headings**: Playfair Display (Google Fonts)
- **Body Text**: Inter (Google Fonts)
- **Font Loading**: font-display: swap for performance

### Component Library

Our component library is built with Radix UI primitives and customized for our specific needs:

- **Accessibility First**: All components include proper ARIA attributes
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Reduced Motion**: Respects prefers-reduced-motion settings
- **Responsive**: Mobile-first approach with fluid typography

For detailed component documentation, see our [Design System Guide](./docs/design-system.md).

---

## 🔧 Development Workflow

### Git Workflow

We follow a feature branch workflow:

1. Create a feature branch from `main`: `git checkout -b feature/feature-name`
2. Make changes and commit with conventional commits
3. Push to the remote branch: `git push origin feature/feature-name`
4. Create a pull request
5. Request code review from at least one team member
6. Address feedback and make necessary changes
7. Merge to `main` after approval

### Commit Convention

We use conventional commits for better readability and automated changelog generation:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Code Review Process

All code changes require review from at least one team member. Reviews focus on:

- Code quality and maintainability
- Performance implications
- Accessibility compliance
- Security considerations
- Test coverage

---

## 🧪 Testing Strategy

### Testing Pyramid

```
    E2E Tests (Playwright)
   ──────────────────────
  Integration Tests (Testing Library)
 ───────────────────────────────────
Unit Tests (Jest) - 90% coverage target
```

### Running Tests

```bash
# Frontend unit tests
npm run test

# Frontend unit tests with coverage
npm run test:coverage

# Frontend integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Backend unit tests
composer test

# Backend feature tests
composer test:feature
```

### Accessibility Testing

We use automated and manual accessibility testing:

```bash
# Automated accessibility tests
npm run test:a11y

# Manual accessibility testing checklist
npm run test:a11y:manual
```

---

## ♿ Accessibility

Accessibility is a core principle of our design and development process. We're committed to WCAG 2.1 AA compliance with special attention to Singapore's accessibility guidelines.

### Key Accessibility Features

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper semantic HTML and ARIA attributes
- **Text Resizing**: Text remains readable at 200% zoom
- **Color Contrast**: All text meets WCAG AA contrast requirements
- **Reduced Motion**: Respects prefers-reduced-motion settings
- **Focus Management**: Clear focus indicators and logical tab order
- **Multilingual Support**: Proper language tags and content adaptation

### Accessibility Testing

We use a combination of automated tools and manual testing:

- **Automated**: axe-core for continuous accessibility testing
- **Manual**: Screen reader testing with NVDA and VoiceOver
- **User Testing**: Regular testing with users with disabilities

For detailed accessibility guidelines, see our [Accessibility Documentation](./docs/accessibility.md).

---

## 📊 Performance

Performance is critical for our users, especially those accessing the platform on mobile devices or slower connections.

### Performance Targets

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| Lighthouse Performance | >90 | Lighthouse CI |
| First Contentful Paint | <1.5s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |
| Time to Interactive | <3.5s | Lighthouse |
| Cumulative Layout Shift | <0.1 | Lighthouse |

### Performance Optimization Techniques

- **Image Optimization**: WebP format with responsive images
- **Lazy Loading**: Images, videos, and non-critical scripts
- **Code Splitting**: Route-based and component-based code splitting
- **Caching Strategy**: Browser and CDN caching for static assets
- **Critical CSS**: Inline critical CSS for faster initial render
- **Font Loading**: font-display: swap for better perceived performance

### Performance Monitoring

We use continuous performance monitoring:

- **Lighthouse CI**: Automated performance testing in CI/CD
- **Real User Monitoring**: Sentry for real-world performance data
- **Synthetic Monitoring**: Regular performance checks from multiple locations

---

## 🇸🇬 Singapore Compliance

As a platform serving Singaporean residents, we comply with local regulations and cultural expectations.

### Data Protection

- **PDPA Compliance**: Full compliance with Singapore's Personal Data Protection Act
- **Data Residency**: All personal data stored within Singapore
- **Consent Management**: Explicit consent for all data collection
- **Data Retention**: Clear policies for data retention and deletion

### Healthcare Regulations

- **MOH Guidelines**: Compliance with Ministry of Health guidelines for eldercare facilities
- **License Display**: Clear display of all relevant licenses and certifications
- **Staff Credentials**: Verification and display of staff qualifications

### Cultural Adaptation

- **Multilingual Support**: English, Mandarin, Malay, and Tamil
- **Cultural Sensitivity**: Design and content adapted to Singapore's multicultural context
- **Local Context**: Integration with Singapore's healthcare and transport systems

For detailed compliance information, see our [Compliance Documentation](./docs/compliance.md).

---

## 🚀 Deployment

### Environments

- **Development**: Local development environment
- **Staging**: Staging environment for testing before production
- **Production**: Live production environment

### Deployment Process

1. **Code Review**: All changes must be reviewed and approved
2. **Testing**: All tests must pass
3. **Staging Deployment**: Deploy to staging for final verification
4. **Production Deployment**: Deploy to production with zero downtime
5. **Post-Deployment Verification**: Automated checks to ensure deployment success

### Deployment Scripts

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Rollback production
npm run rollback:production
```

For detailed deployment instructions, see our [Deployment Guide](./docs/deployment.md).

---

## 📈 Monitoring

We use comprehensive monitoring to ensure the platform's reliability and performance.

### Application Monitoring

- **Error Tracking**: Sentry for error tracking and reporting
- **Performance Monitoring**: Sentry and Lighthouse CI for performance metrics
- **Uptime Monitoring**: UptimeRobot for availability monitoring
- **User Analytics**: Google Analytics for user behavior analysis

### Infrastructure Monitoring

- **Server Metrics**: CloudWatch for server performance
- **Database Performance**: Custom monitoring for database performance
- **CDN Performance**: Cloudflare analytics for CDN performance

### Alerting

We have configured alerts for:

- Error rate increases
- Performance degradation
- Service availability issues
- Security events

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing a bug, implementing a feature, or improving documentation, we appreciate your help.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests if applicable**
5. **Ensure all tests pass**: `npm run test`
6. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a pull request**

### Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure a welcoming environment for all contributors.

### Contribution Guidelines

For detailed contribution guidelines, see our [Contributing Guide](./CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- The Singapore Ministry of Health for guidelines on eldercare services
- The Singapore Infocomm Media Development Authority for accessibility guidelines
- Our user testers and their families for valuable feedback
- The open-source community for the tools and libraries that make this project possible

---

## 📞 Contact

- **Project Maintainer**: [ElderCare SG Team](mailto:team@eldercare-sg.example.com)
- **Website**: [https://eldercare-sg.example.com](https://eldercare-sg.example.com)
- **Issues**: [GitHub Issues](https://github.com/eldercare-sg/web-platform/issues)

---

<div align="center">
  <p>Made with ❤️ for Singapore's elderly community and their families</p>
</div>
