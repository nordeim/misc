awesome understand! now, please meticulously plan and create the necessary project scaffold config and component files based on below `design.json` and `tokens.json`. Below is my typical tech stack for a frontend project.

$ npm list 
├── @next/bundle-analyzer@16.0.1
├── @radix-ui/react-label@2.1.8
├── @radix-ui/react-select@2.2.6
├── @radix-ui/react-slot@1.2.4
├── @stripe/react-stripe-js@5.3.0
├── @t3-oss/env-nextjs@0.13.8
├── @tanstack/react-query@5.90.7
├── @trpc/next@11.7.1
├── @trpc/react-query@11.7.1
├── @types/jest@30.0.0
├── @types/node@20.19.24
├── @types/react-dom@18.3.7
├── @types/react@18.3.26
├── @typescript-eslint/eslint-plugin@7.18.0
├── @typescript-eslint/parser@7.18.0
├── eslint-config-next@14.2.33
├── eslint-config-prettier@9.1.2
├── lucide-react@0.553.0
├── next-auth@4.24.13
├── next-pwa@5.6.0
├── next@14.2.33
├── postcss-preset-mantine@1.18.0
├── postcss-simple-vars@7.0.1
├── postcss@8.5.6
├── prettier-plugin-tailwindcss@0.7.1
├── prettier@3.6.2
├── react-dom@18.3.1
├── react-hook-form@7.66.0
├── react-server-dom-webpack@19.2.0
├── react@18.3.1
├── tailwind-merge@2.6.0
├── tailwindcss@3.4.18
├── typescript@5.9.3
├── vitest@4.0.8

## 1. Executive Summary

This UI expresses a **bright, soft, modern productivity dashboard** with:

- High contrast between a vivid pastel background and clean white cards.
- Rounded, pill-like components; generous negative space.
- Minimal, geometric sans-serif typography.
- Sparse but purposeful color and iconography.
- Emphasis on clarity, friendliness, and easy scannability.

I will first define a detailed mental model and implementation plan, then provide a complete `design.json` that an AI or team can use to reproduce this style systematically.

---

## 2. Detailed Plan

### 2.1. Deep Design Model (What we must capture)

1. **Foundations**
   - Color system: background, surface, accent, semantic colors, subtle neutrals.
   - Typography: font family, weights, hierarchy, size scale, letter-spacing.
   - Radii: global rounding style (cards, pills, avatars).
   - Shadows: soft, ambient, minimal elevation.
   - Layout: card-based grid, spacing scale, alignment.
   - Iconography: minimal line icons, circle badges.
   - Imagery: circular avatars, brand logos on pills.

2. **Core Principles**
   - Light, airy, optimistic.
   - High legibility, strong hierarchy.
   - Use of white surfaces on colored background.
   - Emphasis via accent color and filled pills.
   - Friendly, rounded geometry everywhere.

3. **Components to Encode**
   - Page layout / grid
   - Card containers (standard, special header cutout)
   - Top navigation / section headers
   - Calendar
   - Profile summary
   - Tags / chips
   - Notification item
   - Buttons (primary, secondary, ghost)
   - Toggles
   - Progress indicator (circular)
   - Milestone / stat card
   - Integration row
   - Avatar (single and group stack)
   - Pills for brands/payment methods
   - Badges (count, status)
   - Icon buttons / overflow menu (`...`)
   - Scroll behavior & hover states (stylistic guidance)

Each component definition will include: purpose, layout, spacing, radii, color usage, typography, and interaction states.

4. **Interaction & Motion (High-level)**
   - Micro hover elevations.
   - Smooth, fast ease-out transitions.
   - State colors for toggles, buttons, and selections.

5. **Constraints & Usage Guidelines**
   - Avoid visual clutter.
   - Use accent color sparingly for focus.
   - Maintain consistent spacing and radii across all UI.
   - Keep text concise.

### 2.2. JSON Structure (How we will represent it)

Planned top-level structure for `design.json`:

- `meta`
- `foundations`
  - `colors`
  - `typography`
  - `spacing`
  - `radii`
  - `shadows`
  - `borders`
  - `iconography`
