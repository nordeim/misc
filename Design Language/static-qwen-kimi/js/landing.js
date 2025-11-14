/**
 * LimeAura Pro - Advanced Interactive System
 * Enhanced with spring physics, magnetic cursor, particles, and scroll timeline
 */

(function() {
  'use strict';

  // Utils
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isReducedMotion = prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Spring Physics Utility
  const spring = {
    to: (from, to, stiffness = 0.1, damping = 0.8, onUpdate) => {
      let velocity = 0;
      let value = from;
      
      const step = () => {
        const force = (to - value) * stiffness;
        velocity += force;
        velocity *= damping;
        value += velocity;
        
        if (Math.abs(velocity) > 0.01 || Math.abs(to - value) > 0.01) {
          onUpdate(value);
          requestAnimationFrame(step);
        } else {
          onUpdate(to);
        }
      };
      
      requestAnimationFrame(step);
    }
  };

  // Ambient Background System
  const AmbientBackground = {
    init() {
      if (isReducedMotion) return;
      
      this.animateGradient();
      this.generateParticles();
    },

    animateGradient() {
      const mesh = $('.gradient-mesh');
      if (!mesh) return;

      let time = 0;
      const animate = () => {
        time += 0.005;
        const hue1 = 75 + Math.sin(time) * 5;
        const hue2 = 85 + Math.cos(time * 0.7) * 8;
        
        mesh.style.background = `
          radial-gradient(circle at ${50 + Math.sin(time * 0.3) * 30}% ${50 + Math.cos(time * 0.4) * 30}%, 
            hsl(${hue1}, 70%, 80%) 0%, transparent 50%),
          radial-gradient(circle at ${50 + Math.cos(time * 0.5) * 40}% ${50 + Math.sin(time * 0.6) * 40}%, 
            hsl(${hue2}, 70%, 85%) 0%, transparent 50%)
        `;
        
        requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    },

    generateParticles() {
      const container = $('#particles');
      if (!container) return;

      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.setProperty('--x', Math.random() * 100);
        particle.style.setProperty('--y', Math.random() * 100);
        particle.style.setProperty('--size', Math.random() * 3 + 1);
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        container.appendChild(particle);
      }
    }
  };

  // Magnetic Cursor System
  const MagneticCursor = {
    init() {
      if (isReducedMotion) return;
      
      const cursor = $('#cursor');
      if (!cursor) return;

      let mouseX = 0, mouseY = 0;
      let cursorX = 0, cursorY = 0;
      
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      
      const updateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(updateCursor);
      };
      
      requestAnimationFrame(updateCursor);
      this.bindMagneticElements();
    },

    bindMagneticElements() {
      const magneticElements = $$('[data-magnetic]');
      
      magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => this.activateMagnetism(el));
        el.addEventListener('mouseleave', () => this.deactivateMagnetism(el));
      });
    },

    activateMagnetism(element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const onMove = (e) => {
        const deltaX = (e.clientX - centerX) * 0.1;
        const deltaY = (e.clientY - centerY) * 0.1;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const force = Math.min(distance / 20, 3);
        
        element.style.transform = `translate(${deltaX * force}px, ${deltaY * force}px) scale(1.05)`;
      };
      
      element.addEventListener('mousemove', onMove);
      element.dataset.magnetismHandler = onMove;
    },

    deactivateMagnetism(element) {
      const handler = element.dataset.magnetismHandler;
      if (handler) {
        element.removeEventListener('mousemove', handler);
        delete element.dataset.magnetismHandler;
      }
      
      spring.to(0, 0, 0.15, 0.9, (value) => {
        element.style.transform = `translate(${value}px, ${value}px) scale(1)`;
      });
    }
  };

  // Scroll Timeline Animation
  const ScrollTimeline = {
    init() {
      const sections = $$('.section');
      if (!sections.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateSection(entry.target);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '-20% 0px -20% 0px'
      });

      sections.forEach(section => observer.observe(section));
    },

    animateSection(section) {
      const elements = section.querySelectorAll('.card, .notification-item, .milestone-card');
      
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          spring.to(0, 1, 0.12, 0.85, (value) => {
            el.style.opacity = value;
            el.style.transform = `translateY(${30 - (30 * value)}px)`;
          });
        }, index * 100);
      });
    }
  };

  // Circular Progress Animation
  const ProgressAnimation = {
    init() {
      const progressElements = $$('.progress-circular--animated');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateProgress(entry.target);
          }
        });
      }, { threshold: 0.5 });

      progressElements.forEach(el => observer.observe(el));
    },

    animateProgress(element) {
      const progress = parseInt(element.dataset.progress, 10);
      const fill = element.querySelector('.progress-circular__fill');
      
      if (!fill) return;
      
      const circumference = 2 * Math.PI * 17;
      const offset = circumference - (progress / 100) * circumference;
      
      fill.style.strokeDasharray = `${circumference} ${circumference}`;
      fill.style.strokeDashoffset = circumference;
      
      setTimeout(() => {
        spring.to(circumference, offset, 0.08, 0.9, (value) => {
          fill.style.strokeDashoffset = value;
        });
      }, 200);
    }
  };

  // Enhanced Theme Switcher
  const ThemeSwitcher = {
    themes: {
      'limeaura-pro': { 
        backgroundMain: 'hsl(75, 70%, 75%)',
        accentPrimary: 'hsl(265, 100%, 62%)',
        name: 'LimeAura Pro',
        gradient: 'radial-gradient(at 20% 50%, hsl(75, 70%, 80%), transparent 50%)'
      },
      sunset: { 
        backgroundMain: 'hsl(15, 70%, 75%)',
        accentPrimary: 'hsl(25, 100%, 62%)',
        name: 'Sunset',
        gradient: 'radial-gradient(at 20% 50%, hsl(15, 70%, 80%), transparent 50%)'
      },
      ocean: { 
        backgroundMain: 'hsl(195, 70%, 75%)',
        accentPrimary: 'hsl(205, 100%, 62%)',
        name: 'Ocean',
        gradient: 'radial-gradient(at 20% 50%, hsl(195, 70%, 80%), transparent 50%)'
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
      
      // Animate theme transition
      root.style.transition = '--color-background-main 600ms ease, --color-accent-primary 600ms ease';
      
      root.style.setProperty('--color-background-main', theme.backgroundMain);
      root.style.setProperty('--color-accent-primary', theme.accentPrimary);
      root.dataset.theme = themeKey;

      // Update active state with animation
      $$('.theme-option').forEach(btn => {
        const isActive = btn.dataset.theme === themeKey;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-label', `${theme.name} theme ${isActive ? '(active)' : ''}`);
        
        if (isActive) {
          btn.style.transform = 'scale(1.1)';
          setTimeout(() => btn.style.transform = '', 300);
        }
      });

      $('#current-theme').textContent = theme.name;
    },

    saveTheme(theme) {
      try {
        localStorage.setItem('limeaura-pro-theme', theme);
      } catch (e) {
        console.warn('Could not save theme preference:', e);
      }
    },

    loadSavedTheme() {
      try {
        const saved = localStorage.getItem('limeaura-pro-theme');
        if (saved && this.themes[saved]) {
          this.applyTheme(saved);
        }
      } catch (e) {
        console.warn('Could not load theme preference:', e);
      }
    }
  };

  // Live Notification Demo
  const NotificationDemo = {
    init() {
      const badge = $('.badge--numeric');
      const list = $('.notification-list');
      if (!badge || !list) return;
      
      setInterval(() => {
        if (Math.random() > 0.85) {
          this.addNotification(list, badge);
        }
      }, 15000);
    },

    addNotification(list, badge) {
      const count = parseInt(badge.textContent, 10);
      badge.textContent = count + 1;
      
      // Animate badge
      spring.to(1, 1.3, 0.15, 0.8, (value) => {
        badge.style.transform = `scale(${value})`;
      });
      setTimeout(() => {
        spring.to(1.3, 1, 0.15, 0.8, (value) => {
          badge.style.transform = `scale(${value})`;
        });
      }, 300);

      // Add notification item
      const item = document.createElement('li');
      item.className = 'notification-item notification-item--enter';
      item.role = 'listitem';
      item.innerHTML = `
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="" class="avatar avatar--sm avatar--magnetic" data-magnetic>
        <div class="notification-item__content">
          <p class="notification-item__text"><strong>System</strong> generated a new insight</p>
          <time class="notification-item__time" datetime="">Just now</time>
        </div>
      `;
      
      list.insertBefore(item, list.firstChild);
      
      // Animate in
      item.style.opacity = '0';
      item.style.transform = 'translateX(-30px)';
      
      setTimeout(() => {
        spring.to(0, 1, 0.12, 0.85, (value) => {
          item.style.opacity = value;
          item.style.transform = `translateX(${-30 + (30 * value)}px)`;
        });
      }, 50);
    }
  };

  // Page Load Animation
  const PageLoadAnimation = {
    init() {
      if (isReducedMotion) {
        // Just show everything immediately
        $$('.card, .notification-item, .milestone-card').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        return;
      }

      // Hide elements initially
      $$('.card, .notification-item, .milestone-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px) scale(0.95)';
      });

      // Staggered reveal
      const cards = $$('.card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          spring.to(0, 1, 0.1, 0.88, (value) => {
            card.style.opacity = value;
            const translate = 40 - (40 * value);
            const scale = 0.95 + (0.05 * value);
            card.style.transform = `translateY(${translate}px) scale(${scale})`;
          });
        }, index * 150 + 300);
      });
    }
  };

  // Initialize all systems
  document.addEventListener('DOMContentLoaded', () => {
    PageLoadAnimation.init();
    AmbientBackground.init();
    MagneticCursor.init();
    ScrollTimeline.init();
    ProgressAnimation.init();
    ThemeSwitcher.init();
    NotificationDemo.init();
  });

})();
