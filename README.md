# Genesis-AI

## What's This All About?

Genesis-AI is an experimental web-based AI platform from XPDevs. It's a different take on lightweight AI that uses a custom binary format and plain JSON files to define how the AI behaves, instead of relying on big machine learning models.

The core chat is rule-based, but it also does on-demand image generation, text and image analysis, and real-time Wikipedia lookups, all in your browser. No server calls for the main chat, no setup, and nothing to install because you just open a website and start typing.

It's about seeing how far you can get with simple, transparent, client-side logic using structured data and JavaScript with no neural networks or black boxes in sight.

## Why Does This Exist?

- To show you can simulate AI behavior with open, readable JSON files
- To keep things fast and private by skipping cloud backends for core chat
- To make it easy for anyone to open the hood and understand how it works
- To prove that simple tools can still be powerful and fun to experiment with

## Keep in mind

This is **experimental** and it is not an LLM because it is a structured response system, so it won't always:
- Get tricky or vague sentences
- Keep context consistent across a long conversation
- Remember much of what you said before

Think of it as a prototype, a toy, a sandbox that is great for learning, testing, and messing around, but just don't bet your business on it.

## How Does It Work?

Everything runs on the client side:
- You load the page, your browser grabs the HTML, CSS, and JS
- The AI's brain (we call it a **modal**) is a compressed `.bin` file for speed, decoded right in the browser. Or you can use JSON files if you want something human-readable for tinkering
- That modal holds keywords, questions, answers, context triggers, and personality settings

The JavaScript engine decodes the modal, matches patterns in what you type, and can even combine multiple responses. Special commands starting with `@` unlock extras like image generation or analysis. For general knowledge, it can pull from Wikipedia and summarize the results.

There is no neural processing or cloud dependency, and everything is right there in the open.

## What Can It Do?

### Core AI
- **Binary & JSON Modals:** Speed of binary with readability of JSON, your choice
- **Pattern Matching:** Finds the best response for whatever you type
- **Multi-Response Combination:** Smashes relevant responses together for richer answers
- **Fallback Handler:** Friendly "I don't know" when nothing matches
- **Custom Modal Loading:** Load your own modals via URL or file upload

### Commands
- **@ImgAuth:** Check if an uploaded image looks AI-generated
- **@txtauth:** Analyze text for AI-written patterns

### Knowledge & Search
- **Wikipedia Lookups:** Fetches and summarizes articles automatically, cuts them to 60% length with a short concluding sentence
- **Summary Requests:** Ask it to summarize anything and get a Wikipedia-sourced answer
- **Web Search Toggle:** Turn on real-time web search for up-to-date info

### Chat Management
- Create, rename, delete, and pin conversations
- Share chats via unique links

### Input & Output
- Text input, image uploads, text-to-speech, stop generation button

### Math
- Built-in calculator and KaTeX rendering for LaTeX formulas

### Themes
- Light mode, dark mode, or auto-switch based on time of day
- Responsive layout for desktop and mobile
- Consistent loading spinners across all features
- Optional shortened answers for Wikipedia results

### Privacy & Security
- No messages are stored, logged, or sent anywhere for core chat
- Tiered safety system with graduated bans for repeat violations
- Content warning modal with auto-stop
- Everything stays in your browser

### Account
- Optional Google sign-in to save chats across sessions
- IndexedDB for local persistence

### Performance
- Loads fast, responds instantly
- Works on all modern browsers
- Clear error messages when things go wrong

## Special Commands

| Command | Example | What It Does |
|---|---|---|
| `@ImgAuth` | `@ImgAuth` (with an image attached) | Checks if the image was AI-generated |
| `@txtauth` | `@txtauth This looks kinda robotic...` | Checks text for AI-generated patterns |

Just type the command in the chat box and attach an image first if you are using `@ImgAuth`.

## What It Looks Like

