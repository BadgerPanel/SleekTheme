# Sleek Theme

A complete visual overhaul for BadgerPanel. Designed to showcase the full extent of theme customisation for third-party developers.

## Install

1. Download `sleek.bptheme` from the [latest release](https://github.com/BadgerPanel/SleekTheme/releases)
2. In your panel, go to **Admin > Appearance > Themes**
3. Click **Import Theme** and activate

## What it changes

### Navigation
- **60px icon rail sidebar** replaces the default 256px sidebar. Icons only with tooltip labels on hover. Always dark, works across all client-facing layouts.
- **Horizontal tab strip** on the server console detail page replaces the default vertical sidebar tabs.

### Colour palette
- **Primary**: Indigo/violet gradient (`#7c3aed` to `#4f46e5`) replaces the default cyan
- **Dark mode**: Deep slate background (`hsl(230, 25%, 9%)`) with violet undertones
- **Light mode**: Warm gray (`hsl(240, 10%, 96%)`) with violet accents
- **All indigo references** globally remapped to violet equivalents
- **All zinc references** globally remapped to CSS variable tokens

### Server console
- **Circular canvas gauges** for CPU, RAM, and Disk in the stats panel (replaces progress bars)
- **Violet-palette mini-charts** in the bottom chart area
- **Restyled terminal** with darker background and violet command prompt
- **Power controls** with direct-colour buttons

### Charts & visualisations
- **Recharts** restyled with violet/indigo gradient fills, custom dark tooltip cards
- **ServerStatCard** with optional inline sparkline canvas
- **K8s ResourceGauge** SVG ring with violet stroke
- **ResourceGraphPanel** with violet period selector pills and tab underlines

### UI components
- **Button**: Default variant uses violet gradient with shadow
- **Card**: Shadow-based elevation, minimal borders
- **Badge**: Default variant uses violet gradient
- **Alert**: Info variant uses violet instead of blue
- **Spinner**: Violet colour

### Billing
- **Integrated mode**: Uses icon rail sidebar with `pl-[60px]`
- **Separate mode**: Violet gradient navigation bar, Sleek card/button styling

### Light / Dark mode
- Dark is the default. Sun/moon toggle in the header saves preference to localStorage.
- Inter font loaded dynamically via the header component.

## Override count

33 file overrides across:
- 5 UI components (button, card, badge, alert, spinner)
- 3 layout components (header, sidebar, footer)
- 10 server components (console, dashboard layout, sidebar tabs, stats panel, power controls, bottom charts, resource chart, graph panel, stat card, quick actions)
- 2 K8s components (gauge, bar)
- 1 resource monitor
- 7 layouts (dashboard, billing, support, account, auth, servers, servers/[id])
- 4 pages (login, forgot-password, dashboard, servers list)
- 1 CSS globals

Plus comprehensive CSS class remapping that covers all remaining pages without individual overrides.

## Building your own

See the [Standard Theme](https://github.com/BadgerPanel/StandardTheme) for the full development guide.