- `layout`
  - `page`
  - `grid`
- `components`
  - `card`
  - `header`
  - `profileSummary`
  - `tag`
  - `button`
  - `iconButton`
  - `badge`
  - `avatar`
  - `avatarGroup`
  - `notificationItem`
  - `calendar`
  - `progressCircular`
  - `milestoneCard`
  - `integrationRow`
  - `toggle`
  - `pillBrand`
- `states`
  - `hover`
  - `active`
  - `focus`
  - `selected`
  - `disabled`
- `principles`
  - concise articulation of style & usage rules

Values will be specific enough to replicate the look but framed as guidelines (e.g. color hex approximations, scales, proportions).

### 2.3. Validation Criteria

The `design.json` is successful if:

- It fully expresses the look/feel of the reference without needing the image.
- It defines all core foundations and key components.
- It is logically structured, internally consistent, and implementable.
- An AI/engineer could design new screens with the same aesthetic using only this file.

I will now proceed to the meticulously constructed `design.json`.

---

## 3. `design.json`

```json
{
  "meta": {
    "name": "LimeAuraProductivityDashboard",
    "version": "1.0.0",
    "description": "Design language for a modern, bright, rounded, card-based productivity/dashboard UI set on a vivid pastel background with soft white surfaces and purple accents.",
    "intendedUse": "Serve as a comprehensive style and component guideline so an AI or design/development team can recreate this visual system consistently across web or product interfaces."
  },
  "foundations": {
    "colors": {
      "palette": {
        "backgroundMain": {
          "value": "#D6F25F",
          "description": "Vibrant lime-yellow base canvas; creates a fresh, energetic atmosphere. Use for root page background."
        },
        "surfacePrimary": {
          "value": "#FFFFFF",
          "description": "Primary card and content surface; always on top of backgroundMain."
        },
        "surfaceSoft": {
          "value": "#F9FAFB",
          "description": "Subtle internal surfaces (e.g. inputs, secondary pills) when slight differentiation is needed."
        },
        "textPrimary": {
          "value": "#111111",
          "description": "Main heading and key label text on white surfaces."
        },
        "textSecondary": {
          "value": "#555555",
          "description": "Supporting descriptions, timestamps, and explanatory text."
        },
        "textMuted": {
          "value": "#9CA3AF",
          "description": "Secondary metadata, less prominent helper copy."
        },
        "accentPrimary": {
          "value": "#7B3EFF",
          "description": "Primary accent (vibrant purple) used for highlights, progress, active toggles, and key UI emphasis."
        },
        "accentPrimarySoft": {
          "value": "#EDE7FF",
          "description": "Subtle accent background for accentPrimary elements (e.g. circular progress track, soft badges)."
        },
        "accentSecondary": {
          "value": "#00C6AE",
          "description": "Optional supporting accent (teal) for confirmations or variety, used sparingly."
        },
        "accentYellow": {
          "value": "#FFB020",
          "description": "Secondary warm accent for highlights (e.g., logo or subtle emphasis); use infrequently."
        },
        "borderSubtle": {
          "value": "#F0F0F0",
          "description": "Very light border for subtle separation when absolutely necessary."
        },
        "success": {
          "value": "#10B981",
          "description": "Affirmative actions (e.g. Accept button) and positive states."
        },
        "warning": {
          "value": "#FBBF24",
          "description": "Non-destructive alerts, badges if needed."
        },
        "danger": {
          "value": "#EF4444",
          "description": "Destructive or critical actions; rarely used in this visual system."
        },
        "white": {
          "value": "#FFFFFF",
          "description": "Base white."
        },
        "black": {
          "value": "#000000",
          "description": "Pure black (used minimally; prefer textPrimary)."
        }
      },
      "usageGuidelines": {
        "background": "Pages use a full-bleed backgroundMain with floating white cards for all content. Avoid white full-bleed backgrounds.",
        "accentUsage": "Use accentPrimary only for key interactive or quantitative elements (progress, toggles, active buttons, key icons), not as a generic decoration.",
        "semanticUsage": "Use success for affirmative CTAs or positive statuses; keep warning/danger limited and clean."
      }
    },
    "typography": {
      "fontFamily": {
        "primary": "'SF Pro Rounded', 'Nunito', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        "description": "Rounded or soft geometric sans-serif that reinforces friendliness and clarity."
      },
      "scale": {
        "h1": {
          "fontSize": 28,
          "fontWeight": 600,
          "lineHeight": 1.3,
          "letterSpacing": 0,
          "usage": "Primary card titles and key section headers (e.g. 'Amber website redesign')."
        },
        "h2": {
          "fontSize": 22,
          "fontWeight": 600,
          "lineHeight": 1.35,
          "letterSpacing": 0,
          "usage": "Secondary headers (e.g. 'Notifications', 'Integrations')."
        },
        "h3": {
          "fontSize": 18,
          "fontWeight": 500,
          "lineHeight": 1.4,
          "usage": "Subtitles (e.g. role titles, card sub-headlines)."
        },
        "bodyLarge": {
          "fontSize": 16,
          "fontWeight": 400,
          "lineHeight": 1.5,
          "usage": "Primary descriptive text and list content."
        },
        "body": {
          "fontSize": 14,
          "fontWeight": 400,
          "lineHeight": 1.5,
          "usage": "Secondary descriptions, timestamps."
        },
        "bodyBold": {
          "fontSize": 14,
          "fontWeight": 500,
          "lineHeight": 1.4,
          "usage": "Labels within components (e.g. 'Due date', 'Assignees')."
        },
        "label": {
          "fontSize": 12,
          "fontWeight": 500,
          "lineHeight": 1.3,
          "usage": "Small uppercase/small-caps or tight labels and badges."
        }
      },
      "styleGuidelines": {
        "overall": "Typography must remain minimal, clean, and left-aligned for readability. Limit font families to maintain cohesion.",
        "hierarchy": "Establish clear vertical hierarchy: heading, short supporting line, then interactive elements.",
        "emphasis": "Use weight (500-600) and size for emphasis; rarely use italics or underlines."
      }
    },
    "spacing": {
      "scale": {
        "xxs": 4,
        "xs": 6,
        "sm": 8,
        "md": 12,
        "lg": 16,
        "xl": 20,
        "xxl": 24,
        "xxxl": 32
      },
      "usageGuidelines": {
        "cardPadding": "Use 24 to 32 units padding inside primary cards.",
        "componentGap": "Use 8 to 16 units between related items; 20 to 32 between sections.",
        "consistency": "Maintain consistent spacing to preserve the airy, structured feel."
      }
    },
    "radii": {
      "scale": {
        "pill": 999,
        "cardLarge": 28,
        "cardMedium": 20,
        "button": 999,
        "input": 999,
        "avatar": 999
      },
      "usageGuidelines": {
        "cards": "Use large, soft radii for all cards (20-28).",
        "pills": "Use fully rounded radii (999) for tags, buttons, brand pills, and toggle handles.",
        "consistency": "No sharp corners; all UI elements should have soft, friendly corners."
      }
    },
    "shadows": {
      "elevations": {
        "none": "none",
        "card": "0 10 25 0 rgba(15, 23, 42, 0.06)",
        "floating": "0 18 40 0 rgba(15, 23, 42, 0.10)"
      },
      "usageGuidelines": {
        "cards": "Apply subtle, soft shadows to lift white cards from the lime background.",
        "hover": "On hover, slightly increase blur and vertical offset for interactive cards."
      }
    },
    "borders": {
      "default": {
        "width": 1,
        "color": "#F0F0F0",
        "radiusFallback": 20
      },
      "guidelines": {
        "usage": "Prefer separation through spacing and shadow. Use very light borders only when required to delineate areas."
      }
    },
    "iconography": {
      "style": "Minimal, line-based or simple filled icons with rounded shapes. Use accentPrimary or neutral grays. Do not use heavy detailed icons.",
      "size": {
        "small": 16,
        "medium": 20,
        "large": 24
      }
    }
  },
  "layout": {
    "page": {
      "backgroundColorRef": "backgroundMain",
      "padding": 40,
      "maxWidth": 1440,
      "alignment": "Centered main column or multi-column grid of floating cards on the lime background.",
      "guidelines": "Use a modular grid of cards. Maintain clear gutters between cards (24-32). Cards should never touch the viewport edges."
    },
    "grid": {
      "columns": 12,
      "gutter": 24,
      "cardPlacement": "Arrange cards in 2-4 columns depending on viewport; align top edges for a neat dashboard feel."
    }
  },
  "components": {
    "card": {
      "base": {
        "backgroundColorRef": "surfacePrimary",
        "borderRadiusRef": "cardLarge",
        "shadowRef": "card",
        "padding": {
          "top": 24,
          "right": 24,
          "bottom": 24,
          "left": 24
        },
        "gap": 16
      },
      "variants": {
        "standard": {
          "description": "Default container for sections like Notifications, Integrations, Lists."
        },
        "heroWithCutout": {
          "description": "Top-right concave cut or extended radius shape for visual interest (as seen in the 'Amber website redesign' card).",
          "behavior": "Maintain white surface; maintain strong corner rounding. Implementation can use custom border-radius or SVG mask."
        },
        "compact": {
          "padding": {
            "top": 16,
            "right": 20,
            "bottom": 16,
            "left": 20
          },
          "description": "For list rows or smaller content blocks (e.g. team members, brand pills container)."
        }
      },
      "header": {
        "titleStyleRef": "h2",
        "subtitleStyleRef": "body",
        "rightAction": "Optional pill-shaped ghost button or icon button (e.g. 'View details', overflow)."
      }
    },
    "header": {
      "sectionHeader": {
        "layout": "Horizontal: left-aligned title, optional right-aligned button or badge.",
        "titleStyleRef": "h2",
        "badge": {
          "style": "small pill or numeric badge inline with title",
          "color": "accentPrimary or textMuted depending on emphasis"
        }
      }
    },
    "profileSummary": {
      "description": "Profile card with avatar, name, role, and skill tags.",
      "layout": {
        "avatar": {
          "shape": "circle",
          "size": 64
        },
        "name": {
          "styleRef": "h2"
        },
        "role": {
          "styleRef": "body",
          "colorRef": "textSecondary"
        },
        "tags": {
          "componentRef": "tag",
          "layout": "Wrap horizontally under role text."
        },
        "options": {
          "componentRef": "iconButton",
          "position": "Top-right (overflow menu)."
        }
      }
    },
    "tag": {
      "description": "Soft pill labels used for skills, topics, and filters.",
      "style": {
        "backgroundColorRef": "surfaceSoft",
        "textColorRef": "textPrimary",
        "borderRadiusRef": "pill",
        "paddingX": 14,
        "paddingY": 6,
        "fontSize": 12,
        "fontWeight": 500
      }
    },
    "button": {
      "base": {
        "borderRadiusRef": "pill",
        "fontWeight": 500,
        "fontSize": 14,
        "paddingX": 18,
        "paddingY": 9,
        "alignment": "Center"
      },
      "variants": {
        "primary": {
          "backgroundColorRef": "accentPrimary",
          "textColor": "#FFFFFF",
          "shadow": "0 8 18 0 rgba(123, 62, 255, 0.25)"
        },
        "success": {
          "backgroundColorRef": "success",
          "textColor": "#FFFFFF"
        },
        "secondary": {
          "backgroundColor": "#FFFFFF",
          "borderColorRef": "borderSubtle",
          "textColorRef": "textPrimary"
        },
        "ghost": {
          "backgroundColor": "transparent",
          "textColorRef": "textPrimary",
          "border": "none"
        }
      }
    },
    "iconButton": {
      "description": "Circular or lightly-rounded button containing an icon (e.g., three dots).",
      "style": {
        "size": 32,
        "borderRadiusRef": "pill",
        "backgroundColor": "#FFFFFF",
        "iconColorRef": "textSecondary",
        "shadowRef": "none"
      }
    },
    "badge": {
      "numeric": {
        "shape": "circle",
        "minSize": 18,
        "backgroundColorRef": "accentPrimary",
        "textColor": "#FFFFFF",
        "fontSize": 10,
        "fontWeight": 600
      },
      "statusPill": {
        "borderRadiusRef": "pill",
        "paddingX": 10,
        "paddingY": 4,
        "backgroundColorRef": "accentPrimarySoft",
        "textColorRef": "accentPrimary",
        "fontSize": 11,
        "fontWeight": 500
      }
    },
    "avatar": {
      "single": {
        "shape": "circle",
        "size": 36,
        "border": {
          "width": 2,
          "colorRef": "surfacePrimary"
        }
      }
    },
    "avatarGroup": {
      "description": "Overlapping set of circular avatars for assignees.",
      "layout": {
        "overlapOffset": -10,
        "direction": "left-to-right",
        "maxVisible": 5
      },
      "style": {
        "borderColorRef": "surfacePrimary",
        "borderWidth": 2
      }
    },
    "notificationItem": {
      "description": "Row-based alerts inside the Notifications card.",
      "layout": {
        "orientation": "horizontal",
        "sections": [
          "avatar or icon",
          "textBlock",
          "timestamp and menu"
        ],
        "paddingY": 12,
        "gap": 12
      },
      "text": {
        "primaryStyleRef": "body",
        "secondaryStyleRef": "body",
        "colors": {
          "primary": "textPrimary",
          "secondary": "textSecondary"
        }
      },
      "actions": {
        "inlineButtons": {
          "useButtonVariants": [
            "success (e.g. Accept)",
            "secondary (e.g. Deny request)"
          ]
        }
      },
      "dividers": {
        "usage": "Use subtle spacing or extremely light separators. Avoid heavy lines."
      }
    },
    "calendar": {
      "description": "Minimal grid calendar inside a rounded white card.",
      "layout": {
        "header": {
          "centeredMonthYear": true,
          "navArrows": "iconButtons on left and right."
        },
        "weekdays": {
          "style": "Uppercase or small label with textMuted."
        },
        "daysGrid": {
          "alignment": "Centered numbers in a 7-column grid.",
          "cellSize": 36,
          "gap": 6
        }
      },
      "styles": {
        "defaultDay": {
          "textColorRef": "textPrimary"
        },
        "mutedDay": {
          "textColorRef": "textMuted"
        },
        "todayOrSelected": {
          "backgroundColorRef": "textPrimary",
          "textColor": "#FFFFFF",
          "borderRadiusRef": "pill"
        },
        "hover": {
          "backgroundColorRef": "surfaceSoft"
        }
      }
    },
    "progressCircular": {
      "description": "Circular progress indicator used in milestone and hero cards.",
      "style": {
        "size": 40,
        "strokeWidth": 6,
        "trackColorRef": "accentPrimarySoft",
        "progressColorRef": "accentPrimary",
        "label": {
          "position": "center or adjacent",
          "fontSize": 12,
          "fontWeight": 600,
          "textColorRef": "accentPrimary"
        }
      }
    },
    "milestoneCard": {
      "description": "Compact card showing milestone, due date, progress circle, and assignee avatars.",
      "baseRef": "card.compact",
      "layout": {
        "topRow": "Title on left, small ghost button (View details) on right.",
        "middleRow": "Left: labels ('Due date', 'Assignees'); Right: circular progress.",
        "bottomRow": "AvatarGroup for assignees as needed."
      },
      "typography": {
        "titleStyleRef": "h3",
        "labelStyleRef": "bodyBold",
        "valueStyleRef": "body"
      }
    },
    "integrationRow": {
      "description": "Row featuring a service (Slack, Google Meet, Github) with description and toggle.",
      "layout": {
        "orientation": "horizontal",
        "sections": [
          "serviceIcon",
          "serviceNameAndDescription",
          "toggle"
        ],
        "gap": 14,
        "paddingY": 12
      },
      "typography": {
        "nameStyleRef": "bodyBold",
        "descriptionStyleRef": "body",
        "descriptionColorRef": "textSecondary"
      }
    },
    "toggle": {
      "description": "iOS-style pill toggle.",
      "style": {
        "width": 44,
        "height": 24,
        "borderRadiusRef": "pill",
        "handleSize": 18,
        "off": {
          "trackColor": "#E5E7EB",
          "handleColor": "#FFFFFF"
        },
        "on": {
          "trackColorRef": "accentPrimary",
          "handleColor": "#FFFFFF"
        }
      }
    },
    "pillBrand": {
      "description": "Pill elements for external brands/payments (Stripe, Visa, etc.).",
      "style": {
        "backgroundColorRef": "surfacePrimary",
        "borderRadiusRef": "pill",
        "paddingX": 18,
        "paddingY": 9,
        "shadowRef": "card",
        "alignment": "Center",
        "content": "Brand logo centered with no additional text where possible."
      }
    }
  },
  "states": {
    "hover": {
      "cards": {
        "shadow": "0 14 30 0 rgba(15, 23, 42, 0.10)",
        "transform": "translateY(-1px)",
        "cursor": "pointer when card is interactive; default otherwise."
      },
      "buttons": {
        "primary": {
          "background": "#6B2FFF"
        },
        "secondary": {
          "background": "#F9FAFB"
        }
      }
    },
    "active": {
      "buttons": {
        "scale": 0.98,
        "shadow": "0 6 14 0 rgba(15, 23, 42, 0.18)"
      }
    },
    "focus": {
      "outline": {
        "style": "2px solid",
        "colorRef": "accentPrimarySoft",
        "offset": 2
      }
    },
    "selected": {
      "calendarDay": {
        "backgroundColorRef": "accentPrimary",
        "textColor": "#FFFFFF"
      },
      "chip": {
        "backgroundColorRef": "accentPrimarySoft",
        "textColorRef": "accentPrimary"
      }
    },
    "disabled": {
      "opacity": 0.4,
      "cursor": "not-allowed"
    }
  },
  "principles": {
    "visualTone": [
      "Friendly, optimistic, and modern.",
      "Use a bright, pastel lime canvas contrasted with crisp white cards.",
      "Communicate clarity and trustworthiness through clean typography and orderly layout."
    ],
    "composition": [
      "Cards float on the colored background; no heavy frames around the entire interface.",
      "Use consistent large radii and spacing to create a cohesive system.",
      "Group related information into self-contained cards with clear headers."
    ],
    "colorUsage": [
      "Accent colors exist to indicate importance or interactivity, not decoration.",
      "Predominantly white content areas; the lime background is always visible around them.",
      "Minimal simultaneous accent usage to avoid noise."
    ],
    "typographyUsage": [
      "Limit to one primary sans-serif family with subtle weight variations.",
      "Short, scannable copy; avoid long paragraphs inside cards.",
      "Clear typographic hierarchy: title, short description, interactive elements."
    ],
    "interaction": [
      "Micro-interactions are smooth and subtle with easing; avoid flashy animations.",
      "Hover and active states rely on small elevation/brightness changes, not dramatic color shifts."
    ],
    "densityAndClarity": [
      "Favor generous whitespace; never crowd elements.",
      "Ensure alignment across cards for a grid-like feel.",
      "Avoid decorative borders; rely on spacing, shadows, and alignment."
    ]
  }
}
```

