# Strinova Map Planner

Strinova Map Planner is a Bun-powered monorepo for building and previewing a browser-based strategy planner for Strinova maps. The main app lets users create local strategies, place and edit map objects on a canvas, and reopen saved plans from IndexedDB.

## Notes
- This was vibe-coded in like 4 hours. There probably are bugs, and usability issues
- This application is currently a Tier-5 application. We offer no support and if you open a PR, it will not be prioitized. 
  - Any issues opened will be moved to our linear backlog (un-prioitized)
- This app will be moved to a Tier-3 application post stringify launch.
- Feel free to make PRs.

## Workspace Layout

- `apps/web`: Next.js application for the planner UI.
- `apps/storybook`: Storybook workspace for isolated UI and canvas component development.
- `libs/core`: Shared domain types, state machines, map metadata, and local database helpers.
- `libs/ui`: Shared React UI components, planner layout pieces, and canvas renderers.

## Requirements

- Bun `1.3.8` or newer

## Getting Started

Install dependencies:

```bash
bun install
```

Start the web app in development mode:

```bash
bun run dev
```

Start Storybook:

```bash
bun run storybook
```

## Scripts

- `bun run dev`: Run the Next.js app through Turbo.
- `bun run build`: Build the web app for production.
- `bun run storybook`: Start Storybook for the shared UI library.
- `bun run build-storybook`: Build the Storybook site.
- `bun run lint`: Run lint tasks across the workspace.
- `bun run typecheck`: Run TypeScript checks across the workspace.
- `bun run test`: Run configured test tasks across the workspace.

## Notes

- Planner data is stored locally in the browser.
- The production Next.js build already includes the `konva` and optional `canvas` compatibility fix required for server builds.

## License

This project is licensed under the MIT License. See `LICENSE` for details.