# Genesis-AI

## Introduction
Genesis-AI is an experimental, web-based artificial intelligence platform created by XPDevs.
It represents a new approach to lightweight AI design — replacing traditional machine learning models with a custom binary format and human-readable JSON files that define the AI's core behavior.

While its foundation is a lightweight, rule-based system, it also integrates dynamic features like on-demand image generation, text/image analysis, and real-time Wikipedia lookups, all running locally in your browser.

Unlike other systems that require users to install software, manage APIs, or process data on remote servers, Genesis-AI runs entirely within the web browser. Users simply visit the website and begin interacting instantly, with no downloads, no setup, and no external dependencies.

This project exists to explore how far simplicity can go — proving that AI-like systems can be built using structured logic, static content, and an accessible web interface.

## Project Goals
The purpose of Genesis-AI is to:
- Demonstrate that AI behavior can be simulated using transparent, open JSON structures.
- Provide a fast and secure user experience by eliminating the need for cloud-based computation for core chat.
- Encourage experimentation and learning by keeping all logic readable and modifiable.
- Promote digital safety and privacy by ensuring all processing occurs locally in the browser.
- Inspire future developers to build simple, efficient tools that remain understandable to everyone.

## Experimental Notice
Genesis-AI is **experimental**.  
Because it uses a structured response system rather than a large language model for its core chat, it may not always:
- Understand complex or ambiguous sentences.  
- Generate contextually consistent replies.  
- Maintain deep conversational memory.  

It is designed primarily for demonstration, testing, and creative experimentation — not production-level use.  
Users are encouraged to explore its logic, test boundaries, and contribute ideas for improvement.

## How It Works
Genesis-AI functions entirely on client-side code, meaning:
- When a user visits the website, the browser loads the HTML, CSS, and JavaScript files.  
- The AI "model" (called a **modal**) is primarily a custom, compressed binary file (`.bin`) for maximum performance. This binary is decoded in the browser.
- The system also supports human-readable JSON files, which are ideal for creating and testing custom modals.
- The modal contains predefined data, including:
  - Keywords, questions, and responses.
  - Contextual triggers.
  - Personality or tone parameters.

The JavaScript engine decodes the modal, performs advanced pattern matching against user input, and can combine multiple relevant responses. It also recognizes special commands (prefixed with `@`) to trigger advanced modules like image generation or analysis. For general knowledge questions, it can query Wikipedia and summarize the results, providing a much broader knowledge base than the static modal alone.
This method removes the need for neural processing for core chat while keeping every behavior transparent to the public.

## Features
Genesis-AI includes a comprehensive set of features for chatting, productivity, and creativity:

### Core AI Features
- **Binary & JSON Modals** — AI behavior is defined in a high-performance binary format (`.bin`) or editable JSON files for easy customization
- **Pattern Matching Engine** — Advanced keyword and phrase matching to find appropriate responses
- **Multi-Response Combination** — Can combine multiple relevant responses for richer answers
- **Fallback Handler** — Provides helpful error messages when no match is found
- **Custom Modal Loading** — Load your own JSON or binary modals via URL or file upload

### AI Commands
- **@ImgAuth** — Analyze uploaded images to detect AI-generated content signatures
- **@txtauth** — Analyze text for patterns common in AI-generated content

### Knowledge & Search
- **Wikipedia Integration** — Automatically fetches and summarizes Wikipedia articles for general knowledge questions, reducing content to 60% of original length with intelligent summarization and a short concluding sentence based on content length
- **User Summary Requests** — Ask the AI to summarize any topic and get concise, Wikipedia-sourced answers
- **Web Search Toggle** — Enable real-time web search functionality for up-to-date information

### Chat Management
- **Create New Chats** — Start fresh conversations anytime
- **Rename Chats** — Give your conversations meaningful names
- **Delete Chats** — Remove unwanted conversations
- **Pin Chats** — Pin important conversations to the top of your chat list
- **Shareable Conversations** — Generate unique, shareable links for your chat sessions