The interface is clean, minimal, and focused with a theme toggle between light and dark (or let it auto-switch) and a responsive layout that works on your phone or your desktop. There are message actions to copy or listen to responses, a sidebar for managing chats, and dropdowns and modals for the usual UI stuff, but stripped down to what matters.

## How to Use It

There is no setup or downloads required, just go to:

**[https://xpdevs.github.io/Genesis-AI](https://xpdevs.github.io/Genesis-AI)**

When the page loads:
1. You'll see the chat interface
2. Type your message or question
3. Genesis-AI responds using its logic

If it can't figure out an answer, you'll get a helpful error instead of silence. Close the page or refresh anytime and nothing gets lost or leaked.

## Architecture

The architecture has three layers:

| Layer | What It Is |
|---|---|
| **Frontend** | HTML/CSS that is responsive and minimal |
| **Logic Engine** | JavaScript that decodes modals, manages state, and picks responses |
| **Modal** | `.bin` or `.json` that stores the AI's knowledge base |

Separate them cleanly, and you can update any part without breaking the others.

## Modal Structure (The AI's Brain)

The main distribution format is a compressed `.bin` for speed, but it starts life as JSON that looks something like this:

```json
{
  "ver": "Genesis-SPT-1.0",
  "hello": "Hello there! How can I help you today?",
  "who are you": "I'm Genesis-AI, an experimental web-based intelligence by XPDevs."
}
```

You type something, the system matches it against keys or patterns, and returns the matching response. If nothing matches, the fallback kicks in.

Want to build your own modal? Copy the structure, tweak the keys, and save as JSON, and you are done.

## Error Messages

### 1. Safety Violation
> "This message violates AI safety and use policies. Please try again."

Shows up when the safety filter catches something you typed, causing generation to stop and a warning modal to pop up. On the first offense you only see the modal, on repeat offenses you get a modal plus a chat message, and after five or more the graduated ban kicks in.

**Fix:** Don't send what you shouldn't and just click OK on the warning to move on.

### 2. Processing Failure
> "I'm not quite sure I follow. Could you give me a bit more detail?"

This is the default "I don't know" response that happens when nothing in the modal matches what you said.

**Fix:** Try to rephrase or simplify your message to help the system find a matching response.

### Quick Error Table

| Message | What's Wrong | What to Do |
|---|---|---|
| This message violates AI safety and use policies. | Unsafe input detected | Remove restricted words, try again |
| Image generation took too long and timed out. | Generation exceeded 5 minutes | Try a simpler prompt |
| Failed to generate image. Please try again. | Service returned nothing | Retry or adjust prompt |
| I'm not quite sure I follow... | No matching response found | Rephrase or simplify |

## Privacy

- No chat logs or user data stored or shared (unless you sign in, and even then it's minimal)
- Everything runs in your browser session
- No external databases, trackers, or analytics

It is private by default and ephemeral by design.

## Security

- Restricted word detection for unsafe input
- Automatic message deletion on policy violations
- No external scripts accessing chat data
- Tiered ban system for repeat offenders

The system keeps things responsible without getting in your way.

## Design Philosophy

Everything at XPDevs follows three rules:

1. **Clarity:** If someone has to squint to understand it, it is not done
2. **Control:** You own your data and your interactions
3. **Simplicity:** If it does not make things better, it does not belong

These apply to the interface, the logic, and the modals alike.

## Terms & Policies

By using Genesis-AI, you agree to:
- **[Terms of Service](https://xpdevs.github.io/legal/terms-of-service)**
- **[Privacy Policy](https://xpdevs.github.io/Genesis-AI/legal/privacy-policy)**

They cover acceptable use, safety rules, and how privacy works.

## License

The source code in this repo is under the terms in LICENSE.md. The live site at https://xpdevs.github.io/Genesis-AI follows a separate custom license that covers the hosted service, including usage and content policies. When you use the website directly, that custom license and the Terms of Service take priority.

## Contact

If you have questions, suggestions, or random thoughts, head over to the [XPDevs website](https://xpdevs.github.io/) for updates, contact info, and related projects.
