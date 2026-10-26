# Notch for Windows --- Design Guide

**Purpose:** Establish a shared visual and interaction language for the
Notch for Windows desktop app.\
**Platform:** Windows desktop\
**Implementation direction:** Electron, HTML, CSS, and JavaScript\
**Status:** Foundational design specification. Proposed behavior must be
validated against the running app before being treated as implemented.

------------------------------------------------------------------------

## 1. Project Vision & Core Principles

### Vision

Create a small, expressive desktop companion that lives at the top of
the screen. It should feel calm when ignored, delightful when used, and
useful without becoming another distracting dashboard. The notch is the
product's main surface: reveal the right information at the right
moment, then let users return to their work quickly.

### Core principles

-   **Interactive:** Every visible control has a clear response. Hover,
    click, keyboard activation, loading, success, and error states are
    distinguishable. Essential actions must not be hover-only.
-   **Playful:** Use subtle motion, fluid expansion, small celebratory
    cues, and friendly microcopy. Never let playfulness delay an action
    or make productivity feel noisy.
-   **Minimal:** Show only relevant information in the collapsed state.
    Keep labels short, remove decorative clutter, and reveal secondary
    controls progressively.
-   **Strong presence, low distraction:** Make the notch recognizable
    and easy to find without covering important controls, stealing focus
    unexpectedly, or animating constantly.
-   **Predictable:** The same gesture produces the same result across
    features. Preserve preferences and use consistent placement, timing,
    and control behavior.
-   **Accessible:** Support keyboard navigation, visible focus, readable
    contrast, scalable text, and reduced-motion preferences.

**Decision rule:** When a feature competes for attention, prefer the
quieter option by default. Give users a clear way to reveal more detail
or change behavior in Settings.

------------------------------------------------------------------------

## 2. Notch Backbone & Interaction Model

### Default / minimal state

The collapsed notch is a compact pill or rounded capsule centered along
the top edge of the primary display by default.

Suggested starting dimensions; tune after testing: - Width: **150--190
px** - Height: **28--38 px** - Top offset: **0--6 px**, depending on
transparency and shadow - Horizontal internal padding: **8--12 px** -
Fully rounded capsule corners

Use a dark neutral surface, restrained highlight, and at most one small
status indicator. Always-on-top behavior should be intentional and
configurable; avoid obscuring Windows system UI or creating an unusable
click target.

### Minimal-state information

Show no more than one primary signal: - A small timer ring or
remaining-time label during a running Pomodoro - A subtle hydration
progress indicator when enabled - A small activity indicator while a
task is active - A neutral idle appearance when nothing needs attention

Do not stack several icons, counts, and labels in the collapsed state.
When multiple features are active, prioritize the running timer and show
secondary information in the expanded panel.

### Expansion and collapse

1.  **Click:** Toggle expanded/collapsed state.
2.  **Hover:** Optionally expand after a short delay (about 150--250
    ms); make this configurable and never require hover to access
    controls.
3.  **Global shortcut:** Toggle expansion from anywhere when the app is
    running and the shortcut is registered.
4.  **Escape:** Collapse the panel unless focus is inside a control that
    uses Escape for a specific action.
5.  **Outside click:** Collapse when clicking outside, except during a
    confirmation or essential interaction.

Do not expand on every incidental pointer pass. If hover is distracting,
use click and keyboard as primary triggers.

### Expanded state

The panel grows downward from the top edge, with its center aligned to
the top-center anchor.

Suggested dimensions: - Width: **320--420 px** on typical desktop
displays - Height: content-driven, usually **180--360 px** - Maximum
height: about **70% of the available work area**; scroll content
internally if needed

Recommended structure: 1. **Header:** App identity/status and a close or
collapse affordance. 2. **Primary feature:** Active Pomodoro or selected
feature. 3. **Quick actions:** Hydration logging and other frequent
actions. 4. **Secondary navigation:** Settings and feature switching.

Avoid displaying every feature as a full dashboard at once. Use compact
tabs, segmented controls, or clearly labeled feature cards.

### Animation and transitions

-   Expansion: **180--260 ms**, ease-out.
-   Collapse: **140--220 ms**, ease-in.
-   Combine opacity with a small vertical translate or scale; avoid
    large bounces.
-   Controls should respond immediately even while the panel animation
    finishes.
-   Keep the anchor stable; avoid horizontal jumps when content changes.
-   Honor reduced-motion preferences where detectable and offer a
    reduced-motion setting.
-   Never use animation as the only way to communicate state.

### Resolution and multi-monitor behavior

-   Anchor to the primary display by default; allow display selection if
    multi-monitor support is implemented.
