# Luna: AI Chat - Project Context

## Project Purpose
Luna: AI Chat is a Visual Studio Code extension built to provide developers with an in-editor AI assistant for code analysis, refactoring, and conversational guidance. It exposes a custom sidebar Webview UI where users can chat with an AI model, configure providers, view session history, and send code-aware prompts based on the active editor content.

## What the Project Does
- Registers a custom sidebar view in VS Code titled **Luna Chat**.
- Hosts a React-based Webview frontend inside the sidebar.
- Reads and writes user configuration from `luna-config.json`.
- Reads and writes conversation history to `luna-history.json`.
- Sends chat messages to selected AI providers and models.
- Optionally includes active editor code context in prompts.
- Supports session history management and settings editing.

## High-Level Architecture
The project is split into two major parts:

1. **Extension Backend (`src/`)**
   - `extension.ts`: Entry point that registers the `luna.sidebar` Webview provider.
   - `providers/SidebarProvider.ts`: Core backend logic for the sidebar Webview:
     - Builds and serves the Webview HTML.
     - Handles messages from the frontend (`getConfig`, `getHistory`, `sendMessage`, `saveSession`, `deleteSession`, `saveConfig`, `editConfig`, etc.).
     - Watches workspace files `luna-config.json` and `luna-history.json` for live updates.
     - Reads configuration and history, writes updates, and calls AI provider APIs.
     - Injects current editor file content or selected code into prompts when appropriate.
   - `utilities/`: Helper utilities for building URIs and generating nonces.

2. **Webview Frontend (`webview-ui/`)**
   - React + Vite application rendered inside the VS Code sidebar.
   - Main UI flows in `src/App.tsx` with tabs for:
     - `Home`: chat interface and active session interaction.
     - `History`: saved conversation sessions.
     - `Setting`: provider and model configuration.
   - Uses VS Code Webview messaging utilities in `src/utilities/vscode.ts`.
   - Styling and layout are handled via Tailwind CSS.

## Key Files and Roles
- `package.json`: Extension metadata, VS Code contributions, and build scripts.
- `esbuild.js`: Bundles the extension backend code.
- `tsconfig.json`: TypeScript configuration for the extension.
- `README.md`: Project overview and documentation.
- `src/extension.ts`: Extension activation logic.
- `src/providers/SidebarProvider.ts`: Webview provider and backend communication.
- `webview-ui/package.json`: Frontend dependencies and scripts.
- `webview-ui/src/App.tsx`: Main UI component.
- `luna-config.json`: Example AI provider configuration.
- `luna-history.json`: Example saved chat history.

## Important Behavior
- The extension watches for changes to `luna-config.json` and `luna-history.json` and updates the sidebar view automatically.
- When the frontend requests `sendMessage`, the backend validates provider config and calls the configured API endpoint.
- The backend can automatically attach file contents or selected code to the user's prompt, giving the AI context from the open editor.
- Sessions are saved, sorted by timestamp, and can be loaded or deleted from the history view.

## Development and Build Workflow
- `npm run install:all`: Installs root and frontend dependencies.
- `npm run build:webview`: Builds the React Webview UI.
- `npm run compile`: Type-checks, lints, and bundles the extension.
- `npm run build:all`: Builds both the Webview UI and the extension backend.
- `npm run watch`: Runs type checking, bundling, and frontend build in watch mode.

## Project Structure
- `.github/`, `.gitignore`, `.vscode/`
- `CHANGELOG.md`
- `README.md`
- `contex.md` (existing project summary file)
- `context.md` (this file)
- `dist/`
- `media/`
- `src/`
  - `extension.ts`
  - `providers/SidebarProvider.ts`
  - `utilities/getNonce.ts`
  - `utilities/getUri.ts`
- `webview-ui/`
  - `src/App.tsx`
  - `src/pages/Home.tsx`
  - `src/pages/History.tsx`
  - `src/pages/Setting.tsx`
  - `src/utilities/vscode.ts`
  - `package.json`
  - `tsconfig.*`
- `luna-config.json`
- `luna-history.json`

## What This Project Is All About
The main goal is to deliver a lightweight in-editor AI chat experience for code-related tasks. It is a VS Code extension that combines a Webview-based React UI with backend logic to manage AI provider settings, persistent chat history, and editor-aware prompt context. This makes it easier for developers to ask questions, request refactors, and inspect code directly within VS Code.
