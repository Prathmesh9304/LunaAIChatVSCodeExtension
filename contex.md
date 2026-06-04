# Luna: AI Chat - Project Context

## Project Overview
**Luna: AI Chat** is a code analyzing and refactoring tool designed as a Visual Studio Code (VS Code) extension. It aims to assist developers directly within their IDE by providing a sidebar interface where they can interact with the AI assistant for code-related tasks.

This project was developed as a Major Project ("Code Refactoring and Analyzing Tool") by final-year students of Computer Engineering from Dr. Babasaheb Ambedkar Technological University, Lonere.

## Team & Contributors
- Jay Zore
- Om Pimple
- Prathmesh Bhoir

## Directory Structure
The workspace follows a standard structure for VS Code extensions containing a separate frontend application:

- **Root Directory**: Contains extension metadata (`package.json`), build configuration (`esbuild.js`, `tsconfig.json`), and general configuration.
- **`src/` (Extension Backend)**: The main entry point and backend logic of the VS Code extension.
  - `extension.ts`: Registers the extension and initializes the sidebar view provider.
  - `providers/SidebarProvider.ts`: Sets up the Webview for the sidebar, loads the frontend React build, and handles message passing between the frontend and VS Code.
- **`webview-ui/` (Extension Frontend)**: A complete React application that renders the UI inside the VS Code sidebar Webview.
  - `src/App.tsx`: Main React component implementing routing between "Home", "History", and "Setting" tabs.
  - `src/pages/`: Contains the individual views (Home, History, Settings).
  - Uses Vite for fast builds and Tailwind CSS for styling.
- **`media/`**: Assets like the extension icon and sidebar icon.
- **`dist/` & `out/`**: Compiled output directories for the extension.

## Technical Stack

### Extension Backend
- **Node.js & TypeScript**: Core logic of the extension.
- **VS Code API**: Used to register commands, view providers, and interact with the editor.
- **esbuild**: A fast bundler used to package the extension code.

### Extension Frontend (Webview)
- **React 19**: Used for building the sidebar user interface.
- **Vite**: The build tool for the frontend application, configured to work with the VS Code Webview requirements.
- **Tailwind CSS v4**: For utility-first styling.
- **Lucide React**: For scalable SVG icons (like Settings, History, Message Square).

## Build and Development Process

The project is structured into two interconnected parts (the extension itself and the Webview UI). The build scripts inside `package.json` automate the process:

- **`npm run install:all`**: Installs dependencies for both the root extension and the `webview-ui`.
- **`npm run build:webview`**: Navigates to `webview-ui` and builds the React application.
- **`npm run compile`**: Checks types, lints the extension source code, and builds it using `esbuild`.
- **`npm run build:all`**: Chains the frontend and backend build processes together.

To develop the Webview UI independently, the `start:webview` script runs the Vite development server.

## Key Interactions
- **Sidebar Integration**: The extension registers a `luna-sidebar-view` in the VS Code Activity Bar.
- **Message Passing**: `SidebarProvider.ts` listens for messages like `onInfo` or `onError` from the React app and triggers VS Code notifications (`vscode.window.showInformationMessage`).
- **State Management**: The React frontend uses VS Code's Webview state API (`vscode.getState()` and `vscode.setState()`) to persist the current page state even when the sidebar is closed or hidden.