### Input & Output
- **Text Input** — Send messages via the chat box
- **Image Uploads** — Upload images directly into the chat for analysis
- **Voice Input** — Use speech recognition to dictate your messages
- **Text-to-Speech** — Listen to the AI's responses with a single click
- **Stop Generation** — Instantly interrupt the AI's response generation

### Math & Calculation
- **Built-in Calculator** — Solve mathematical expressions directly in the chat
- **Math Rendering** — KaTeX support for beautiful mathematical formula display (including LaTeX syntax)

### Themes & Appearance
- **Light Mode** — Clean, bright theme for daytime use
- **Dark Mode** — Easy-on-the-eyes dark theme for nighttime
- **Auto-Theming** — Automatically switches between light and dark based on the time of day
- **Responsive Layout** — Adapts seamlessly to desktop and mobile screens
- **Unified Loading Spinner** — Consistent animated spinner across all features (Wikipedia search, image generation, image analysis, text analysis)
- **Shortened Answers** — Optional setting that reduces Wikipedia responses to 60% of their original length with a short concluding sentence

### Privacy & Security
- **Privacy by Design** — No user messages are stored, logged, or transmitted to external servers
- **Tiered Safety System** — Detects unsafe messages and applies a graduated ban system for repeat violations
- **Content Warning Modal** — Displays a modal warning when unsafe content is detected, with auto-stop generation and adaptive behavior for first-time vs subsequent messages
- **Local Processing** — All AI processing happens locally in your browser

### User Account
- **Google Sign-In** — Optional authentication to save your chats across sessions
- **IndexedDB Storage** — Persistent local storage for chats and settings using IndexedDB

### Performance
- **Lightweight Performance** — Loads in seconds and responds instantly
- **Cross-Platform** — Works on all modern desktop and mobile browsers
- **Robust Error Handling** — Provides clear, helpful messages for load issues and safety violations

## Special Commands
Genesis-AI supports special commands prefixed with `@` to unlock advanced functionality.

| Command | Example | Description |
|---|---|---|
| `@ImgAuth` | `@ImgAuth` (with an image uploaded) | Analyzes the uploaded image to determine if it was generated by AI. |
| `@txtauth` | `@txtauth This text seems very formal...` | Analyzes the provided text for patterns common in AI-generated content. |

To use these, simply type the command into the chat box. For `@ImgAuth`, you must first upload an image using the attachment button.

## Appearance and Interface
Genesis-AI provides a clean, minimal interface built for focus and accessibility.  
The chat layout adapts dynamically, offering:
- **Theme Toggle:** A visible switch between *Light Mode* and *Dark Mode* for user comfort.  
- **Auto-Theming:** An option to automatically sync the theme with the time of day.
- **Text Emphasis:** Responses are displayed in clearly readable text, maintaining accessibility standards.  
- **Adaptive Layout:** Automatically adjusts spacing and scaling for clarity on desktop screens.  
- **Message Actions:** Easily copy or listen to AI responses using integrated buttons.
- **Chat List Sidebar:** Manage multiple conversations from a convenient sidebar
- **Dropdowns & Modals:** Intuitive UI elements for sharing, settings, and confirmations

This design approach reflects XPDevs' principle of simplicity — removing unnecessary clutter and keeping interactions smooth, readable, and human.

## Using Genesis-AI
There is no setup required.  
To access Genesis-AI, simply open the official website:

