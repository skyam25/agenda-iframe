# Zoom Agenda Widget Style Guide

Key styling specifications for the embedded iframe widget.

## Typography
- **Font**: System fonts (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Title**: 2rem (32px), weight 700 → 1.75rem mobile
- **Event Date**: 1.125rem (18px), weight 500 → 1rem mobile  
- **Session Name**: 1.375rem (22px), weight 600 → 1.25rem mobile
- **Session Time**: 0.9rem (14.4px), weight 500 → 0.8rem mobile
- **Description**: 1rem (16px), line-height 1.6

## Colors
```css
--bg-color: #f9fafb           /* Light gray background */
--card-bg: #ffffff            /* White cards */
--title-color: #111827        /* Near black titles */
--date-color: #6b7280         /* Medium gray date/meta */
--time-color: #6b7280         /* Time badges */
--desc-color: #4b5563         /* Description text */
--speaker-color: #374151      /* Speaker names */
```

## Spacing
- **Container**: 2rem vertical, 1.5rem horizontal → 1.5rem/1rem mobile
- **Card Padding**: 2rem → 1.5rem mobile
- **Card Gap**: 1.5rem between sessions
- **Title Margin**: 2.5rem bottom → 2rem mobile
- **Date Margin**: 2rem bottom → 1.5rem mobile

## Components

### Session Cards
- **Background**: White with subtle shadow
- **Border Radius**: 0.75rem (12px)
- **Border**: 1px solid #f3f4f6
- **Hover**: Enhanced shadow with 0.2s transition

### Time Badges
- **Style**: Pill-shaped, light gray background
- **Padding**: 0.5rem 0.75rem
- **Border**: 1px solid #e5e7eb

### Speaker Avatars
- **Size**: 48px → 44px mobile
- **Style**: Circular with white border and shadow

## Layout Options
- **List** (default): Single column
- **Grid**: Responsive columns (250px min → 300px → 350px)
- **Compact**: Reduced spacing

## Responsive
- **Breakpoint**: 768px
- **Mobile**: Typography scales down, headers stack vertically, reduced spacing

## Configurability

### ✅ Configurable via URL Parameters
- **Layout**: `layout=list|grid|compact`
- **Theme**: `theme=light|dark|minimal|custom`
- **Title**: `title=Custom Title`
- **Show Features**: `showSpeakers=true`, `showDate=true`
- **Behavior**: `autoResize=true`, `disableHover=true`
- **Dimensions**: `maxWidth=800px`

### ✅ Configurable via CSS Custom Properties
```css
/* Typography */
--title-size, --title-color, --title-align
--date-size, --date-color
--session-name-size, --session-name-color
--desc-size, --desc-color
--time-size, --time-color
--speakers-size, --speaker-color

/* Layout & Spacing */
--container-padding, --max-width
--session-gap, --card-padding
--title-margin, --date-margin

/* Visual Styling */
--bg-color, --card-bg
--card-radius, --card-shadow, --card-border
--card-hover-shadow, --card-hover-transform
--time-bg, --time-padding, --time-radius
```

### ✅ Configurable via URL (Custom Theme)
When `theme=custom`, these URL parameters override CSS:
- `bgColor=#f0f0f0`
- `cardBg=#ffffff`
- `titleColor=#000000`
- `sessionNameColor=#333333`
- `timeColor=#666666`
- `descColor=#555555`
- `dateColor=#777777`

### ❌ Not Configurable (Fixed)
- **Font Stack**: Always uses system fonts
- **Component Structure**: HTML layout and element hierarchy
- **Animation Timing**: Transitions and hover timing (0.2s)
- **Mobile Breakpoint**: Fixed at 768px
- **Grid Breakpoints**: 768px and 1024px responsive points
- **Avatar Sizes**: 48px desktop, 44px mobile
- **Loading Animation**: Pulse timing (2s cubic-bezier)
- **Border Styles**: Border types (always solid)
- **Text Formatting**: Line heights, letter spacing
- **Component Relationships**: Spacing ratios between elements

### ⚠️ Limited Configurability
- **Speaker Avatars**: Style is configurable but Gravatar/initials logic is fixed
- **Time Format**: Display format is fixed (12-hour with AM/PM)
- **Date Format**: Long format is fixed (weekday, month day, year)
- **Error/Loading States**: Messages and structure are fixed
- **Responsive Behavior**: Breakpoint triggers are fixed, only styling adapts

## Theming
All styles use CSS custom properties with fallbacks, enabling complete customization via variable overrides for white-label integration.