-   Recalculate placement when resolution, scaling, orientation, or
    monitor arrangement changes.
-   Use the display work area and DPI scaling rather than assuming
    1920×1080.
-   Keep the panel within the selected display's horizontal bounds.
-   On narrow or vertically constrained displays, reduce panel width and
    scroll internally.
-   If the selected display disconnects, move the notch to the primary
    display.
-   Test at 100%, 125%, 150%, and 200% scaling, including 16:9 and
    ultrawide displays.

------------------------------------------------------------------------

## 3. Waiting Screen

Show a waiting state only when initialization, settings loading, or a
feature actually needs time. Do not show a full loading screen for work
that completes almost instantly.

### Visual design

-   Reuse the dark neutral surface and rounded geometry.
-   Show a small animated dot, ring, or restrained shimmer.
-   Use one short status line, e.g. **"Getting things ready..."**
-   Never show a fake percentage or progress bar unless progress is
    measurable.
-   Keep the state brief and quiet.

### Feedback and recovery

-   Disable controls that cannot yet work.
-   If initialization takes longer than expected, use a useful status
    such as **"Still loading your preferences..."**
-   If initialization fails, show a concise error and a Retry action;
    never leave an indefinite spinner.
-   Transition to ready without a layout jump.
-   If only one feature is loading, show a local indicator rather than
    blocking the whole notch.

------------------------------------------------------------------------

## 4. Greeting Screen --- First-time User Experience

### Goals

Explain the notch, introduce key interactions, and get the user to a
usable default state quickly. Onboarding should feel welcoming, not like
a mandatory setup wizard.

### Suggested flow

**Step 1 --- Welcome** - Headline: **"A little space for your
focus."** - Supporting text: "Keep your focus timer and small daily
reminders close, without opening another window." - Primary action:
**Get started** - Secondary action: **Not now** or **Explore first**

**Step 2 --- Show how it works** - Demonstrate collapsed and expanded
states with a short, optional animation. - Explain click-to-expand,
Escape-to-collapse, and that a shortcut can be configured. - Include a
**Try it** interaction so users can expand and collapse the notch.

**Step 3 --- Choose preferences** - Start with Pomodoro enabled or
disabled. - Enable hydration tracking or skip it. - Choose whether hover
expands the notch. - Show the proposed global shortcut and let the user
change it later. - Explain notifications before requesting permission;
ask only when reminders are enabled.

**Step 4 --- Ready** - Message: **"You're all set."** - Primary action:
**Open my notch** - Secondary action: **Customize later**

### Layout and behavior

-   Use one centered column, generous spacing, and short copy.
-   Keep one clear primary button per step.
-   Provide Back for multi-step setup.
-   Let users skip optional configuration.
-   Persist onboarding completion so it does not repeat on every launch.
-   Add **Replay welcome** in Settings.

All actions must be keyboard reachable with visible focus. Do not
auto-start a timer or enable reminders without consent. Do not rely on
color alone to explain an option.

------------------------------------------------------------------------

## 5. Water Feature --- Hydration Tracker

### Purpose

Make it effortless to record a drink and see progress toward a
customizable daily target. This is a personal tracking aid, not medical
advice.

### Expanded-view layout

-   **Header:** "Water" and today's progress.
-   **Progress:** Bar or circular indicator plus explicit text,
    e.g. **750 / 2000 ml**.
-   **Quick-add actions:** `+150 ml`, `+250 ml`, and a secondary custom
    amount action.
-   **Undo:** Briefly offer Undo after logging.
-   **Goal control:** Put goal editing in Settings or a secondary view,
    not in the main quick-action area.

### Logging feedback

1.  Update the amount and progress immediately.
2.  Animate the progress fill over about 180--300 ms.
3.  Show a short confirmation, e.g. **"+250 ml added"**.
4.  Make the confirmation accessible to screen readers.
5.  Provide Undo without requiring a separate history screen.

Use a subtle ripple or fill animation sparingly. Do not play sound by
default.

### Progress and persistence

-   Show today's total and goal.
-   Store entries with timestamps so totals can be recalculated.
-   Define day boundaries using the user's local time.
-   Preserve entries and settings across restarts.
-   If saving fails, show a retry/error state instead of silently
    discarding an entry.
-   Keep data local by default unless cloud sync is explicitly added and
    explained.

### Reminders and notifications

-   Reminders are optional and off until enabled.
-   Let users choose interval/schedule, quiet hours, and whether
    reminders use Windows notifications or the notch.
-   Avoid repeated reminders during quiet hours or when notifications
    are disabled.
