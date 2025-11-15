{
  "meta": {
    "systemName": "LimeAuraProductivityDashboard",
    "version": "1.1.0",
    "description": "The definitive design system blueprint, synthesizing tokens, component recipes, and interaction logic from the v1.0 mockup. This file is intended as a comprehensive guide for AI or human developers.",
    "lastUpdated": "2025-11-15T08:30:00Z"
  },
  "principles": [
    {
      "name": "Performance First, Magic Second",
      "description": "All interactions (hover, active) MUST be implemented in pure CSS via pseudo-classes (:hover, :active, :focus) for hardware acceleration. JavaScript is only for state-based logic (e.g., onClick, onChange)."
    },
    {
      "name": "Token-Driven Styles",
      "description": "NEVER use magic numbers or hard-coded hex values. All styles (colors, spacing, radii, shadows, fonts, motion) MUST be derived from the `foundations` token object."
    },
    {
      "name": "Subtle, Staggered Animation",
      "description": "Motion provides a 'wow' factor. All primary layout elements (like cards) should animate in subtly (e.g., `fadeInFromBottom`) with a staggered delay based on their position."
    },
    {
      "name": "Friendly & Rounded",
      "description": "The 'Nunito' font is the primary driver of the friendly aesthetic. All components, from cards to buttons to form inputs, MUST use pill-like or heavily rounded radii (`radius.pill`, `radius.card.large`). No sharp corners."
    },
    {
      "name": "White Surfaces on Lime Canvas",
      "description": "The core layout metaphor is a 'lime canvas' (`background.main`) with 'floating' white cards (`surface.primary`). The background color should always be visible as padding around the cards."
    },
    {
      "name": "Accessibility is Non-Negotiable",
      "description": "All interactive elements must have clear `:focus` states (using `accent.primarySoft`). All components must be keyboard-navigable and include appropriate ARIA attributes (e.g., `role='button'`, `aria-selected`)."
    }
  ],
  "foundations": {
    "colors": {
      "background": {
        "main": { "value": "#D6F25F", "description": "Primary page background" }
      },
      "surface": {
        "primary": { "value": "#FFFFFF", "description": "Main card/content surface" },
        "soft": { "value": "#F9FAFB", "description": "Subtle internal surfaces (inputs, hover)" }
      },
      "text": {
        "primary": { "value": "#111111" },
        "secondary": { "value": "#555555" },
        "muted": { "value": "#9CA3AF" },
        "onAccent": { "value": "#FFFFFF" }
      },
      "accent": {
        "primary": { "value": "#7B3EFF" },
        "primarySoft": { "value": "#EDE7FF" }
      },
      "semantic": {
        "success": { "value": "#10B981" },
        "successSoft": { "value": "#D1FAE5" },
        "successDark": { "value": "#065F46" },
        "warning": { "value": "#FBBF24" },
        "warningSoft": { "value": "#FEF3C7" },
        "warningDark": { "value": "#92400E" },
        "danger": { "value": "#EF4444" }
      },
      "border": {
        "subtle": { "value": "#F0F0F0" }
      }
    },
    "typography": {
      "fontFamily": {
        "primary": { "value": "'Nunito', 'Inter', system-ui, sans-serif" }
      },
      "scale": {
        "h1": { "size": "28px", "weight": 600, "lineHeight": 1.3 },
        "h2": { "size": "22px", "weight": 600, "lineHeight": 1.35 },
        "h3": { "size": "18px", "weight": 500, "lineHeight": 1.4 },
        "body": { "size": "14px", "weight": 400, "lineHeight": 1.5 },
        "bodyBold": { "size": "14px", "weight": 500, "lineHeight": 1.4 },
        "label": { "size": "12px", "weight": 500, "lineHeight": 1.3 }
      }
    },
    "spacing": {
      "xxs": "4px",
      "xs": "6px",
      "sm": "8px",
      "md": "12px",
      "lg": "16px",
      "xl": "20px",
      "xxl": "24px",
      "xxxl": "32px"
    },
    "radii": {
      "pill": "999px",
      "cardLarge": "28px",
      "cardMedium": "20px",
      "avatar": "999px"
    },
    "shadows": {
      "card": "0 10px 25px 0 rgba(15, 23, 42, 0.06)",
      "floating": "0 18px 40px 0 rgba(15, 23, 42, 0.10)",
      "buttonPrimary": "0 8px 18px 0 rgba(123, 62, 255, 0.25)"
    },
    "motion": {
      "duration": {
        "fast": "120ms",
        "normal": "200ms",
        "slow": "300ms",
        "long": "500ms"
      },
      "easing": {
        "standard": "cubic-bezier(0.25, 0.8, 0.25, 1)"
      },
      "transition": {
        "all": "all 200ms cubic-bezier(0.25, 0.8, 0.25, 1)"
      }
    }
  },
  "layout": {
    "page": {
      "aiImplementationNotes": "Apply these styles to the 'body' tag.",
      "styles": {
        "backgroundColor": "foundations.colors.background.main",
        "fontFamily": "foundations.typography.fontFamily.primary",
        "color": "foundations.colors.text.primary",
        "padding": "foundations.spacing.xxxl",
        "minHeight": "100vh",
        "perspective": "1000px"
      }
    },
    "container": {
      "aiImplementationNotes": "This is the main dashboard container class, `.dashboard-container`.",
      "styles": {
        "maxWidth": "1440px",
        "margin": "0 auto",
        "display": "grid",
        "gridTemplateColumns": "repeat(auto-fit, minmax(350px, 1fr))",
        "gap": "foundations.spacing.xxl"
      },
      "responsive": {
        "maxWidth_768px": {
          "gridTemplateColumns": "1fr",
          "padding": "foundations.spacing.lg"
        }
      }
    }
  },
  "components": {
    "card": {
      "description": "The base floating white card. This is the primary surface for all content.",
      "aiImplementationNotes": "This is the `.card` class. It MUST have the 'fadeInFromBottom' animation applied with a staggered delay.",
      "base": {
        "backgroundColor": "foundations.colors.surface.primary",
        "borderRadius": "foundations.radii.cardLarge",
        "boxShadow": "foundations.shadows.card",
        "padding": "foundations.spacing.xxl",
        "transition": "foundations.motion.transition.all",
        "animation": "fadeInFromBottom 500ms var(--easing-standard) forwards",
        "opacity": 0
      },
      "states": {
        "hover": {
          "aiImplementationNotes": "Apply this hover only to interactive cards, NOT layout cards (like hero, calendar, etc.).",
          "boxShadow": "foundations.shadows.floating",
          "transform": "translateY(-4px) rotateX(2deg)"
        }
      }
    },
    "heroCard": {
      "description": "Variant of the Card for the main profile summary, with a 'cutout'.",
      "aiImplementationNotes": "This is `.hero-with-cutout`. It spans 2 columns on desktop. The cutout is a `::before` pseudo-element.",
      "base": {
        "extends": "card",
        "gridColumn": "span 2",
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "space-between",
        "overflow": "hidden"
      },
      "pseudoElements": {
        "before": {
          "content": "''",
          "position": "absolute",
          "top": "-40px",
          "right": "-40px",
          "width": "160px",
          "height": "160px",
          "backgroundColor": "foundations.colors.background.main",
          "borderRadius": "50%",
          "zIndex": 0,
          "animation": "fadeInFromBottom 600ms 200ms var(--easing-standard) forwards"
        }
      },
      "responsive": {
        "maxWidth_1200px": { "gridColumn": "span 1" },
        "maxWidth_768px": { "flexDirection": "column", "textAlign": "center" }
      }
    },
    "avatar": {
      "description": "Circular avatar for user profile images or initials.",
      "base": {
        "width": "64px",
        "height": "64px",
        "borderRadius": "foundations.radii.avatar",
        "background": "linear-gradient(135deg, var(--accent-primary), #5A20E0)",
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "center",
        "color": "foundations.colors.text.onAccent",
        "fontWeight": "foundations.typography.scale.h3.weight",
        "fontSize": "foundations.typography.scale.h3.size",
        "border": "3px solid var(--surface-primary)",
        "boxShadow": "0 4px 10px rgba(0,0,0,0.1)",
        "transition": "foundations.motion.transition.all"
      },
      "variants": {
        "groupMember": {
          "aiImplementationNotes": "Used in `.avatar-group`. Smaller size.",
          "width": "36px",
          "height": "36px",
          "fontSize": "14px",
          "borderWidth": "2px",
          "boxShadow": "0 2px 5px rgba(0,0,0,0.1)",
          "marginLeft": "-12px"
        },
        "addMore": {
          "aiImplementationNotes": "The '+2' avatar in a group.",
          "background": "foundations.colors.surface.soft",
          "color": "foundations.colors.text.secondary",
          "border": "2px dashed var(--border-subtle)",
          "boxShadow": "none"
        }
      },
      "states": {
        "hover": {
          "aiImplementationNotes": "Applies to group members.",
          "transform": "scale(1.1) translateY(-2px)",
          "zIndex": 10,
          "boxShadow": "foundations.shadows.floating"
        }
      }
    },
    "tag": {
      "description": "Small, pill-shaped tags for skills (e.g., 'UI/UX').",
      "base": {
        "backgroundColor": "foundations.colors.surface.soft",
        "color": "foundations.colors.text.primary",
        "borderRadius": "foundations.radii.pill",
        "padding": "var(--spacing-xs) var(--spacing-lg)",
        "fontSize": "foundations.typography.scale.label.size",
        "fontWeight": "foundations.typography.scale.label.weight",
        "transition": "foundations.motion.transition.all"
      },
      "states": {
        "hover": {
          "transform": "translateY(-2px)",
          "backgroundColor": "foundations.colors.accent.primarySoft",
          "color": "foundations.colors.accent.primary"
        }
      }
    },
    "progressCircular": {
      "description": "Circular progress bar, implemented with SVG.",
      "aiImplementationNotes": "Requires an `<svg>` element with two `<circle>` paths (track and fill) and a `<text>` element. The fill animation is critical.",
      "base": {
        "width": "40px",
        "height": "40px"
      },
      "parts": {
        "track": {
          "fill": "none",
          "stroke": "foundations.colors.accent.primarySoft",
          "strokeWidth": 6
        },
        "fill": {
          "fill": "none",
          "stroke": "foundations.colors.accent.primary",
          "strokeWidth": 6,
          "strokeDasharray": 100,
          "strokeDashoffset": 100,
          "transform": "rotate(-90 20 20)",
          "animation": "e.g., progressFill70 1s 0.5s var(--easing-standard) forwards"
        },
        "text": {
          "fontSize": "12px",
          "fontWeight": 600,
          "fill": "foundations.colors.accent.primary",
          "fontFamily": "foundations.typography.fontFamily.primary",
          "textAnchor": "middle"
        }
      }
    },
    "button": {
      "description": "The primary interactive element.",
      "aiImplementationNotes": "Base `.button` class. All states MUST be handled by CSS pseudo-classes.",
      "base": {
        "borderRadius": "foundations.radii.pill",
        "fontWeight": "foundations.typography.scale.bodyBold.weight",
        "fontSize": "foundations.typography.scale.body.size",
        "fontFamily": "foundations.typography.fontFamily.primary",
        "padding": "9px 18px",
        "border": "none",
        "cursor": "pointer",
        "transition": "foundations.motion.transition.all",
        "display": "inline-flex",
        "alignItems": "center",
        "justifyContent": "center",
        "minHeight": "36px"
      },
      "states": {
        "hover": {
          "transform": "translateY(-2px)"
        },
        "active": {
          "transform": "translateY(0px) scale(0.98)"
        }
      },
      "variants": {
        "primary": {
          "backgroundColor": "foundations.colors.accent.primary",
          "color": "foundations.colors.text.onAccent",
          "boxShadow": "foundations.shadows.buttonPrimary",
          "states": {
            "hover": {
              "backgroundColor": "#6B2FFF",
              "boxShadow": "foundations.shadows.floating"
            }
          }
        },
        "success": {
          "backgroundColor": "foundations.colors.semantic.success",
          "color": "foundations.colors.text.onAccent",
          "states": {
            "hover": {
              "backgroundColor": "#0da26c",
              "boxShadow": "0 6px 15px rgba(16, 185, 129, 0.25)"
            }
          }
        },
        "secondary": {
          "backgroundColor": "foundations.colors.surface.primary",
          "color": "foundations.colors.text.primary",
          "border": "1px solid var(--border-subtle)",
          "states": {
            "hover": {
              "backgroundColor": "foundations.colors.surface.soft",
              "borderColor": "#e0e0e0"
            }
          }
        },
        "ghost": {
          "backgroundColor": "transparent",
          "color": "foundations.colors.text.primary",
          "padding": "6px 12px",
          "states": {
            "hover": {
              "backgroundColor": "foundations.colors.surface.soft"
            }
          }
        }
      }
    },
    "iconButton": {
      "description": "A small, circular button with only an icon.",
      "base": {
        "width": "36px",
        "height": "36px",
        "borderRadius": "foundations.radii.pill",
        "backgroundColor": "transparent",
        "color": "foundations.colors.text.muted",
        "transition": "foundations.motion.transition.all"
      },
      "states": {
        "hover": {
          "backgroundColor": "foundations.colors.surface.soft",
          "color": "foundations.colors.text.primary",
          "transform": "scale(1.1)"
        }
      }
    },
    "badge": {
      "description": "Numeric notification badge.",
      "base": {
        "minWidth": "20px",
        "height": "20px",
        "borderRadius": "50%",
        "backgroundColor": "foundations.colors.accent.primary",
        "color": "foundations.colors.text.onAccent",
        "fontSize": "11px",
        "fontWeight": 700,
        "display": "inline-flex",
        "alignItems": "center",
        "justifyContent": "center",
        "fontFamily": "foundations.typography.fontFamily.primary"
      }
    },
    "statusPill": {
      "description": "A textual badge for status (e.g., 'In Progress').",
      "base": {
        "backgroundColor": "foundations.colors.accent.primarySoft",
        "color": "foundations.colors.accent.primary",
        "borderRadius": "foundations.radii.pill",
        "padding": "4px 10px",
        "fontSize": "11px",
        "fontWeight": 600,
        "display": "inline-flex"
      },
      "variants": {
        "success": {
          "backgroundColor": "foundations.colors.semantic.successSoft",
          "color": "foundations.colors.semantic.successDark"
        },
        "warning": {
          "backgroundColor": "foundations.colors.semantic.warningSoft",
          "color": "foundations.colors.semantic.warningDark"
        }
      }
    },
    "calendarDay": {
      "description": "A single day in the calendar grid.",
      "aiImplementationNotes": "JavaScript is required to manage the 'selected' class on click. All other states are CSS.",
      "base": {
        "width": "36px",
        "height": "36px",
        "display": "grid",
        "placeItems": "center",
        "borderRadius": "foundations.radii.pill",
        "fontSize": "foundations.typography.scale.body.size",
        "fontWeight": 500,
        "cursor": "pointer",
        "transition": "foundations.motion.transition.all"
      },
      "states": {
        "hover": {
          "backgroundColor": "foundations.colors.surface.soft",
          "transform": "scale(1.05)"
        },
        "today": {
          "backgroundColor": "foundations.colors.text.primary",
          "color": "foundations.colors.text.onAccent",
          "fontWeight": 700
        },
        "selected": {
          "backgroundColor": "foundations.colors.accent.primary",
          "color": "foundations.colors.text.onAccent",
          "fontWeight": 700
        },
        "todaySelected": {
          "extends": "selected",
          "boxShadow": "0 0 0 2px var(--surface-primary), 0 0 0 4px var(--accent-primary)"
        },
        "muted": {
          "color": "foundations.colors.text.muted",
          "opacity": 0.6,
          "cursor": "default"
        }
      }
    },
    "toggleSwitch": {
      "description": "A simple on/off switch.",
      "aiImplementationNotes": "Implement as an HTML `<label>` containing an `<input type='checkbox'>` and a `<span>`. All logic is driven by the `:checked` pseudo-class on the hidden input.",
      "parts": {
        "track": {
          "aiImplementationNotes": "The `.slider` span.",
          "position": "absolute",
          "cursor": "pointer",
          "top": 0, "left": 0, "right": 0, "bottom": 0,
          "backgroundColor": "#E5E7EB",
          "transition": "all 300ms var(--easing-standard)",
          "borderRadius": "foundations.radii.pill"
        },
        "handle": {
          "aiImplementationNotes": "The `.slider::before` pseudo-element.",
          "position": "absolute",
          "content": "''",
          "height": "18px",
          "width": "18px",
          "left": "3px",
          "bottom": "3px",
          "backgroundColor": "foundations.colors.surface.primary",
          "transition": "all 300ms var(--easing-standard)",
          "borderRadius": "50%",
          "boxShadow": "0 1px 3px rgba(0,0,0,0.1)"
        }
      },
      "states": {
        "checked": {
          "aiImplementationNotes": "Styles for `input:checked + .slider`.",
          "track": { "backgroundColor": "foundations.colors.accent.primary" },
          "handle": { "transform": "translateX(20px)" }
        },
        "focus": {
          "aiImplementationNotes": "Styles for `input:focus + .slider`.",
          "track": { "boxShadow": "0 0 0 3px var(--accent-primary-soft)" }
        }
      }
    }
  },
  "animations": {
    "fadeInFromBottom": {
      "keyframe": "@keyframes fadeInFromBottom { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }",
      "usage": "Applied to `.card` elements.",
      "aiImplementationNotes": "Apply with a staggered `animation-delay` for each card, e.g., `0.1s`, `0.2s`, `0.3s`..."
    },
    "progressFill": {
      "keyframe": [
        "@keyframes progressFill70 { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 30; } }",
        "@keyframes progressFill75 { from { stroke-dashoffset: 75; } to { stroke-dashoffset: 18.75; } }",
        "@keyframes progressFill40 { from { stroke-dashoffset: 75; } to { stroke-dashoffset: 45; } }"
      ],
      "usage": "Applied to the 'fill' circle in a `.progress-circular` SVG.",
      "aiImplementationNotes": "Use the correct keyframe based on the percentage value."
    }
  }
}
