# Visual Identity & Design System — Chess Arena

## 1. Brand Philosophy
Chess Arena represents focused, high-contrast, distraction-free chess.
- **Tone**: Calm, premium, confident, tactile.
- **Performance Targets**:
  - Interaction latency: < 100 ms
  - Piece animations: 120–250 ms
  - Motion accessibility: Honors `prefers-reduced-motion`

## 2. Color Palette & Token Architecture
Theme tokens are exposed via CSS custom variables in `:root` and `[data-theme="dark"]`.

### Dark Mode (Default)
- **Background Surface**: Deep charcoal / ink (`#0F1117`)
- **Card / Panel Surface**: Elevated slate (`#181B24`)
- **Border / Divider**: Subdued metallic (`#262B38`)
- **Text Primary**: Crisp ivory (`#F3F4F6`)
- **Text Muted**: Platinum silver (`#9CA3AF`)

### Light Mode
- **Background Surface**: Warm parchment (`#F8F6F0`)
- **Card / Panel Surface**: Clean paper (`#FFFFFF`)
- **Border / Divider**: Warm slate (`#E2DDD4`)
- **Text Primary**: Deep espresso (`#1C1917`)
- **Text Muted**: Graphite (`#6B7280`)

### Brand Accent: Emerald Arena (`#10B981` / `#059669`)
*Justification*: Unlike saturated blues or aggressive reds, Emerald provides an authentic, tournament-grade aesthetic reminiscent of classic green felt boards and international master clocks. It provides high contrast on both ink and parchment backgrounds without eye fatigue during long games.

## 3. Typography
- **Display / Headers**: `Outfit`, sans-serif (geometric, balanced proportions, confident title weight).
- **UI / Body**: `Inter`, system fallback (unrivaled legibility at dense information scales).
- **Move Notation & Clocks**: `JetBrains Mono` / `ui-monospace` (tabular numbers prevent jitter during rapid clock countdowns and SAN lists).

## 4. Board Themes
1. **Classic Emerald**: Buff (`#EEEED2`) & Emerald (`#769656`)
2. **Classic Wood**: Maple (`#F0D9B5`) & Walnut (`#B58863`)
3. **Slate & Ink**: Mist (`#DEE3E6`) & Deep Navy Slate (`#8CA2AD`)
4. **Ice Blue**: Frost (`#E0E8F0`) & Arctic Cobalt (`#4B7399`)
5. **Sand & Dune**: Cream (`#F4E7D3`) & Dune Sand (`#BFA37E`)
6. **Rosewood**: Almond (`#F2DFCE`) & Rosewood (`#9E5A44`)
7. **Midnight Cyber**: Charcoal (`#374151`) & Obsidian (`#111827`)
8. **High Contrast**: Pure White (`#FFFFFF`) & Rich Charcoal (`#2D3748`)

## 5. Piece Sets
All piece sets are delivered as lightweight, scalable SVGs:
1. **Staunton**: Tournament standard, clean silhouettes.
2. **Neo**: Modern flat geometric contours with subtle accents.
3. **Alpha**: Elegant classic serif design.
4. **High Contrast**: Thick stroke boundaries for maximum visibility.
5. **Minimalist**: Abstract outline shapes for rapid visual parsing.
6. **Glass**: Soft translucent shading for modern interfaces.