**[https://xpdevs.github.io/Genesis-AI](https://xpdevs.github.io/Genesis-AI)**

Once the page loads:
1. You'll see the main Genesis-AI interface.  
2. Type your message or question into the chat box.  
3. Genesis-AI will respond using its logic.

If a response cannot be generated, an appropriate error message will appear (see below).  
Because everything is handled in-browser, you can close or refresh the page at any time without data loss or security risk.

## Architecture Overview
Genesis-AI is structured around a three-layer design:

| Layer | Description |
|-------|--------------|
| **Frontend (UI)** | HTML/CSS layout built for responsiveness and simplicity. |
| **Logic Engine** | JavaScript handler that decodes modals, manages state, and selects appropriate responses. |
| **Model (Modal)** | Compressed binary (`.bin`) or JSON files that define the AI's knowledge base and responses. |

This structure separates presentation, logic, and data, allowing developers to update each component independently without breaking the overall system.

## AI Model (Modal) Structure
While the primary distribution format is a compressed binary (`.bin`) for performance, the source of this binary is a human-readable JSON file. This allows developers to easily define and extend the AI's behavior.
A simplified example might look like:

```json
{
  "ver": "Genesis-SPT-1.0",
  "hello": "Hello there! How can I help you today?",
  "who are you": "I'm Genesis-AI, an experimental web-based intelligence by XPDevs."
}
```

When a user sends input, the system checks for matching keys or patterns in the JSON and returns the corresponding value.  
If none are found, the fallback handler displays a general error message.

This makes Genesis-AI easily expandable — developers can create new modals (such as *Genesis-SPT-2.0* or *Genesis-SPT-4.6*) by editing or extending these files.

## Error Messages
Genesis-AI includes built-in feedback for specific conditions.  
These messages help users understand what has gone wrong and how to fix it.

### 1. AI Safety Violation
**Message:**
> "This message violates AI safety and use policies. Please try again."

**Meaning:**  
Triggered when the user's input contains a banned or unsafe term.  
Genesis-AI automatically stops generation and displays a content warning modal. On first message, only the modal is shown. On subsequent messages, the modal is displayed and normal chat continues after dismissal.

**Behavior:**
- Generation is automatically stopped when the modal appears
- First message: Modal-only display (no chat message added)
- Subsequent messages: Modal display + error message in chat
- Repeat violations (5+) trigger a graduated ban system

**Suggested Action:**  
Avoid sending restricted or unsafe content. Click OK on the warning modal to dismiss and continue chatting.

### 2. Processing Failure
**Message:**
> "I'm not quite sure I follow. Could you give me a bit more detail?"

**Meaning:**  
A general fallback message shown when Genesis-AI cannot find a valid response or understand the input. This is the most common error message during normal use.

**Suggested Action:**  
Try rephrasing the question or simplifying your message.

### Error Summary Table

| Error Message | Meaning | Suggested Action |
|----------------|----------|------------------|
| This message violates AI safety and use policies. | Unsafe or banned input detected. Modal shown with auto-stop. | Remove restricted words and retry. |
| Image generation took too long and timed out. | Image generation exceeded 5-minute timeout. | Try again with a simpler prompt. |
| Failed to generate image. Please try again. | Image generation service returned no result. | Retry or adjust your prompt. |
| I'm not quite sure I follow. Could you give me a bit more detail? | The AI couldn't generate a response. | Rephrase or simplify your message. |

## Data and Privacy
Genesis-AI prioritizes privacy:
- No chat logs or user data are stored or shared (except for optional signed-in users).  
- Every interaction occurs locally within your browser session.  
- No external databases, trackers, or analytics are used.  

This ensures a completely private and ephemeral experience.

## Security and Safety
XPDevs implements multiple layers of content safety:
- Restricted word detection to block unsafe input.  
- Automatic message deletion for policy violations.  
- No external scripts that can access chat data.  
- Tiered ban system that escalates for repeated violations.

These precautions help maintain a responsible, safe, and transparent AI environment.

## Design Philosophy
Genesis-AI follows three principles that define XPDevs software design:
1. **Clarity:** Everything visible should be understandable at a glance.  
2. **Control:** Users should remain in full control of their data and interactions.  
3. **Simplicity:** Every component exists only if it improves the experience.  

These ideas shape both the interface and the technology behind Genesis-AI.

## Terms and Policies
By using Genesis-AI, you agree to the following official documents:
- **[Terms of Service](https://xpdevs.github.io/legal/terms-of-service)**  
- **[Privacy Policy](https://xpdevs.github.io/Genesis-AI/legal/privacy-policy)**

These policies explain how Genesis-AI operates, including acceptable use, safety rules, and privacy standards.

## Contact
For information, suggestions, or inquiries:  
Visit the [XPDevs official website](https://xpdevs.github.io/) for updates, contact options, and related projects.