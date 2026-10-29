# P0 production hotfix — desktop layout and communications

Release date: October 29, 2026

## Root causes

1. The city-first shell and older phase-specific layouts both controlled the same grid. The later cascade lock kept decision phases in two columns, but it also forced Round Results back into the narrow action column.
2. Boss Communications was a fixed overlay whose children still inherited `display: contents` and the obsolete negotiation two-column grid. The outer panel could grow while Private and Deals remained constrained to a narrow implicit column.
3. Blind Draft stretched every card to a fixed-height rail. The selected-card summary and Lock In footer then flowed below the useful viewport area inside the action pane.
4. The Round Replay overlay was rendered inside an action-dock stacking context, allowing the sticky game header to intercept its Close action.
5. Incoming social notifications were below the expanded desktop communications drawer, making Review unreachable when the drawer was open.

## Repairs

- Standardized decision phases on one stable city/action column contract.
- Made cinematic reveal and Round Results span the complete command workspace.
- Gave Boss Communications a predictable desktop drawer and real full-width content containers.
- Preserved the full-height mobile communications sheet.
- Bounded card height, retained horizontal card scrolling, and made Lock In persistent.
- Made the Operations deployment action persistent inside the scrolling pane.
- Allowed Results to use three readable columns on large desktops and two scrollable columns at compact desktop widths.
- Corrected overlay stacking so notifications and replay controls remain actionable.

## Browser evidence

Playwright captures after the repair:

- `test-results/social-private-desktop.png`
- `test-results/negotiation-deals-desktop.png`
- `test-results/phase-draft-desktop.png`
- `test-results/phase-operations-desktop.png`
- `test-results/phase-results-desktop.png`
- Corresponding `*-mobile.png` captures at 390×844.

The dedicated viewport regression also captures Private, Deals, and Draft at 1440×900 and 360×800 while running. The user-supplied production screenshots are the before evidence.

## Automated coverage

- Actual browser interaction at 1440×900, 1280×800, 1024×768, 768×1024, 390×844, and 360×800.
- Private and Deals tab switching without outer-panel resizing.
- Composer containment and full-width workspace assertions.
- Actual card selection followed by clicking Lock In at every viewport.
- Horizontal overflow checks.
- Complete two-client, five-round match through Operations, Results, Finale, reconnect, and rematch.

## Scope preserved

No card effects, missions, scoring, district rules, multiplayer synchronization, phase timing, private projections, or audio behavior changed.
