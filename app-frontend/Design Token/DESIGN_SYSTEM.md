# Too Good CRM - Design System Documentation

## Overview
This document outlines the design tokens and visual language for the Too Good CRM application.

---

## Color System

### Brand Colors
The application uses a dual-mode color system to differentiate between Vendor and Client interfaces.

#### Vendor Mode
- **Primary**: Purple (#667eea)
- **Secondary**: Deep Purple (#764ba2)
- **Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Usage**: Headers, primary buttons, accent elements

#### Client Mode
- **Primary**: Blue (#3b82f6)
- **Secondary**: Dark Blue (#1e40af)
- **Gradient**: `linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)`
- **Usage**: Headers, primary buttons, accent elements

### Semantic Colors

#### Success (Green)
- **Light**: #f0fdf4
- **Base**: #22c55e
- **Dark**: #15803d
- **Usage**: Success messages, completed states, positive actions

#### Error (Red)
- **Light**: #fef2f2
- **Base**: #ef4444
- **Dark**: #b91c1c
- **Usage**: Error messages, destructive actions, alerts

#### Warning (Orange)
- **Light**: #fffbeb
- **Base**: #f59e0b
- **Dark**: #b45309
- **Usage**: Warning messages, in-progress states, caution indicators

#### Info (Blue)
- **Light**: #eff6ff
- **Base**: #3b82f6
- **Dark**: #1d4ed8
- **Usage**: Informational messages, neutral actions

### Priority Colors
- **Urgent**: Red (#ef4444)
- **High**: Orange (#f97316)
- **Medium**: Blue (#3b82f6)
- **Low**: Gray (#6b7280)

### Status Colors
- **Open**: Blue (#3b82f6)
- **In Progress**: Orange (#f97316)
- **Completed/Resolved**: Green (#22c55e)
- **Closed**: Gray (#6b7280)
- **Pending**: Orange (#f97316)
- **Scheduled**: Blue (#3b82f6)
- **Failed**: Red (#ef4444)
- **Cancelled**: Gray (#6b7280)

### Neutral Colors
- **50**: #f9fafb (Very Light)
- **100**: #f3f4f6
- **200**: #e5e7eb
- **300**: #d1d5db
- **400**: #9ca3af
- **500**: #6b7280 (Base Gray)
- **600**: #4b5563
- **700**: #374151
- **800**: #1f2937
- **900**: #111827 (Very Dark)

---

## Typography

### Font Family
- **Primary**: System UI fonts
  ```
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
  ```
- **Monospace**: Code and data display
  ```
  ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace
  ```

### Font Sizes
| Token | Size | Usage |
|-------|------|-------|
| xs | 0.75rem (12px) | Metadata, captions |
| sm | 0.875rem (14px) | Body text, labels |
| md | 1rem (16px) | Default body |
| lg | 1.125rem (18px) | Subheadings |
| xl | 1.25rem (20px) | Section headings |
| 2xl | 1.5rem (24px) | Page subheadings |
| 3xl | 1.875rem (30px) | Page headings |
| 4xl | 2.25rem (36px) | Large headings |
| 5xl | 3rem (48px) | Hero text |

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Line Heights
- **Tight**: 1.25 (Headings)
- **Normal**: 1.5 (Body text)
- **Relaxed**: 1.7 (Long-form content)

---

## Spacing System

Based on 4px baseline grid:

| Token | Size | Usage |
|-------|------|-------|
| 0 | 0 | Reset |
| 1 | 0.25rem (4px) | Tight spacing |
| 2 | 0.5rem (8px) | Close elements |
| 3 | 0.75rem (12px) | Standard gap |
| 4 | 1rem (16px) | Default padding |
| 5 | 1.25rem (20px) | Comfortable spacing |
| 6 | 1.5rem (24px) | Section gaps |
| 8 | 2rem (32px) | Large gaps |
| 10 | 2.5rem (40px) | Section padding |
| 12 | 3rem (48px) | Page margins |

---

## Border Radius

| Token | Size | Usage |
|-------|------|-------|
| none | 0 | No rounding |
| sm | 0.125rem (2px) | Subtle rounding |
| md | 0.375rem (6px) | Buttons, inputs |
| lg | 0.5rem (8px) | Cards, containers |
| xl | 0.75rem (12px) | Featured cards |
| 2xl | 1rem (16px) | Hero sections |
| full | 9999px | Circular elements |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| md | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Cards, buttons |
| lg | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Dropdowns, modals |
| xl | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Featured elements |
| 2xl | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Hero sections |

---

## Responsive Breakpoints

| Breakpoint | Size | Usage |
|------------|------|-------|
| mobile | 320px | Mobile devices |
| tablet | 768px | Tablets, large phones |
| desktop | 1024px | Desktop screens |
| wide | 1280px | Large displays |

---

## Component Patterns

### Buttons
- **Primary**: Vendor purple / Client blue with white text
- **Secondary**: Outline style with colored border
- **Ghost**: Transparent background, visible on hover
- **Sizes**: sm (32px), md (40px), lg (48px)

### Cards
- **Background**: White
- **Border**: 1px solid gray.200
- **Radius**: lg (8px)
- **Shadow**: md
- **Padding**: 4-6 spacing units

### Input Fields
- **Height**: 40px (md), 48px (lg)
- **Border**: 1px solid gray.300
- **Focus**: 2px border, brand color
- **Radius**: md (6px)

### Badges
- **Sizes**: sm, md, lg
- **Variants**: subtle (light background), solid (colored background)
- **Radius**: full (pill shape)

### Tables
- **Header**: gray.50 background
- **Borders**: 1px solid gray.200
- **Hover**: gray.50 background
- **Mobile**: Convert to cards below 768px

---

## Accessibility

### Contrast Ratios
- **Normal text**: Minimum 4.5:1
- **Large text**: Minimum 3:1
- **UI components**: Minimum 3:1

### Focus States
- **Visible outline**: 2px solid brand color
- **Offset**: 2px from element

### Disabled States
- **Opacity**: 0.5
- **Cursor**: not-allowed

---

## Animation & Transitions

### Timing
- **Fast**: 150ms (hover effects)
- **Normal**: 300ms (standard transitions)
- **Slow**: 500ms (complex animations)

### Easing
- **Default**: cubic-bezier(0.4, 0, 0.2, 1)
- **In**: cubic-bezier(0.4, 0, 1, 1)
- **Out**: cubic-bezier(0, 0, 0.2, 1)

---

## Icon System

### Library
- **React Icons** (Feather Icons set)

### Sizes
- **xs**: 12px
- **sm**: 14px
- **md**: 16px
- **lg**: 20px
- **xl**: 24px

### Usage
- **Navigation**: 20px
- **Buttons**: 16-20px
- **Tables**: 16px
- **Large features**: 24px+

---

## Layout Grid

### Container
- **Max width**: 1280px
- **Padding**: 16px (mobile), 24px (tablet), 32px (desktop)

### Grid
- **Columns**: 12
- **Gap**: 16px (mobile), 24px (desktop)

---

## Best Practices

1. **Consistency**: Always use design tokens instead of hardcoded values
2. **Accessibility**: Maintain proper contrast ratios and focus states
3. **Responsiveness**: Design mobile-first, enhance for larger screens
4. **Performance**: Minimize animations on lower-end devices
5. **Branding**: Respect vendor/client mode color distinctions
6. **Whitespace**: Use spacing scale for consistent rhythm
7. **Typography**: Maintain hierarchy with size and weight
8. **Color**: Limit palette to maintain visual coherence