# File: tokens.json
```json
{
  "$schema": "https://design-tokens.org/schema.json",
  "meta": {
    "name": "LimeAuraProductivityDashboardTokens",
    "version": "1.0.0",
    "description": "Foundational design tokens for the LimeAura Productivity Dashboard visual system. Strictly primitives and semantic tokens, suitable for multi-platform implementation."
  },
  "color": {
    "background": {
      "main": {
        "value": "#D6F25F",
        "type": "color",
        "description": "Primary page background; vibrant lime-yellow canvas."
      }
    },
    "surface": {
      "primary": {
        "value": "#FFFFFF",
        "type": "color",
        "description": "Main card and content surface."
      },
      "soft": {
        "value": "#F9FAFB",
        "type": "color",
        "description": "Subtle internal surfaces for inputs, secondary areas."
      }
    },
    "text": {
      "primary": {
        "value": "#111111",
        "type": "color",
        "description": "Primary text on light surfaces."
      },
      "secondary": {
        "value": "#555555",
        "type": "color",
        "description": "Secondary descriptive text."
      },
      "muted": {
        "value": "#9CA3AF",
        "type": "color",
        "description": "Metadata, timestamps, helper text."
      },
      "onAccent": {
        "value": "#FFFFFF",
        "type": "color",
        "description": "Text color on primary accent backgrounds."
      }
    },
    "accent": {
      "primary": {
        "value": "#7B3EFF",
        "type": "color",
        "description": "Core accent (purple) for key interactive and quantitative elements."
      },
      "primarySoft": {
        "value": "#EDE7FF",
        "type": "color",
        "description": "Soft purple used as accent track/background."
      },
      "secondary": {
        "value": "#00C6AE",
        "type": "color",
        "description": "Optional teal accent for confirmations or variety."
      },
      "yellow": {
        "value": "#FFB020",
        "type": "color",
        "description": "Warm accent for subtle highlights."
      }
    },
    "border": {
      "subtle": {
        "value": "#F0F0F0",
        "type": "color",
        "description": "Very light border/divider on white surfaces."
      }
    },
    "semantic": {
      "success": {
        "value": "#10B981",
        "type": "color",
        "description": "Positive actions and states."
      },
      "warning": {
        "value": "#FBBF24",
        "type": "color",
        "description": "Non-critical warnings and attention states."
      },
      "danger": {
        "value": "#EF4444",
        "type": "color",
        "description": "Critical/destructive actions."
      }
    },
    "common": {
      "white": {
        "value": "#FFFFFF",
        "type": "color"
      },
      "black": {
        "value": "#000000",
        "type": "color"
      }
    }
  },
  "font": {
    "family": {
      "primary": {
        "value": "'SF Pro Rounded', 'Nunito', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        "type": "fontFamily",
        "description": "Rounded/soft geometric sans-serif for all text."
      }
    },
    "size": {
      "h1": {
        "value": "28px",
        "type": "fontSize"
      },
      "h2": {
        "value": "22px",
        "type": "fontSize"
      },
      "h3": {
        "value": "18px",
        "type": "fontSize"
      },
      "bodyLg": {
        "value": "16px",
        "type": "fontSize"
      },
      "body": {
        "value": "14px",
        "type": "fontSize"
      },
      "label": {
        "value": "12px",
        "type": "fontSize"
      }
    },
    "weight": {
      "regular": {
        "value": 400,
        "type": "fontWeight"
      },
      "medium": {
        "value": 500,
        "type": "fontWeight"
      },
      "semibold": {
        "value": 600,
        "type": "fontWeight"
      }
    },
    "lineHeight": {
      "tight": {
        "value": 1.3,
        "type": "lineHeight"
      },
      "snug": {
        "value": 1.35,
        "type": "lineHeight"
      },
      "normal": {
        "value": 1.5,
        "type": "lineHeight"
      }
    },
    "letterSpacing": {
      "default": {
        "value": "0em",
        "type": "letterSpacing"
      }
    }
  },
  "spacing": {
    "xxs": {
      "value": "4px",
      "type": "spacing"
    },
    "xs": {
      "value": "6px",
      "type": "spacing"
    },
    "sm": {
      "value": "8px",
      "type": "spacing"
    },
    "md": {
      "value": "12px",
      "type": "spacing"
    },
    "lg": {
      "value": "16px",
      "type": "spacing"
    },
    "xl": {
      "value": "20px",
      "type": "spacing"
    },
    "xxl": {
      "value": "24px",
      "type": "spacing"
    },
    "xxxl": {
      "value": "32px",
      "type": "spacing"
    },
    "pagePadding": {
      "value": "40px",
      "type": "spacing",
      "description": "Recommended outer padding for main layout."
    },
    "cardPadding.default": {
      "value": "24px",
      "type": "spacing",
      "description": "Default internal padding for primary cards."
    },
    "cardPadding.compact": {
      "value": "16px",
      "type": "spacing",
      "description": "Internal padding for compact cards/rows."
    }
  },
  "radius": {
    "pill": {
      "value": "999px",
      "type": "borderRadius",
      "description": "Fully rounded; use for buttons, chips, toggles, avatars."
    },
    "card.lg": {
      "value": "28px",
      "type": "borderRadius",
      "description": "Large cards and hero surfaces."
    },
    "card.md": {
      "value": "20px",
      "type": "borderRadius",
      "description": "Standard cards and list containers."
    },
    "control": {
      "value": "999px",
      "type": "borderRadius",
      "description": "Small interactive elements that should appear pill-shaped."
    }
  },
  "shadow": {
    "none": {
      "value": "none",
      "type": "boxShadow"
    },
    "card": {
      "value": "0 10px 25px 0 rgba(15, 23, 42, 0.06)",
      "type": "boxShadow",
      "description": "Default elevation for white cards."
    },
    "floating": {
      "value": "0 18px 40px 0 rgba(15, 23, 42, 0.10)",
      "type": "boxShadow",
      "description": "Higher elevation for emphasized elements on hover or hero cards."
    },
    "accentSoft": {
      "value": "0 8px 18px 0 rgba(123, 62, 255, 0.25)",
      "type": "boxShadow",
      "description": "Soft accent shadow for primary buttons if needed."
    }
  },
  "border": {
    "width": {
      "none": {
        "value": "0px",
        "type": "borderWidth"
      },
      "hairline": {
        "value": "1px",
        "type": "borderWidth"
      },
      "focus": {
        "value": "2px",
        "type": "borderWidth"
      }
    },
    "color": {
      "subtle": {
        "value": "{color.border.subtle.value}",
        "type": "color"
      }
    }
  },
  "size": {
    "icon": {
      "sm": {
        "value": "16px",
        "type": "dimension"
      },
      "md": {
        "value": "20px",
        "type": "dimension"
      },
      "lg": {
        "value": "24px",
        "type": "dimension"
      }
    },
    "avatar": {
      "sm": {
        "value": "32px",
        "type": "dimension"
      },
      "md": {
        "value": "36px",
        "type": "dimension"
      },
      "lg": {
        "value": "64px",
        "type": "dimension"
      }
    },
    "control": {
      "toggle.width": {
        "value": "44px",
        "type": "dimension"
      },
      "toggle.height": {
        "value": "24px",
        "type": "dimension"
      },
      "toggle.handle": {
        "value": "18px",
        "type": "dimension"
      },
      "iconButton": {
        "value": "32px",
        "type": "dimension"
      },
      "progressCircular": {
        "value": "40px",
        "type": "dimension"
      },
      "calendarDay": {
        "value": "36px",
        "type": "dimension"
      }
    }
  },
  "motion": {
    "duration": {
      "fast": {
        "value": "120ms",
        "type": "duration"
      },
      "normal": {
        "value": "180ms",
        "type": "duration"
      }
    },
    "easing": {
      "standard": {
        "value": "cubic-bezier(0.25, 0.8, 0.25, 1)",
        "type": "cubicBezier"
      }
    }
  },
  "state": {
    "focus": {
      "outlineWidth": {
        "value": "{border.width.focus.value}",
        "type": "borderWidth"
      },
      "outlineColor": {
        "value": "{color.accent.primarySoft.value}",
        "type": "color"
      },
      "outlineOffset": {
        "value": "2px",
        "type": "dimension"
      }
    },
    "hover": {
      "card.shadow": {
        "value": "{shadow.floating.value}",
        "type": "boxShadow"
      },
      "button.primary.background": {
        "value": "#6B2FFF",
        "type": "color"
      },
      "button.secondary.background": {
        "value": "#F9FAFB",
        "type": "color"
      }
    },
    "disabled": {
      "opacity": {
        "value": 0.4,
        "type": "opacity"
      }
    }
  }
}
```