-   Use friendly, non-judgmental language such as **"Time for a sip?"**
-   Provide a direct log-water action from a reminder when supported.
-   Make reminders easy to adjust or disable.

### Notch integration

-   In collapsed state, show only a small droplet/progress cue when
    enabled.
-   In expanded state, show progress and quick-add controls.
-   Do not interrupt a running Pomodoro to show hydration details.
-   If timer and hydration both need attention, prioritize the timer and
    keep hydration as a secondary action.

------------------------------------------------------------------------

## 6. Pomodoro Timer

### Display

The timer is the primary feature when a focus session is active. The
expanded view should include: - A large, high-contrast remaining-time
value such as `25:00` - A phase label: **Focus**, **Short break**, or
**Long break** - A restrained circular ring or linear progress bar -
Start/Pause and Reset controls - An optional compact count of completed
focus sessions

Use tabular numerals so digits do not shift as the timer changes.

### Controls and states

-   **Start:** Begin the current phase and change the control to Pause.
-   **Pause:** Freeze remaining time while preserving the phase.
-   **Resume:** Continue from the paused value.
-   **Reset:** Return to the configured duration. Confirm only if
    resetting would discard meaningful progress; avoid unnecessary
    dialogs.
-   **Skip phase:** Optional secondary action, visually less prominent
    than Start/Pause.

Labels, icons, tooltips, and accessible names must agree. Icon-only
controls require accessible names.

### Visual feedback by phase

-   **Focus:** Primary accent and calm, steady progress indicator.
-   **Short break:** Softer secondary accent, same layout.
-   **Long break:** Distinct but harmonious accent or label; avoid a
    dramatic UI change.
-   **Paused:** Freeze progress and show a clear paused label/icon.
-   **Completed:** Brief success cue and phase-change message; keep the
    user in control of starting the next phase.
-   **Sleep/restart recovery:** Recalculate elapsed time from a stored
    timestamp rather than relying only on a ticking interval.

Always show a text phase label; color is supplementary.

### Integration with notch and notifications

-   Collapsed state: compact time value or timer ring while running.
-   Clicking the timer opens the expanded timer view.
-   The timer continues accurately while the panel is collapsed.
-   Use a Windows notification or subtle in-app cue when a phase ends,
    according to preferences.
-   Never steal keyboard focus when a session completes.
-   Let users configure focus, short-break, long-break, and long-break
    interval durations.
-   Persist timer state sufficiently to recover after restart or system
    sleep.

### Suggested defaults

-   Focus: **25 minutes**
-   Short break: **5 minutes**
-   Long break: **15 minutes**
-   Long break after **4** completed focus sessions

Treat these as defaults, not hard-coded limits. Validate that durations
are positive and within reasonable bounds.

------------------------------------------------------------------------

## 7. Other Features --- Global Shortcuts and Settings

### Global keyboard shortcuts

-   Provide a default only if it does not conflict with common Windows
    or application shortcuts.
-   Let users view, change, disable, and re-register shortcuts.
-   Show feedback when a shortcut activates an action, such as a short
    expansion or small toast.
-   If a shortcut is taken or cannot be registered, explain why and
    suggest another combination.
-   Never capture or log general keyboard input; register only
    configured shortcuts.
-   Shortcuts work only while the app is running and follow explicit
    user configuration.

Suggested actions: - Toggle notch. - Start/pause Pomodoro. - Log a
configured quick-add water amount (optional).

### Settings information architecture

1.  **Appearance:** Theme, accent, transparency, animation intensity,
    compact/expanded behavior.
2.  **Behavior:** Hover expansion, outside-click collapse, launch at
    startup, display selection.
3.  **Pomodoro:** Phase durations, auto-start options, completion
    notifications.
4.  **Hydration:** Daily goal, quick-add amounts, reminder schedule,
    quiet hours.
5.  **Shortcuts:** Registered shortcuts and conflict status.
6.  **Notifications:** Enable/disable, presentation style, quiet hours.
7.  **About:** App version, help, privacy information, and reset/replay
    onboarding.

### Settings UX rules

-   Use clear labels and one-line explanations for non-obvious options.
-   Save simple changes automatically and show a saved state.
-   Use Save/Cancel only when validation or disruptive changes justify
    it.
-   Separate destructive actions (clear history, reset all settings) and
    confirm them.
-   Provide **Restore defaults**.
-   Preserve settings after updates and restarts.
-   Avoid overbuilding Settings before core notch interactions are
    stable.

------------------------------------------------------------------------

## 8. Design System & Consistency Guidelines

### Color palette

