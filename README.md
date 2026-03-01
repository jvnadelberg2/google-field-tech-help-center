# google-field-tech-help-center
# Field Technician Help Center (Interview Demo)

🔗 **Live Demo:**  
https://jvnadelberg2.github.io/google-field-tech-help-center/

📂 **GitHub Repository:**  
https://github.com/jvnadelberg2/google-field-tech-help-center/

---

## Overview

The Field Technician Help Center is a lightweight, client-side decision-support tool designed for on-site field technicians working in distributed environments such as retail networks or branch offices.

The application guides technicians through structured troubleshooting workflows and ensures that escalation tickets contain standardized, complete diagnostic information.

### Core Goals

- Standardize troubleshooting steps
- Reduce incomplete escalations
- Capture structured diagnostic metadata
- Improve consistency across field operations
- Demonstrate clean, modular frontend architecture

This project is intentionally framework-free and designed as an interview demo to highlight architecture, product thinking, and workflow modeling.

---

## Problem Statement

In distributed IT environments, field technicians frequently escalate tickets with inconsistent or incomplete diagnostic data.

This leads to:

- Repeated back-and-forth communication
- Delayed resolution times
- Escalation fatigue
- Inconsistent troubleshooting quality

This tool enforces a structured escalation workflow:

1. Select a category
2. Choose a troubleshooting article
3. Follow a guided decision tree
4. Capture required ticket metadata (MAC, IP, switch port, etc.)
5. Produce structured diagnostic output

The result is a standardized escalation process with reduced ambiguity.

---

## Project Structure

```
index.html
assets/
  ├── app.js
  └── styles.css
data/
  └── kb.json
```

---

## File-by-File Explanation

### 1. index.html

**Purpose:**  
Defines the structure and layout of the application.

**Responsibilities:**

- Top navigation bar (branding + search)
- 3-column grid layout:
  - Sidebar (categories)
  - Article list
  - Article / Stepper panel
- Ticket metadata input fields
- Loads the primary JavaScript controller (`assets/app.js`)

This file contains no application logic — only layout and structure.

---

### 2. assets/app.js

**Purpose:**  
Implements all client-side application logic and state management.

**Major Responsibilities:**

#### Data Initialization
- Fetches structured content from `data/kb.json`
- Initializes category list
- Initializes article list

#### Rendering Logic
- Dynamically renders categories
- Filters and displays articles
- Displays selected article content
- Updates UI without page reload

#### Stepper Engine
- Executes decision-tree logic for interactive articles
- Moves between steps based on user input
- Tracks diagnostic path progression

#### Ticket Metadata Handling
- Collects:
  - Site ID
  - Asset/Device
  - Switch Port
  - MAC Address
  - IP Address
- Displays ticket fields only for articles of type `"stepper"`

#### Conditional Rendering
- Ticket fields appear only when:
  
  `article.type === "stepper"`

This ensures metadata collection is required only for escalation workflows.

---

### 3. assets/styles.css

**Purpose:**  
Defines layout and visual styling.

**Responsibilities:**

- CSS grid 3-column layout
- Sidebar styling
- Article card styling
- Stepper button design
- Result card formatting
- Ticket field layout
- Responsive behavior for smaller screens

Design philosophy:

- Minimal
- Functional
- Professional
- Interview-ready

---

### 4. data/kb.json

**Purpose:**  
Provides structured content for the application.

Contains:

- Categories
- Static informational articles
- Interactive decision-tree articles

### Article Types

#### Static Article
Displays informational content only.

#### Stepper Article
Contains:

```
"type": "stepper"
```

And a `flow` object defining:

- Starting node
- Question nodes
- Yes/No transitions
- Result nodes

This architecture allows adding new troubleshooting workflows without modifying application logic.

---

## Architectural Decisions

### 1. Separation of Concerns

- HTML = Structure
- CSS = Presentation
- JavaScript = Behavior
- JSON = Content

This enables scalable expansion and easy content updates without refactoring core logic.

---

### 2. Content-Driven Decision Trees

Decision logic is stored in JSON rather than hardcoded in JavaScript.

Benefits:

- Easy to add new workflows
- Clear separation between engine and content
- Maintains clean, reusable stepper logic

---

### 3. Client-Side State Management (No Frameworks)

The app uses vanilla JavaScript to:

- Track active category
- Render filtered articles
- Manage step progression
- Dynamically update DOM state

This demonstrates strong fundamentals without reliance on frameworks.

---

## Demo Walkthrough Script

When presenting:

1. Open Networking category
2. Select “Basic network triage”
3. Enter ticket metadata (e.g., Site, MAC, IP)
4. Walk through the guided troubleshooting questions
5. Show how structured results are produced

Explain:

> “This tool enforces structured escalation and reduces incomplete tickets by standardizing diagnostic workflows.”

---

## Potential Enhancements

- Copy-to-clipboard escalation summary
- LocalStorage persistence of ticket fields
- Highlight active category state
- Export to ticketing system API
- Role-based article access
- Usage analytics
- Dark mode toggle
- Multi-step escalation templates

---

## Technical Stack

- HTML5
- CSS3 (Grid Layout)
- Vanilla JavaScript (ES6)
- JSON-based content model

No build tools required.  
Runs entirely client-side.

---

## Why This Makes a Strong Interview Demo

This project demonstrates:

- Clean UI architecture
- Modular content modeling
- Decision-tree workflow design
- Structured escalation logic
- Practical real-world problem solving
- Strong JavaScript fundamentals
- Product-oriented thinking

It reflects not just technical ability, but workflow optimization and system design awareness.

---

## Author Intent

This project was designed as an interview demonstration to showcase:

- Product thinking
- UX clarity
- Architecture discipline
- Practical workflow modeling
- Structured decision support systems
- Real-world operational impact