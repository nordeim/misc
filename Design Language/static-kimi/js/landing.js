/**
 * LimeAura Demo Dashboard - Interactive Enhancements
 * Progressive enhancement only; works without JS
 * @module LimeAuraDemo
 */

(function() {
  'use strict';

  // Utils
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Aurora Background Animation
  const AuroraBackground = {
    init() {
      if (prefersReducedMotion) return;
      
      const aurora = $('.aurora');
      if (!aurora) return;

      let hue1 = 75; // Starting near lime
      let hue2 = 85;
      let direction1 = 1;
      let direction2 = -1;

      const animate = () => {
        hue1 += 0.3 * direction1;
        hue2 += 0.2 * direction2;

        if (hue1 > 90 || hue1 < 70) direction1 *= -1;
        if (hue2 > 95 || hue2 < 75) direction2 *= -1;

        aurora.style.setProperty('--aurora-hue-1', hue1);
        aurora.style.setProperty('--aurora-hue-2', hue2);

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
  };

  // Card 3D Tilt & Parallax
  const CardAnimations = {
    init() {
      if (prefersReducedMotion) return;
      
      const cards = $$('.card[data-component]');
      if (!cards.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const progress = entry.target.querySelector('.progress-circular__fill');
            if (progress) this.animateProgress(progress);
          }
        });
      }, { threshold: 0.5 });

      cards.forEach(card => {
        observer.observe(card);
        this.addTiltEffect(card);
      });
    },

    animateProgress(fill) {
      const progress = parseInt(fill.closest('[data-progress]').dataset.progress, 10);
      const circumference = 2 * Math.PI * 17; // radius = 17
      const offset = circumference - (progress / 100) * circumference;
      
      fill.style.strokeDasharray = `${circumference} ${circumference}`;
      fill.style.strokeDashoffset = circumference;
      
      setTimeout(() => {
        fill.style.transition = 'stroke-dashoffset 1000ms cubic-bezier(0.4, 0, 0.2, 1)';
        fill.style.strokeDashoffset = offset;
      }, 200);
    },

    addTiltEffect(card) {
      let isHovered = false;
      
      card.addEventListener('mouseenter', () => { isHovered = true; });
      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
      
      card.addEventListener('mousemove', (e) => {
        if (!isHovered || prefersReducedMotion) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        card.style.boxShadow = '0 20px 40px rgba(15, 23, 42, 0.12)';
      });
    }
  };

  // Theme Switcher (Easter Egg)
  const ThemeSwitcher = {
    themes: {
      limeaura: { 
        backgroundMain: '#D6F25F', 
        accentPrimary: '#7B3EFF', 
        name: 'LimeAura' 
      },
      sunset: { 
        backgroundMain: '#FF6B6B', 
        accentPrimary: '#FF9F43', 
        name: 'Sunset' 
      },
      ocean: { 
        backgroundMain: '#4ECDC4', 
        accentPrimary: '#45B7D1', 
        name: 'Ocean' 
      }
    },

    init() {
      this.bindThemeButtons();
      this.bindHiddenTrigger();
      this.loadSavedTheme();
    },

    bindThemeButtons() {
      $$('.theme-option').forEach(button => {
        button.addEventListener('click', () => {
          const theme = button.dataset.theme;
          this.applyTheme(theme);
          this.saveTheme(theme);
        });
      });
    },

    bindHiddenTrigger() {
      const trigger = $('[data-theme-trigger]');
      if (!trigger) return;
      
      let clickCount = 0;
      trigger.addEventListener('click', () => {
        clickCount++;
        const themes = Object.keys(this.themes);
        const nextTheme = themes[clickCount % themes.length];
        this.applyTheme(nextTheme);
        this.saveTheme(nextTheme);
      });
    },

    applyTheme(themeKey) {
      const theme = this.themes[themeKey];
      if (!theme) return;

      const root = document.documentElement;
      root.style.setProperty('--color-background-main', theme.backgroundMain);
      root.style.setProperty('--color-accent-primary', theme.accentPrimary);
      root.dataset.theme = themeKey;

      // Update active state
      $$('.theme-option').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.theme === themeKey);
        btn.setAttribute('aria-label', `${theme.name} theme ${btn.dataset.theme === themeKey ? '(active)' : ''}`);
      });

      // Update text
      const currentThemeEl = $('#current-theme');
      if (currentThemeEl) currentThemeEl.textContent = theme.name;
    },

    saveTheme(theme) {
      try {
        localStorage.setItem('limeaura-theme', theme);
      } catch (e) {
        console.warn('Could not save theme preference:', e);
      }
    },

    loadSavedTheme() {
      try {
        const saved = localStorage.getItem('limeaura-theme');
        if (saved && this.themes[saved]) {
          this.applyTheme(saved);
        }
      } catch (e) {
        console.warn('Could not load theme preference:', e);
      }
    }
  };

  // Notification Demo (Simulated Real-time)
  const NotificationDemo = {
    init() {
      const badge = $('.badge--numeric');
      if (!badge) return;
      
      let count = parseInt(badge.textContent, 10);
      
      setInterval(() => {
        if (Math.random() > 0.7) {
          count++;
          badge.textContent = count;
          
          // Animate badge
          badge.style.transform = 'scale(1.2)';
          setTimeout(() => {
            badge.style.transform = 'scale(1)';
          }, 200);
        }
      }, 10000);
    }
  };

  // Calendar Interaction
  const CalendarInteraction = {
    init() {
      const days = $$('.calendar__day[role="gridcell"]');
      if (!days.length) return;
      
      days.forEach(day => {
        day.addEventListener('click', () => this.selectDay(day, days));
        day.addEventListener('keydown', (e) => this.handleKeydown(e, day, days));
      });
    },

    selectDay(selectedDay, allDays) {
      allDays.forEach(day => day.classList.remove('calendar__day--selected'));
      selectedDay.classList.add('calendar__day--selected');
      selectedDay.setAttribute('aria-selected', 'true');
      
      // Announce to screen readers
      const date = selectedDay.textContent;
      this.announce(`Selected October ${date}, 2025`);
    },

    handleKeydown(e, day, allDays) {
      const currentIndex = allDays.indexOf(day);
      let nextIndex = currentIndex;
      
      switch(e.key) {
        case 'ArrowRight':
          nextIndex = Math.min(currentIndex + 1, allDays.length - 1);
          break;
        case 'ArrowLeft':
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'ArrowDown':
          nextIndex = Math.min(currentIndex + 7, allDays.length - 1);
          break;
        case 'ArrowUp':
          nextIndex = Math.max(currentIndex - 7, 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.selectDay(day, allDays);
          return;
        default:
          return;
      }
      
      e.preventDefault();
      allDays[nextIndex].focus();
    },

    announce(message) {
      const announcer = $('#announcer') || this.createAnnouncer();
      announcer.textContent = message;
    },

    createAnnouncer() {
      const announcer = document.createElement('div');
      announcer.id = 'announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
      return announcer;
    }
  };

  // Initialize all modules when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    AuroraBackground.init();
    CardAnimations.init();
    ThemeSwitcher.init();
    NotificationDemo.init();
    CalendarInteraction.init();
  }

})();
