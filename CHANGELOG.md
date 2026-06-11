# Change Log

All notable changes to the "luna" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.1] - 2026-06-11

### Updated README.md

## [1.0.0] - 2026-06-05

### Added

- **Modular Provider Configuration (`luna-config.json`)**:
  - Implemented flat array storage for configurations allowing distinct API keys per model.
  - Automatic migration handler for converting deprecated config schemas to the new array structure.
  - Revamped Settings page with password Eye/EyeOff toggles, direct inline edits, autosave, and card-based deletes.
- **AI Chat Integrations**:
  - Modular backend API completions router using native `fetch` to connect to OpenAI, Google Gemini, Anthropic, Mistral, Ollama, and Groq endpoints.
  - Intent-based active document context injection that automatically appends active editor selections or full files to the prompt when queries reference code.
- **Local History Database (`luna-history.json`)**:
  - Local persistence of chat session messages, titles (auto-generated from first message), and timestamps.
  - Built a History page to view, load, and delete past conversations.
  - Model selection is decoupled from sessions, allowing users to switch models mid-chat without breaking the history.
- **VeriCode Custom Report & Code Rendering**:
  - Guided system prompts to structure AI responses as concise answers for chat, and detailed VeriCode Analysis Reports (featuring quality ratings, smells, and refactoring) for code.
  - Custom React code blocks rendering with monospaced format, syntax label, and fully reactive "Copy Code" clipboard button.
- **UI Responsiveness & Theme Adaptiveness**:
  - Refactored page layouts to be responsive under heavy vertical/horizontal sidebar resizes.
  - Re-themed monochrome provider icons and the central Luna logo (`luna.svg`) using CSS masks (`mask-image`) so they inherit active VS Code themes (Light, Dark, High Contrast) and colors instantly.
  - Header actions refactored to include a "New Chat" (Plus icon) button and general "Chat" tab navigation.

## [0.0.1] - 2026-06-04

- Initial release
