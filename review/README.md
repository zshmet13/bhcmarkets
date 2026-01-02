Reaview ⚛️

Enterprise-grade component explorer for React. > Instant isolated development without the boilerplate of Storybook.

Why Reaview?

Zero Config: Auto-detects components in your Vite project.

No Stories: Uses AST analysis to auto-generate prop controls.

Lightweight: Runs on a separate Vite instance, keeping your main app performant.

Enterprise Ready: Respects your existing aliases, plugins, and TypeScript config.

Installation

npm install reaview --save-dev


Usage

Run the explorer in your project root:

npx reaview


This will start a local server at http://localhost:7777/__xray/.

How it works

Reaview mounts a virtual Vite server that:

Scans your src directory for .tsx components.

Uses react-docgen-typescript to extract prop types and descriptions.

Renders components in isolation with a live property editor.
