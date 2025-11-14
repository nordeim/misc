document.addEventListener('DOMContentLoaded', () => {
    console.log('LimeAura Design System Demo Dashboard loaded successfully!');

    // Toggle switch functionality
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const slider = this.nextElementSibling;
            if (this.checked) {
                slider.style.backgroundColor = 'var(--accent-primary)';
            } else {
                slider.style.backgroundColor = '#E5E7EB';
            }
            this.parentElement.classList.toggle('active', this.checked);
        });
    });

    // Calendar day selection
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        if (!day.classList.contains('muted')) {
            day.addEventListener('click', function() {
                // Remove selected class from all days
                calendarDays.forEach(d => {
                    d.classList.remove('selected');
                    if (!d.classList.contains('today') && !d.classList.contains('muted')) {
                        d.style.backgroundColor = '';
                        d.style.color = 'var(--text-primary)';
                    }
                });
                
                // Add selected class to clicked day
                this.classList.add('selected');
                if (!this.classList.contains('today')) {
                    this.style.backgroundColor = 'var(--accent-primary)';
                    this.style.color = 'white';
                }
                
                // Update aria-selected for accessibility
                calendarDays.forEach(d => d.setAttribute('aria-selected', 'false'));
                this.setAttribute('aria-selected', 'true');
                
                // Update today indicator if needed
                const todayElement = document.querySelector('.calendar-day.today');
                if (todayElement && todayElement !== this) {
                    todayElement.classList.remove('selected');
                    todayElement.style.backgroundColor = 'var(--text-primary)';
                    todayElement.style.color = 'white';
                }
            });
        }
    });

    // Notification actions
    const acceptButtons = document.querySelectorAll('.notification-actions .button.success');
    acceptButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationItem = this.closest('.notification-item');
            notificationItem.style.opacity = '0.7';
            notificationItem.style.transform = 'translateX(10px)';
            setTimeout(() => {
                notificationItem.remove();
                updateNotificationBadge();
            }, 300);
        });
    });

    const denyButtons = document.querySelectorAll('.notification-actions .button.secondary');
    denyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationItem = this.closest('.notification-item');
            notificationItem.style.opacity = '0.5';
            notificationItem.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                notificationItem.remove();
                updateNotificationBadge();
            }, 300);
        });
    });

    // Hover effects for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('hero-with-cutout') && 
                !card.classList.contains('calendar-card') && 
                !card.classList.contains('integrations-card') && 
                !card.classList.contains('components-card')) {
                card.style.boxShadow = '0 14px 30px 0 rgba(15, 23, 42, 0.10)';
                card.style.transform = 'translateY(-1px)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'var(--shadow-card)';
            card.style.transform = 'translateY(0)';
        });
    });

    // Update notification badge count
    function updateNotificationBadge() {
        const badge = document.querySelector('.badge');
        const notificationItems = document.querySelectorAll('.notification-item');
        const count = notificationItems.length;
        
        if (count > 0) {
            badge.textContent = count.toString();
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // Button click animations
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.98)';
            button.style.boxShadow = '0 6px 14px 0 rgba(15, 23, 42, 0.18)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
            if (button.classList.contains('primary')) {
                button.style.boxShadow = 'var(--shadow-button-primary)';
            } else {
                button.style.boxShadow = '';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
            if (button.classList.contains('primary')) {
                button.style.boxShadow = 'var(--shadow-button-primary)';
            } else {
                button.style.boxShadow = '';
            }
        });
    });

    // Avatar group hover effects
    const avatars = document.querySelectorAll('.avatar');
    avatars.forEach(avatar => {
        avatar.addEventListener('mouseenter', () => {
            avatar.style.transform = 'scale(1.1)';
            avatar.style.zIndex = '10';
        });
        
        avatar.addEventListener('mouseleave', () => {
            avatar.style.transform = 'scale(1)';
            avatar.style.zIndex = '1';
        });
    });

    // Pill brand hover effects
    const pillBrands = document.querySelectorAll('.pill-brand');
    pillBrands.forEach(pill => {
        pill.addEventListener('mouseenter', () => {
            pill.style.transform = 'translateY(-2px)';
            pill.style.boxShadow = 'var(--shadow-floating)';
        });
        
        pill.addEventListener('mouseleave', () => {
            pill.style.transform = 'translateY(0)';
            pill.style.boxShadow = 'var(--shadow-card)';
        });
    });

    // Initialize calendar with today's date - already set in HTML for November 14, 2025
    const todayElement = document.querySelector('.calendar-day.today');
    if (todayElement) {
        todayElement.setAttribute('aria-selected', 'true');
    }

    // Add focus states for accessibility
    const focusableElements = document.querySelectorAll('button, .toggle-switch input, .calendar-day');
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid var(--accent-primary-soft)';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        });
    });

    console.log('LimeAura Design System Demo Dashboard initialized with all interactive features!');
});
