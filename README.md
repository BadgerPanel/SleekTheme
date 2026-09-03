# Sleek Theme

A complete visual overhaul for BadgerPanel. It shows the full extent of theme
customization for third-party developers.

## Install

1. Download `sleek.bptheme` from the [latest release](https://github.com/BadgerPanel/SleekTheme/releases).
2. In your panel, go to **Admin > Appearance > Themes**.
3. Click **Import Theme**, then activate the theme.

## What it changes

### Navigation

Navigation runs along the top of the window in a 56px bar, so the page below it
gets the whole width. Every destination is written out rather than shown as an
icon you have to hover to identify, and the admin sections collapse into one
menu so the bar stays short for operators who never open them. On a narrow
screen the same destinations stack under the bar.

The server console detail page keeps its horizontal tab strip in place of the
default vertical sidebar tabs.

### Color palette

The panel is near enough to monochrome. Emphasis comes from contrast and weight
rather than hue, so a page of numbers reads as a page of numbers.

- **Background**: `hsl(220, 14%, 7%)`, with cards a few percent lighter.
- **Primary**: near-white, with dark text on it.
- **Accent**: one blue, `hsl(213, 90%, 62%)`, used for focus rings, links, chart
  lines and filled buttons. Filled buttons use a darker blue so white text on
  them stays above 4.5:1.
- **Indigo and zinc references** across the rest of the panel remap to this
  palette, which covers pages that have no override of their own.

### Server console

- **Circular canvas gauges** for CPU, RAM, and Disk in the stats panel. They
  replace the progress bars.
- **Restyled terminal** with a darker background.
- **Power controls** with direct-color buttons.

### Charts and visualizations

- **Recharts** restyled with a single accent fill and dark tooltip cards.
- **ServerStatCard** with an optional inline sparkline canvas.
- **K8s ResourceGauge** SVG ring.
- **ResourceGraphPanel** with period selector pills and tab underlines.

### UI components

- **Card**: shadow-based elevation and minimal borders.
- **Button**, **Badge**, **Alert** and **Spinner** follow the palette above.

### Billing

- **Integrated mode**: uses the top bar, the same as the rest of the panel.
- **Separate mode**: its own navigation bar with Sleek card and button styling.

### Light and dark mode

Dark is the default. The sun and moon toggle in the header saves the preference
to localStorage. The header component loads the Inter font dynamically.

## Override count

34 file overrides across:

- 5 UI components (button, card, badge, alert, spinner).
- 3 layout components (header, sidebar, footer).
- 11 server components (console, resource monitor, dashboard layout, sidebar
  tabs, stats panel, power controls, bottom charts, resource chart, graph panel,
  stat card, quick actions).
- 2 K8s components (gauge, bar).
- 1 billing component.
- 7 layouts (dashboard, billing, support, account, auth, servers, servers/[id]).
- 4 pages (login, forgot-password, dashboard, servers list).
- 1 CSS globals.

The theme also remaps CSS classes across the panel. This remapping covers all
remaining pages without individual overrides.

## Building your own

See the [Standard Theme](https://github.com/BadgerPanel/StandardTheme) for the
full development guide.