Use semantic tokens rather than scattering literal values throughout
stylesheets. Suggested starting palette:

  Token                Suggested value   Usage
  -------------------- ----------------- ---------------------------------
  `surface`            `#15171C`         Main notch and panel background
  `surface-elevated`   `#20232B`         Cards, menus, elevated controls
  `text-primary`       `#F5F7FA`         Main text
  `text-secondary`     `#A6ADBB`         Supporting text
  `accent`             `#7C8CFF`         Primary action and focus state
  `accent-soft`        `#343C68`         Soft accent background
  `success`            `#5BC99A`         Completion/success feedback
  `warning`            `#F2C66D`         Caution or reminder
  `danger`             `#F07878`         Destructive action/error
  `border-subtle`      `#343842`         Low-emphasis outlines

These are proposed defaults. Validate contrast in the real UI. Add a
light theme only if it can be implemented consistently, and avoid using
the accent color for every element.

### Typography

-   Prefer a clean system stack, using Segoe UI on Windows when
    available.
-   Suggested sizes: 12 px secondary metadata; 13--14 px labels/body;
    16--18 px card headings; 28--36 px main timer.
-   Use semibold for important values and headings; reserve bold for
    primary emphasis.
-   Keep line lengths short and avoid dense paragraphs in the notch.
-   Use tabular numerals for timers and numeric progress.

### Iconography

-   Use one consistent icon family and stroke weight.
-   Prefer simple outline icons; use filled variants for selected/active
    states.
-   Suggested sizes: 14--16 px compact controls; 18--20 px primary
    actions.
-   Pair unfamiliar icons with labels or tooltips.
-   Do not mix emoji, filled icons, and multiple icon families as core
    symbols.

### Spacing, shape, and elevation

Use a 4 px base spacing system: - **4 px:** tight icon/text gaps - **8
px:** compact control padding - **12 px:** card/control spacing - **16
px:** standard panel padding - **20--24 px:** major section separation

Use consistent corner radii: - Small controls: **8--10 px** - Cards:
**12--16 px** - Main notch/panel: **18--24 px** or a full capsule when
collapsed

Use subtle borders and shadows to separate the panel from varied desktop
backgrounds. Avoid heavy glow, excessive blur, and multiple stacked
shadows.

### Interaction and component rules

-   Define reusable components for buttons, icon buttons, progress
    indicators, toggles, toasts, feature cards, and section headings.
-   Keep primary, secondary, and destructive actions visually distinct.
-   Reuse the same hover, pressed, disabled, focused, and loading
    states.
-   Provide visible keyboard focus.
-   Aim for click targets of at least **32×32 px** for compact controls
    where space permits; larger is preferable for primary actions.
-   Never make hover the only way to reveal labels, controls, or status.
-   Use concise, action-oriented copy: "Start focus", "Pause", "Add 250
    ml", "Undo", "Restore defaults".
-   Prefer non-blocking toast feedback for routine success messages.
-   Use modal confirmation only for destructive or consequential
    actions.
-   Respect system theme and reduced-motion preferences where practical.

### Accessibility and quality checks

Before shipping a feature, verify: - Text and controls have sufficient
contrast. - Keyboard users can reach and operate every control. - Focus
remains visible and follows a logical order. - Screen readers receive
meaningful labels and state changes. - Color is not the only status
indicator. - Animations are brief and can be reduced. - Layout works at
multiple Windows display scales. - The notch does not unexpectedly steal
focus or block important content. - Error states explain what happened
and how to recover.

### Engineering consistency

-   Keep design tokens in a central stylesheet or CSS variables section.
-   Reuse components rather than duplicating slightly different
    controls.
-   Separate UI state from timer/hydration logic.
-   Persist preferences through a clearly defined settings layer.
-   Keep Electron security settings enabled (`contextIsolation: true`,
    `nodeIntegration: false`) and expose only necessary APIs through the
    preload bridge.
-   Treat notifications, global shortcuts, startup behavior, and
    always-on-top behavior as explicit preferences.
-   Document intentional deviations from this guide in project notes or
    pull requests.

------------------------------------------------------------------------

## Definition of Done

A feature is design-ready when: 1. Its collapsed and expanded states are
defined. 2. Loading, success, empty, disabled, and error states are
considered where relevant. 3. Mouse and keyboard interactions are
specified. 4. Motion timing and reduced-motion behavior are defined. 5.
Layout is checked at multiple display scales. 6. Persistence and
relevant preferences are specified. 7. Accessibility and non-disruptive
behavior are reviewed. 8. The implementation is tested on a real Windows
desktop.

This is a living guide. Update it when product behavior changes, and
prefer a deliberate, documented design decision over one-off styling
exceptions.
