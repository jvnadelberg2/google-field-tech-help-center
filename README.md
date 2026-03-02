# Field Technician Help Center

🔗 Live Demo: https://YOUR_GITHUB_USERNAME.github.io/google-field-tech-help-center/

---

## Project Summary

The Field Technician Help Center is a static single-page application designed to provide searchable knowledge base content and interactive troubleshooting workflows for field engineers.

It is built using:

- HTML (layout)
- CSS (styling + responsive grid)
- Vanilla JavaScript (state + logic)
- JSON (content source)

There is no backend. The application runs entirely in the browser and can be deployed via GitHub Pages.

---

## Architecture Overview

The app follows a simple client-side architecture:

1. `index.html` loads the layout.
2. `assets/app.js` fetches `data/kb.json`.
3. The UI renders categories, articles, and interactive flows dynamically.
4. All state is managed in memory, with ticket fields persisted via localStorage.

---

## File Breakdown (Interview Explanation)

### index.html

Defines the 3-column layout:

- Sidebar (categories)
- Article list
- Article detail panel

Contains the search input and ticket metadata fields.

This file contains no logic — only structure.

---

### assets/styles.css

Handles:

- Grid layout
- Responsive behavior
- Sidebar styling
- Stepper buttons
- Result cards
- Ticket input styling

Pure CSS. No framework.

---

### data/kb.json

Acts as the content engine.

Contains:

- Categories
- Articles

Articles can be:

- Static content
- Interactive stepper flows (decision-tree based)

Stepper flows are fully data-driven, meaning new troubleshooting guides can be added without modifying JavaScript.

---

### assets/app.js

Core application logic.

Responsibilities:

- Fetching and parsing JSON content
- Search normalization and filtering
- Dynamic category counts
- Rendering article lists
- Rendering article content
- Stepper decision engine
- Escalation note generation
- Copy-to-clipboard functionality
- LocalStorage persistence for ticket fields

The file manages UI state and rendering without external libraries.

---

## Key Technical Concepts Demonstrated

- State management without frameworks
- Data-driven UI rendering
- Decision-tree workflow engine
- Dynamic search filtering
- LocalStorage persistence
- Static deploy architecture

---

## Deployment

Static deployment via GitHub Pages. No build tools required.

---

## Interview Positioning

This project demonstrates:

- Clean separation of content and logic
- Dynamic UI built with native browser APIs
- Scalable knowledge-base structure
- Practical UX design for technical workflows
- Production-ready static deployment model