// --- DATABASE UTILITY (IndexedDB) ---
const DB = {
    dbName: "GenesisAI",
    dbVersion: 3,
    storeName: "settings",
    modelStore: "models",
    responsesStore: "responses",
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
                if (!db.objectStoreNames.contains(this.modelStore)) {
                    db.createObjectStore(this.modelStore);
                }
                if (!db.objectStoreNames.contains(this.responsesStore)) {
                    db.createObjectStore(this.responsesStore);
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async get(key, defaultValue = null) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result !== undefined ? request.result : defaultValue);
            request.onerror = () => reject(request.error);
        });
    },

    async set(key, value) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getModel(key) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.modelStore], "readonly");
            const store = transaction.objectStore(this.modelStore);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async setModel(key, value) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.modelStore], "readwrite");
            const store = transaction.objectStore(this.modelStore);
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getResponse(key) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.responsesStore], "readonly");
            const store = transaction.objectStore(this.responsesStore);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async setResponse(key, value) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.responsesStore], "readwrite");
            const store = transaction.objectStore(this.responsesStore);
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async clearResponses() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.responsesStore], "readwrite");
            const store = transaction.objectStore(this.responsesStore);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async delete(key) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async clear() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};

async function migrateFromLocalStorage() {
    const keys = ["chats", "activeChatId", "userInfo", "hasWelcomed", "genesisBanInfo", "selectedModel", "autoTheme", "theme", "SETUP"];
    for (const key of keys) {
        const val = localStorage.getItem(key);
        if (val !== null) {
            try {
                const parsed = JSON.parse(val);
                await DB.set(key, parsed);
            } catch (e) {
                await DB.set(key, val);
            }
            localStorage.removeItem(key);
        }
    }
}

async function initializeApp() {
    console.log("Website loaded successfully V6.4");

    if (!(await DB.get("hasWelcomed"))) {
        if (window.innerWidth <= 768) {
            const userInfo = await DB.get("userInfo", {});
            const name = userInfo.name || "User";
            if (window.Genesis && typeof window.Genesis.welcome === 'function') {
                Genesis.welcome(name);
            }
        }
        await DB.set("hasWelcomed", "true");
    }

    // Load tokenizer first as it's a core dependency
    const tokenizerScript = document.createElement('script');
    tokenizerScript.src = 'js/token.js?v=' + Date.now();
    document.head.appendChild(tokenizerScript);

    loadMathSupport();
    injectCSS();
    initGoogleSignIn();

    // Load sidebar logic
    const sidebarScript = document.createElement('script');
    sidebarScript.src = 'js/sidebar.js?v=' + Date.now();
    sidebarScript.onload = () => { if (typeof setupSidebarUI === 'function') setupSidebarUI(); };
    sidebarScript.onerror = () => { console.error("Failed to load js/sidebar.js. Please ensure the file exists."); };
    document.head.appendChild(sidebarScript);

    // Move settings and search buttons to chat header and restyle them
    if (chatTitle && settingsBtn) {
        const chatHeader = chatTitle.parentElement;
        if (chatHeader) {
            const actions = document.createElement('div');
            actions.className = 'header-actions';
            actions.appendChild(settingsBtn);
            chatHeader.appendChild(actions);
            chatHeader.classList.add('chat-header');
        }
        // Remove text from settings button, leaving only the icon
        const icon = settingsBtn.querySelector('svg');
        if (icon) {
            settingsBtn.innerHTML = icon.outerHTML;
        }
    }

    // Initialize speech recognition after other scripts are loaded
    const startSpeech = () => {
        window.initSpeech({
            inputArea: document.getElementById("inputArea"),
            userInput: document.getElementById("userInput"),
            sendBtn: document.getElementById("sendBtn"),
            sendMessage: sendMessage
        });
    };

    if (window.initSpeech) {
        startSpeech();
    } else {
        window.addEventListener('speech-ready', startSpeech);
    }

    window.dispatchEvent(new Event('app-ready'));
    setupSwipeGestures();

    // Scroll-to-bottom button logic
    const scrollBtn = document.getElementById('scrollToBottomBtn');
    if (scrollBtn && chatBox) {
        chatBox.addEventListener('scroll', () => {
            const threshold = 200;
            const isNearBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < threshold;
            scrollBtn.style.display = isNearBottom ? 'none' : 'flex';
        });
        scrollBtn.addEventListener('click', () => {
            chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
        });
    }

    // Show feature modal after everything is loaded
    if (typeof showFeatureModal === 'function') {
        showFeatureModal();
    }
}

function setupSwipeGestures() {
    if (window.innerWidth > 768) return;

    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 50;
    const horizontalThreshold = 1.5;

    document.addEventListener('touchstart', (e) => {
        if (e.target.closest('button, input, select, textarea, .action-btn, a')) {
            touchStartX = 0;
            return;
        }
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (touchStartX === 0) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        const isModalOpen = Array.from(document.querySelectorAll('.modal')).some(m => {
            const style = getComputedStyle(m);
            return style.display !== 'none';
        });
        if (isModalOpen) return;

        if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY) * horizontalThreshold) {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            if (deltaX > 0 && !sidebar.classList.contains('open')) {
                sidebar.classList.add('open');
            } else if (deltaX < 0 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    }, { passive: true });
}

function loadMathSupport() {
    if (document.getElementById('katex-css')) return;
    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = 'https://xpdevs.github.io/Genesis-AI/styles/calc-display.css?v=' + Date.now();
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://xpdevs.github.io/Genesis-AI/js/calc-display.js?v=' + Date.now();
    script.onload = () => { window.katexLoaded = true; };
    document.head.appendChild(script);
}

// --- EXPORT FUNCTIONS ---
async function exportChatAsMarkdown(chat) {
    let md = `# ${chat.title}\n\n`;
    chat.messages.forEach(msg => {
        const role = msg.role === 'user' ? '**You**' : '**Genesis**';
        md += `${role}: ${msg.text}\n\n`;
    });
    return md;
}

async function exportChatAsPDF(chat) {
    const printWindow = window.open('', '_blank');
    let html = `<!DOCTYPE html><html><head><title>${chat.title}</title>`;
    html += `<style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        .user { color: #007bff; font-weight: bold; }
        .ai { color: #28a745; font-weight: bold; }
        .message { margin-bottom: 15px; }
    </style></head><body>`;
    html += `<h1>${chat.title}</h1>`;
    chat.messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'Genesis';
        html += `<div class="message"><span class="${msg.role}">${role}:</span> ${msg.text}</div>`;
    });
    html += `</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

function exportAccountData() {
    return {
        userInfo: DB.get("userInfo", {}),
        chats: DB.get("chats", []),
        banInfo: DB.get("genesisBanInfo", {}),
        exportDate: new Date().toISOString()
    };
}

async function downloadExport(accountData) {
    const dataStr = JSON.stringify(accountData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .chat-header {
            display: flex;
            justify-content: space-between;
            padding-top: 8px; /* Add some space at the top */
            padding-right: 16px;
            box-sizing: border-box;
        }
        .header-actions {
            display: flex;
            gap: 8px;
        }
        #settingsBtn {
            width: 40px;
            height: 40px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            flex-shrink: 0;
            border: none;
            background: rgba(128, 128, 128, 0.1);
            cursor: pointer;
            transition: all 0.2s;
        }
        .input-area {
            padding: 14px 12px 14px 22px;
        }
        .input-row-top {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .input-row-top input {
            flex: 1;
            min-width: 0;
        }
        /* Ensure chat container takes full height for proper scrollbar placement */
        body {
            display: flex;
            overflow: hidden; /* Prevent body from scrolling */
        }
        .chat-main {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        #chatBox {
            flex-grow: 1;
            overflow-y: auto;
            direction: ltr;
        }
        /* Custom scrollbar on the right side */
        #chatBox::-webkit-scrollbar {
            width: 8px;
            position: absolute;
            right: 0;
        }
        #chatBox::-webkit-scrollbar-track {
            background: transparent;
        }
        #chatBox::-webkit-scrollbar-thumb {
            background: rgba(128, 128, 128, 0.3);
            border-radius: 4px;
        }
        #chatBox::-webkit-scrollbar-thumb:hover {
            background: rgba(128, 128, 128, 0.5);
        }
        .scroll-bottom-btn {
            position: fixed;
            bottom: 100px;
            right: max(calc((100% - 800px) / 2 + 20px), 20px);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--input-bg);
            border: 1px solid var(--border);
            color: var(--text);
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: all 0.2s ease;
            padding: 0;
            opacity: 0.85;
        }
        .scroll-bottom-btn:hover {
            background: var(--active-chat);
            opacity: 1;
            transform: scale(1.1);
        }
        #greeting {
            text-align: center !important;
        }
        .quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
            justify-content: center;
        }
        .quick-action-btn {
            background: var(--input-bg);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 10px 18px;
            border-radius: 24px;
            cursor: pointer;
            font-size: 14px;
            font-family: inherit;
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        .quick-action-btn:hover {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
            transform: translateY(-1px);
        }
        @media (max-width: 768px) {
            .scroll-bottom-btn {
                bottom: 90px;
                right: 16px;
                width: 36px;
                height: 36px;
            }
        }
        @media (min-width: 769px) {
            .chat-header {
                position: relative;
            }
            #chatTitle {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                max-width: 50%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin: 0;
            }
        }
        .msg-stats {
            display: flex;
            align-items: center;
            gap: 6px;
            opacity: 0.6;
            font-size: 11px;
            font-family: monospace;
            color: var(--text);
        }
        .stats-icon {
            font-size: 10px;
        }
        .stats-value {
            white-space: nowrap;
        }
        .message-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 4px;
            width: 100%;
            gap: 10px;
        }
        .message.user .message-footer {
            justify-content: flex-end;
        }
        .msg-actions {
            position: static !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            display: flex !important;
            gap: 6px !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        .msg-actions .action-btn {
            margin-top: 0 !important;
        }
        .msg-actions .action-btn:hover {
            transform: none !important;
        }
        .message:hover .msg-actions,
        .msg-actions:hover,
        .message.ai.latest .msg-actions {
            opacity: 1 !important;
        }

        /* Markdown rendered styles */
        .message span code {
            background: rgba(128,128,128,0.15);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
        }
        .message span pre {
            background: rgba(128,128,128,0.1);
            padding: 10px 14px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 4px 0;
            line-height: 1.4;
        }
        .message span pre code {
            background: none;
            padding: 0;
            border-radius: 0;
            font-size: 0.85em;
            line-height: 1.5;
        }
        .message span blockquote {
            border-left: 3px solid var(--primary, #007bff);
            margin: 4px 0;
            padding: 2px 12px;
            opacity: 0.85;
        }
        .message span h1,
        .message span h2,
        .message span h3,
        .message span h4 {
            margin: 8px 0 4px;
            line-height: 1.3;
        }
        .message span h1 { font-size: 1.3em; }
        .message span h2 { font-size: 1.2em; }
        .message span h3 { font-size: 1.1em; }
        .message span h4 { font-size: 1.05em; }
        .message span ul,
        .message span ol {
            margin: 2px 0;
            padding-left: 22px;
        }
        .message span li {
            margin: 0;
            line-height: 1.5;
        }
        .message span hr {
            border: none;
            border-top: 1px solid rgba(128,128,128,0.3);
            margin: 6px 0;
        }
        .message span a {
            color: var(--primary, #007bff);
            text-decoration: underline;
        }
        .message span a:hover {
            opacity: 0.8;
        }
        .message span img {
            max-width: 100%;
            border-radius: 8px;
            margin: 8px 0;
        }
        .message span s {
            opacity: 0.6;
            text-decoration: line-through;
        }
    `;
    document.head.appendChild(style);
}

// UI Elements

const chatList = document.getElementById("chatList");
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const settingsBtn = document.getElementById("settingsBtn");
const userIcon = document.getElementById("userIcon");
const settingsModal = document.getElementById("settingsModal");
const accountModal = document.getElementById("accountModal");
const themeToggle = document.getElementById("themeToggle");
const autoThemeToggle = document.getElementById("autoThemeToggle");
const modelSelect = document.getElementById("modelSelect");
const chatTitle = document.getElementById("chatTitle");
const headerModelSelect = document.getElementById("headerModelSelect");
const readOnlyBanner = document.getElementById("readOnlyBanner");
const renameModal = document.getElementById("renameModal");
const renameInput = document.getElementById("renameInput");
const renameConfirm = document.getElementById("renameConfirm");
const renameCancel = document.getElementById("renameCancel");
const deleteModal = document.getElementById("deleteModal");
const deleteConfirm = document.getElementById("deleteConfirm");
const deleteCancel = document.getElementById("deleteCancel");
const shareModal = document.getElementById("shareModal"); 
const shareLinkInput = document.getElementById("shareLinkInput"); 
const copyShareLinkBtn = document.getElementById("copyShareLinkBtn");
const shareCancel = document.getElementById("shareCancel");
const suggestionBox = document.getElementById("suggestionBox");
const uploadBtn = document.getElementById("uploadBtn");
const imgUploadInput = document.getElementById("imgUploadInput");
const inputArea = document.getElementById("inputArea");
// Dev Modal Elements
const devModal = document.getElementById("devModal");
const devModalWaiting = document.getElementById("devModalWaiting");
const devModalOptions = document.getElementById("devModalOptions");
const devModalCancel = document.getElementById("devModalCancel");
const devModalClose = document.getElementById("devModalClose");
const customModelInput = document.getElementById("customModelInput");
const devCurrentModalName = document.getElementById("devCurrentModalName");
const devCurrentModalMode = document.getElementById("devCurrentModalMode");
const uploadStatus = document.getElementById("uploadStatus");

const reasoningToggleBtn = document.getElementById("reasoningToggleBtn");

// State
let chats = [];
let activeChatId = null;
let chatDisplayCount = 5;
let responses = {};
let currentRenameId = null;
let currentDeleteId = null;
let isReadOnlyMode = false;
let currentUploadFile = null;
let isDevMode = false;
let searchQuery = "";

// AI Control State
let aiState = {
    isResponding: false,
    currentRequestId: 0,
    loadingDiv: null,
    cancelTyping: null,
    thinkingTimeout: null,
    resetTimeout: null,
    originalSendIcon: null,
    currentAiMessage: null
};

// Show internal reasoning from <|think|> blocks
let showReasoning = false;

function parseThinkBlocks(text) {
  const parts = [];
  let lastIdx = 0;
  const regex = /<\|think\|>([\s\S]*?)<\/\|think\|>/g;
  let match;
  let hasThinking = false;
  while ((match = regex.exec(text)) !== null) {
    hasThinking = true;
    if (match.index > lastIdx) {
      parts.push({ type: 'text', content: text.slice(lastIdx, match.index) });
    }
    parts.push({ type: 'think', content: match[1].trim() });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIdx) });
  }
  if (!hasThinking) {
    return { parts: [{ type: 'text', content: text }], hasThinking: false };
  }
  return { parts, hasThinking };
}

// Wikipedia Search flag (default false)
let useWikipedia = false;
let warningInjected = false;

const warningHtml = `
  <div id="contentWarning" style="display:block;font-size:12px;text-align:center;padding:14px 20px;color:#70757a;border-top:1px solid var(--border,#444746);">
    Genesis may display inaccurate info, including about people, so double-check its responses.  
    <br>
    <a href="https://xpdevs.github.io/Genesis-AI/legal/privacy-policy" target="_blank" style="color:var(--primary,#3b82f6);text-decoration:none;">Privacy Policy</a> • 
    <a href="https://xpdevs.github.io/Genesis-AI/legal/terms-of-service" target="_blank" style="color:var(--primary,#3b82f6);text-decoration:none;">Terms Of Service</a> • 
    <a href="https://xpdevs.github.io/Genesis-AI/status/Status.html" target="_blank" style="color:var(--primary,#3b82f6);text-decoration:none;">Status</a>
  </div>`;

// Function to update send button based on input content
function updateSendButton() {
    if (!userInput) return;
    const isMobile = window.innerWidth <= 768;
    
    if (aiState.isResponding) {
        // If responding, show stop square (same on both mobile and desktop)
        sendBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>';
    } else if (isMobile) {
        if (userInput.value.trim() === '') {
            sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/></svg>';
        } else {
            sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/></svg>';
        }
    } else {
        sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/></svg>';
    }
}

function stopGeneration() {
    if (!aiState.isResponding) return;
    
    aiState.isResponding = false;
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    aiState.currentRequestId++; // Invalidate pending operations
    
    if (aiState.cancelTyping) {
        aiState.cancelTyping();
        aiState.cancelTyping = null;
    }
    
    if (aiState.thinkingTimeout) {
        clearTimeout(aiState.thinkingTimeout);
        aiState.thinkingTimeout = null;
    }

    if (aiState.resetTimeout) {
        clearTimeout(aiState.resetTimeout);
        aiState.resetTimeout = null;
    }
    
    if (aiState.loadingDiv) {
        aiState.loadingDiv.remove();
        aiState.loadingDiv = null;
    }

    // Truncate message in history if it was still typing
    if (aiState.currentAiMessage && aiState.currentAiMessage.text) {
        const chat = chats.find(c => c.id === activeChatId);
        if (chat && chat.messages.includes(aiState.currentAiMessage)) {
            // Find the message element in the DOM to see how much was typed
            const latestMsgDiv = chatBox.querySelector('.message.ai.latest');
            const latestMsgSpan = latestMsgDiv ? latestMsgDiv.querySelector('span') : null;
            if (latestMsgSpan) {
                const typedText = latestMsgSpan.textContent;
                aiState.currentAiMessage.text = typedText;
                saveChats();
                
                if (latestMsgDiv && aiState.firstTokenTime) {
                    const elapsed = Date.now() - aiState.firstTokenTime;
                    const tokens = window.tokenizer.tokenizeLikeLLM(typedText).length;
                    const tps = elapsed > 0 ? (tokens / (elapsed / 1000)).toFixed(1) : "0.0";
                    
                    aiState.currentAiMessage.elapsedTime = elapsed;
                    aiState.currentAiMessage.tokenCount = tokens;
                    aiState.currentAiMessage.tokensPerSecond = tps;
                    
                    showMsgStats(latestMsgDiv, typedText, elapsed);
                }
            }
        }
    }
    aiState.currentAiMessage = null;
    
    // Show stop message
    const stopMsg = document.createElement("div");
    stopMsg.style.color = "#888";
    stopMsg.style.fontSize = "0.8em";
    stopMsg.style.textAlign = "center";
    stopMsg.style.marginTop = "5px";
    stopMsg.style.marginBottom = "10px";
    stopMsg.textContent = "You Stopped this message";
    chatBox.appendChild(stopMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Reset UI
    userInput.disabled = false;
    if (aiState.originalSendIcon) sendBtn.innerHTML = aiState.originalSendIcon;
    sendBtn.disabled = false;
    sendBtn.style.opacity = "1";
    userInput.focus();

    if (currentUploadFile) { 
        currentUploadFile = null; 
        if(uploadBtn) uploadBtn.style.color = ""; 
    }
    
    updateSendButton(); // Re-evaluate button state
}

// Shared Chat Constants
const CHAR_SEPARATOR = '000'; 
const ROLE_SEPARATOR = '555'; 
const MSG_SEPARATOR = '9999'; 

// --- SHARED CHAT LOGIC ---
function encodeChat(messages) {
    if (!messages || messages.length === 0) return '';
    const roleMap = { 'user': 1, 'ai': 2, 'error': 3 };
    return messages.map(msg => {
        const roleCode = roleMap[msg.role] || 3; 
        let textCodes = '';
        for (let i = 0; i < msg.text.length; i++) {
            const charCode = msg.text.charCodeAt(i);
            const paddedCode = charCode.toString().padStart(5, '0'); 
            if (i > 0) textCodes += CHAR_SEPARATOR;
            textCodes += paddedCode;
        }
        return `${roleCode}${ROLE_SEPARATOR}${textCodes}`;
    }).join(MSG_SEPARATOR);
}

function decodeChat(encodedString) {
    if (!encodedString) return [];
    const roleMap = { 1: 'user', 2: 'ai', 3: 'error' };
    const messages = [];
    const encodedMessages = encodedString.split(MSG_SEPARATOR);
    encodedMessages.forEach(encodedMsg => {
        const parts = encodedMsg.split(ROLE_SEPARATOR);
        if (parts.length !== 2) return;
        const roleCode = parseInt(parts[0], 10);
        const textCodesString = parts[1];
        const role = roleMap[roleCode] || 'error';
        if (!textCodesString) {
            messages.push({ role, text: '' });
            return;
        }
        const rawCodes = textCodesString.split(CHAR_SEPARATOR).map(c => parseInt(c, 10));
        const text = String.fromCharCode(...rawCodes.filter(c => !isNaN(c)));
        messages.push({ role, text });
    });
    return messages;
}

async function loadAndSaveSharedChat(messages, originalTitle) {
    isReadOnlyMode = false;
    if (readOnlyBanner) readOnlyBanner.style.display = 'none';
    if (inputArea) inputArea.style.display = 'flex';
    userInput.disabled = false;
    sendBtn.disabled = false;
    const sidebarHeader = document.querySelector(".sidebar-header");
    if (sidebarHeader) sidebarHeader.style.display = 'flex';
    const newChatTitle = `${originalTitle} (shared)`;
    const newChat = { id: Date.now().toString(), title: newChatTitle, messages: messages, lastActive: Date.now() };
    chats.unshift(newChat);
    activeChatId = newChat.id;
    await DB.set("activeChatId", activeChatId);
    await saveChats(); renderChatList(); renderMessages();
    if (newChatBtn) newChatBtn.disabled = false;
    if (settingsBtn) settingsBtn.disabled = false;
    updateURL(newChatTitle);
}

function loadSharedChat() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedChat = urlParams.get("q");
    if (encodedChat) {
        const decodedMessages = decodeChat(encodedChat);
        let title = "Shared Conversation";
        const firstUserMsg = decodedMessages.find(msg => msg.role === 'user');
        if (firstUserMsg) title = summariseTitle(firstUserMsg.text);
        loadAndSaveSharedChat(decodedMessages, title);
        return true; 
    }
    return false;
}

// --- BAN SYSTEM ---
const BAN_STORAGE_KEY = 'genesisBanInfo';
const SECRET_UNBAN_CODE = 'Te3nt!?'; 

async function loadBanInfo() {
  return await DB.get(BAN_STORAGE_KEY, { consecutiveViolations: 0, banHistoryCount: 0, bannedUntil: null });
}
async function saveBanInfo(info) { await DB.set(BAN_STORAGE_KEY, info); }
async function isCurrentlyBanned() {
  const info = await loadBanInfo();
  if (!info.bannedUntil) return false;
  if (info.bannedUntil === 'perm') return true;
  return Date.now() < info.bannedUntil;
}

function ensureBanModal() {
  let existing = document.getElementById('banModal');
  if (existing) return existing;
  const modal = document.createElement('div');
  modal.id = 'banModal';
  modal.className = 'modal ban-modal';
  modal.innerHTML = `
    <div class="modal-content ban-modal-content">
      <h2 id="banModalTitle">You have been banned</h2>
      <p id="banModalMessage">Reason: multiple violations of terms of service.</p>
      <p id="banModalCountdown" class="ban-countdown">Time left: calculating...</p>
      <p class="ban-footer">Read our <a id="banTosLink" href="https://xpdevs.github.io/Genesis-AI/legal/terms-of-service" target="_blank" rel="noopener">Terms of Service</a> for details.</p>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

let banCountdownInterval = null;
async function applyBan() {
  const info = await loadBanInfo();
  const nextBanIndex = info.banHistoryCount || 0;
  let durationMs;
  let perm = false;
  if (nextBanIndex === 0) durationMs = 5 * 60 * 1000; 
  else if (nextBanIndex === 1) durationMs = 10 * 60 * 1000; 
  else perm = true;
  info.banHistoryCount = nextBanIndex + 1;
  info.consecutiveViolations = 0;
  info.bannedUntil = perm ? 'perm' : Date.now() + durationMs;
  await saveBanInfo(info);
  await showBanModal();
}

async function liftBan() {
  const info = await loadBanInfo();
  info.bannedUntil = null;
  info.consecutiveViolations = 0;
  await saveBanInfo(info);
  const m = document.getElementById('banModal');
  if (m) m.style.display = 'none';
  if (banCountdownInterval) { clearInterval(banCountdownInterval); banCountdownInterval = null; }
}

window.unbanGenesis = async function(code) {
  if (code === SECRET_UNBAN_CODE) { await liftBan(); return true; }
  return false;
};

async function showBanModal() {
  const modal = ensureBanModal();
  const title = modal.querySelector('#banModalTitle');
  const msg = modal.querySelector('#banModalMessage');
  const countdownEl = modal.querySelector('#banModalCountdown');
  const info = await loadBanInfo();
  if (info.bannedUntil === 'perm') {
    title.textContent = 'You have been permanently banned';
    msg.textContent = 'This account is permanently banned due to repeated violations of our terms.';
    countdownEl.textContent = 'Permanent ban — no countdown.';
    modal.style.display = 'flex';
    document.body.style.pointerEvents = 'none';
    return;
  }
  const end = info.bannedUntil;
  if (!end) return;
  async function updateCountdown() {
    const remaining = end - Date.now();
    if (remaining <= 0) {
      countdownEl.textContent = 'Ban expired — you may continue.';
      await liftBan(); document.body.style.pointerEvents = 'auto'; return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    countdownEl.textContent = `Time left: ${mins}m ${secs}s`;
  }
  await updateCountdown();
  if (banCountdownInterval) clearInterval(banCountdownInterval);
  banCountdownInterval = setInterval(updateCountdown, 1000);
  modal.style.display = 'flex';
  document.body.style.pointerEvents = 'none';
}

const defaultModel = "https://base44.app/api/apps/69ff62869abc2f6968205265/files/mp/public/69ff62869abc2f6968205265/8897d4c1d_Genesis-55.json";
let jsonURL = defaultModel;

let modelLoadingEl = null;

function showModelLoading(pct) {
  if (!modelLoadingEl) {
    modelLoadingEl = document.createElement('div');
    modelLoadingEl.id = 'model-loading';
    modelLoadingEl.innerHTML = '<div id="model-loading-bar"><div id="model-loading-fill"></div></div><div id="model-loading-text">Loading model...</div>';
    const s = document.createElement('style');
    s.id = 'model-loading-style';
    s.textContent = `
      #model-loading {
        position: fixed; top: 0; left: 0; right: 0; z-index: 2147483646;
        display: flex; flex-direction: column; align-items: center; padding-top: 20px;
        pointer-events: none;
      }
      #model-loading-bar {
        width: 200px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 4px; overflow: hidden;
      }
      #model-loading-fill {
        height: 100%; width: 0%; background: var(--primary, #007bff); border-radius: 4px;
        transition: width 0.3s ease;
      }
      #model-loading-text {
        margin-top: 8px; font-size: 13px; color: var(--text-secondary, #aaa);
      }
    `;
    document.head.appendChild(s);
    document.body.appendChild(modelLoadingEl);
  }
  const fill = modelLoadingEl.querySelector('#model-loading-fill');
  const text = modelLoadingEl.querySelector('#model-loading-text');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = 'Loading model... ' + pct + '%';
}

function hideModelLoading() {
  if (modelLoadingEl) {
    modelLoadingEl.remove();
    modelLoadingEl = null;
    const s = document.getElementById('model-loading-style');
    if (s) s.remove();
  }
}

async function loadModel(force = false) {
  jsonURL = await DB.get("selectedModel", defaultModel);
  
  if (!force) {
    const cached = await DB.getModel(jsonURL);
    if (cached && typeof cached === 'object' && cached.cached !== true) {
      console.log("Loading model from cache:", jsonURL);
      responses = cached;
      return;
    }
  }

  showModelLoading(0);
  try {
    const r = await fetch(jsonURL + (force ? "?v=" + Date.now() : ""));
    if (!r.ok) throw new Error("File not found!");
    
    const allBytes = await r.arrayBuffer();
    const modelData = JSON.parse(new TextDecoder().decode(allBytes));
    responses = modelData;
    await DB.setModel(jsonURL, modelData);
    hideModelLoading();
  } catch (err) {
    hideModelLoading();
    console.error("Model load error:", err);
    // fallback to default model
    const r = await fetch("https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json?v=" + Date.now());
    const data = await r.json();
    responses = data; 
    if (typeof showLegacyModal === "function") showLegacyModal();
  }
}

// --- UI & MESSAGING ---
async function saveChats() { await DB.set("chats", chats); }
async function updateURL(chatTitle) {
  const url = new URL(window.location.origin + window.location.pathname);
  const chat = chats.find(c => c.id === activeChatId);
  if (chat && chat.messages.length > 0) {
    if (!chat.urlCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      for (let i = 0; i < 20; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      chat.urlCode = randomString;
      await saveChats();
    }
    url.searchParams.set("c", chat.urlCode);
  } else {
    url.searchParams.delete("c");
  }
  history.pushState({}, "", url);
}

function renderChatList() {
  if (isReadOnlyMode) return;
  chatList.innerHTML = "";
  
  let displayChats = chats;
  if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      displayChats = chats.filter(c => 
          (c.title && c.title.toLowerCase().includes(q)) || 
          (c.messages && c.messages.some(m => m.text && typeof m.text === 'string' && m.text.toLowerCase().includes(q)))
      );
  }

  displayChats.sort((a, b) => {
      const aIsNew = a.title === "New Chat" && a.messages.length === 0;
      const bIsNew = b.title === "New Chat" && b.messages.length === 0;
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      if (b.pinned !== a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      return (b.lastActive || 0) - (a.lastActive || 0);
  });

  // Show only chatDisplayCount chats unless searching
  let showCount = searchQuery.trim() ? displayChats.length : Math.min(chatDisplayCount, displayChats.length);

  // Ensure active chat is always visible
  if (!searchQuery.trim() && activeChatId) {
      const activeIdx = displayChats.findIndex(c => c.id === activeChatId);
      if (activeIdx >= showCount) {
          showCount = activeIdx + 1;
          chatDisplayCount = showCount;
      }
  }

  displayChats.slice(0, showCount).forEach(chat => {
    const li = document.createElement("li");
    li.className = "chat-item" + (chat.id === activeChatId ? " active" : "");
    
    let pressTimer;
    li.addEventListener('touchstart', () => {
        pressTimer = setTimeout(() => {
            document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
            document.querySelectorAll('.dots-btn').forEach(b => b.style.background = "");
            dropdown.style.display = "flex";
            dots.style.background = "var(--active-chat)";
        }, 1500);
    }, {passive: true});
    li.addEventListener('touchend', () => clearTimeout(pressTimer));
    li.addEventListener('touchmove', () => clearTimeout(pressTimer));

    const span = document.createElement("span");
    span.textContent = chat.title;
    span.className = "chat-name";
    const options = document.createElement("div");
    options.className = "chat-options";
    
    if (chat.pinned) {
        const pinIcon = document.createElement("span");
        pinIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>';
        Object.assign(pinIcon.style, { display: 'flex', alignItems: 'center', marginRight: '4px', opacity: '0.6' });
        options.appendChild(pinIcon);
    }

    const dots = document.createElement("button");
    dots.textContent = "⋮";
    dots.className = "dots-btn";
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";
    const pinBtn = document.createElement("button");
    pinBtn.textContent = chat.pinned ? "Unpin Chat" : "Pin Chat";
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";

    pinBtn.onclick = async e => { e.stopPropagation(); chat.pinned = !chat.pinned; await saveChats(); renderChatList(); dropdown.style.display = "none"; };
    renameBtn.onclick = e => { e.stopPropagation(); currentRenameId = chat.id; renameInput.value = chat.title; renameModal.style.display = "flex"; dropdown.style.display = "none"; };
    deleteBtn.onclick = e => { e.stopPropagation(); currentDeleteId = chat.id; deleteModal.style.display = "flex"; dropdown.style.display = "none"; };
    shareBtn.onclick = e => { e.stopPropagation(); showShareModal(chat.id); dropdown.style.display = "none"; };
    dots.onclick = e => { 
        e.stopPropagation(); 
        if (dropdown.style.display === "flex") {
            dropdown.style.display = "none";
            dots.style.background = "";
        } else {
            dropdown.style.display = "flex";
            dots.style.background = "var(--active-chat)";
        }
    };

    dropdown.append(pinBtn, renameBtn, deleteBtn, shareBtn);
    options.append(dots, dropdown);
    li.onclick = async () => { activeChatId = chat.id; await DB.set("activeChatId", activeChatId); renderChatList(); renderMessages(); await updateURL(chat.title); };
    li.append(span, options);
    chatList.append(li);
  });

  // Load More button
  if (!searchQuery.trim() && showCount < displayChats.length) {
      const remaining = displayChats.length - showCount;
      const loadMoreLi = document.createElement("li");
      loadMoreLi.className = "load-more-item";
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.textContent = `Load More (${remaining})`;
      loadMoreBtn.className = "load-more-btn";
      loadMoreBtn.onclick = () => {
          chatDisplayCount += 5;
          renderChatList();
      };
      loadMoreLi.appendChild(loadMoreBtn);
      chatList.append(loadMoreLi);
  }
}

function updatePlaceholder() {
    const chat = chats.find(c => c.id === activeChatId);
    const hasReplies = chat && chat.messages && chat.messages.some(m => m.role === 'ai');
    const newText = hasReplies ? 'Reply to Genesis AI' : 'Ask Genesis AI';
    const oldText = userInput.placeholder;
    if (oldText === 'Ask Genesis AI' && newText === 'Reply to Genesis AI') {
        animatePlaceholderTransition('Ask Genesis AI', 'Reply to Genesis AI');
    } else {
        userInput.placeholder = newText;
    }
}

function animatePlaceholderTransition(fromText, toText) {
    let phase = 'delete';
    let i = fromText.length;
    function tick() {
        if (phase === 'delete') {
            userInput.placeholder = fromText.substring(0, i);
            i--;
            if (i < 0) {
                phase = 'pause';
                setTimeout(tick, 150);
                return;
            }
            setTimeout(tick, 40);
        } else if (phase === 'pause') {
            phase = 'type';
            i = 0;
            setTimeout(tick, 50);
        } else if (phase === 'type') {
            userInput.placeholder = toText.substring(0, i + 1);
            i++;
            if (i >= toText.length) return;
            setTimeout(tick, 50);
        }
    }
    tick();
}

async function updateChatView() {
    const chat = chats.find(c => c.id === activeChatId);
    let greetingEl = document.getElementById('greeting');
    const chatMain = document.querySelector('.chat-main');
    const chatHeader = chatTitle ? chatTitle.parentElement : null;

    if (chat && chat.messages.length === 0) {
        document.body.classList.add('is-new-chat');
        if (chatHeader) {
            chatHeader.style.display = 'flex'; // Ensure header is visible
            if (chatTitle) chatTitle.style.display = 'none'; // Hide "New Chat" title
            
            // On mobile, we want sidebar toggle on left and settings on right
            // On desktop, model select on left, settings on right (CSS default)
            const isMobile = window.innerWidth <= 768;
            chatHeader.style.justifyContent = isMobile ? 'space-between' : '';
            
            chatHeader.style.alignItems = 'center'; // Vertically center button in header
            chatHeader.style.paddingTop = '8px';
            chatHeader.style.paddingRight = '16px';
        }

        if (!greetingEl) {
            greetingEl = document.createElement('div');
            greetingEl.id = 'greeting';
            if (chatMain) {
                chatMain.insertBefore(greetingEl, chatBox);
            }
        }
        const userInfo = await DB.get("userInfo", {});
        const name = userInfo.name ? userInfo.name.split(' ')[0] : 'User';
        const greetingResult = typeof getRandomGreeting === 'function' ? getRandomGreeting() : { text: 'Hello', appendName: false };
        greetingEl.innerHTML = greetingResult.appendName ? `${greetingResult.text}, ${name}` : greetingResult.text;
        const qaSetting = await DB.get("quickActionsEnabled", "false");
        if (qaSetting === "true" || qaSetting === "new") {
          greetingEl.innerHTML += `<div class="quick-actions"></div>`;
          const actionsContainer = greetingEl.querySelector('.quick-actions');
          if (actionsContainer && !actionsContainer.dataset.initialized) {
            actionsContainer.dataset.initialized = 'true';
            const quickActions = [
              { label: '🐱 Image of a cat', msg: 'image of a cat' },
              { label: '🌌 What is a black hole', msg: 'what is a black hole' },
              { label: '😂 Tell me a joke', msg: 'tell me a joke' },
              { label: '💡 Who created you', msg: 'who made you' },
              { label: '🌊 Tell me about the ocean', msg: 'tell me about the ocean' },
            ];
            quickActions.forEach(a => {
              const btn = document.createElement('button');
              btn.className = 'quick-action-btn';
              btn.textContent = a.label;
              btn.onclick = () => sendQuickAction(a.msg);
              actionsContainer.appendChild(btn);
            });
          }
        }
    } else {
        document.body.classList.remove('is-new-chat');
        if (chatHeader) {
            chatHeader.style.display = ''; // Restore default display
            if (chatTitle) chatTitle.style.display = ''; // Restore title
            chatHeader.style.justifyContent = ''; // Restore justification
            chatHeader.style.alignItems = 'center'; // Vertically center title and button
        }
        if (greetingEl) {
            greetingEl.remove();
        }
    }
}

function showQuickActionsGuide() {
  if (document.getElementById('quick-actions-guide')) return;
  const modal = document.createElement('div');
  modal.id = 'quick-actions-guide';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <h2>Welcome! Try Quick Actions</h2>
      <p>Get started quickly with these suggested prompts. Quick actions are available for your first chat. You can always enable them again in Settings.</p>
      <div class="qa-guide-buttons">
        <button class="quick-action-btn" data-qa="image of a cat">🐱 Image of a cat</button>
        <button class="quick-action-btn" data-qa="what is a black hole">🌌 What is a black hole</button>
        <button class="quick-action-btn" data-qa="tell me a joke">😂 Tell me a joke</button>
        <button class="quick-action-btn" data-qa="who made you">💡 Who created you</button>
        <button class="quick-action-btn" data-qa="tell me about the ocean">🌊 Tell me about the ocean</button>
      </div>
      <div class="modal-actions">
        <button id="qa-guide-ok" class="confirm">Got it</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.remove();
      sendQuickAction(btn.dataset.qa);
    });
  });

  const overlay = modal.querySelector('.modal-overlay');
  const okBtn = modal.querySelector('#qa-guide-ok');

  const dismiss = () => {
    modal.remove();
  };

  okBtn.addEventListener('click', dismiss);
  overlay.addEventListener('click', dismiss);

  const style = document.createElement('style');
  style.id = 'qa-guide-style';
  style.textContent = `
    #quick-actions-guide {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
      padding: 20px;
    }
    #quick-actions-guide .modal-overlay {
      position: absolute;
      inset: 0;
      background: transparent;
    }
    #quick-actions-guide .modal-content {
      background: var(--modal-bg, #1e1e1e);
      padding: 30px;
      border-radius: 28px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      color: var(--text, #fff);
      text-align: center;
    }
    #quick-actions-guide h2 {
      margin: 0 0 12px;
      font-size: 22px;
    }
    #quick-actions-guide p {
      margin: 0 0 18px;
      font-size: 14px;
      color: var(--text-secondary, #aaa);
      line-height: 1.5;
    }
    #quick-actions-guide .qa-guide-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 20px;
    }
    #quick-actions-guide .qa-guide-buttons .quick-action-btn {
      background: var(--input-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 10px 16px;
      border-radius: 24px;
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    #quick-actions-guide .qa-guide-buttons .quick-action-btn:hover {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
      transform: translateY(-1px);
    }
    #quick-actions-guide .modal-actions {
      margin-top: 0;
      display: flex;
      justify-content: center;
      gap: 12px;
    }
    #qa-guide-ok {
      padding: 10px 28px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 500;
      font-size: 15px;
      border: none;
      background-color: var(--primary, #007bff);
      color: #ffffff;
    }
    #qa-guide-ok:hover {
      filter: brightness(0.9);
      transform: translateY(-1px);
    }
    @media (max-width: 480px) {
      #quick-actions-guide {
        padding: 16px;
        align-items: flex-end;
      }
      #quick-actions-guide .modal-content {
        padding: 24px;
        border-radius: 24px 24px 0 0;
        max-width: none;
      }
    }
  `;
  if (!document.getElementById('qa-guide-style')) {
    document.head.appendChild(style);
  }
}

function sendQuickAction(text) {
  if (aiState.isResponding) return;
  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [], lastActive: Date.now() };
    chats.unshift(newChat);
    activeChatId = newChat.id;
    DB.set("activeChatId", activeChatId);
    saveChats();
    renderChatList();
  }
  userInput.value = text;
  sendMessage();
}

async function renderMessages(skipWarning = false) {
  if (isReadOnlyMode) return;
  const chat = chats.find(c => c.id === activeChatId);
  chatTitle.textContent = chat ? chat.title : "New Chat";
  warningInjected = false;
  chatBox.innerHTML = "";
  if (!chat) { await updateChatView(); return; }
  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false, msg.imageUrl, msg.footer, msg));
  chatBox.scrollTop = chatBox.scrollHeight;
  if (chat) await updateURL(chat.title);
  await updateChatView();
  updatePlaceholder();
  if (!skipWarning && window.innerWidth <= 768) {
    setTimeout(() => {
      if (!warningInjected && chatBox && window.innerWidth <= 768) {
        chatBox.insertAdjacentHTML('beforeend', warningHtml);
        warningInjected = true;
      }
    }, 50);
  }
}

function renderTextWithMath(element, text) {
    if (!window.katex) {
        element.innerHTML = text;
        return;
    }
    let remaining = text;
    element.innerHTML = "";
    while (true) {
        const startMarker = "{\\displaystyle";
        const startIndex = remaining.indexOf(startMarker);
        const doubleDollarIndex = remaining.indexOf("$$");
        let type = null;
        let idx = -1;
        if (startIndex !== -1 && (doubleDollarIndex === -1 || startIndex < doubleDollarIndex)) {
            type = 'wiki';
            idx = startIndex;
        } else if (doubleDollarIndex !== -1) {
            type = 'dollar';
            idx = doubleDollarIndex;
        }
        if (idx === -1) {
            if (remaining) {
                const span = document.createElement('span');
                span.innerHTML = remaining;
                element.appendChild(span);
            }
            break;
        }
        if (idx > 0) {
            const span = document.createElement('span');
            span.innerHTML = remaining.substring(0, idx);
            element.appendChild(span);
        }
        if (type === 'wiki') {
            let braceCount = 0;
            let endIndex = -1;
            for (let i = idx; i < remaining.length; i++) {
                if (remaining[i] === '{') braceCount++;
                else if (remaining[i] === '}') braceCount--;
                if (braceCount === 0) { endIndex = i; break; }
            }
            if (endIndex !== -1) {
                const latex = remaining.substring(idx + startMarker.length, endIndex);
                const mathSpan = document.createElement('span');
                try { window.katex.render(latex, mathSpan, { throwOnError: false, displayMode: true }); } 
                catch(e) { mathSpan.textContent = remaining.substring(idx, endIndex + 1); }
                element.appendChild(mathSpan);
                remaining = remaining.substring(endIndex + 1);
            } else {
                const span = document.createElement('span');
                span.innerHTML = remaining;
                element.appendChild(span);
                break;
            }
        } else if (type === 'dollar') {
            const endDollar = remaining.indexOf("$$", idx + 2);
            if (endDollar !== -1) {
                const latex = remaining.substring(idx + 2, endDollar);
                const mathSpan = document.createElement('span');
                try { window.katex.render(latex, mathSpan, { throwOnError: false, displayMode: true }); } 
                catch(e) { mathSpan.textContent = remaining.substring(idx, endDollar + 2); }
                element.appendChild(mathSpan);
                remaining = remaining.substring(endDollar + 2);
            } else {
                 const span = document.createElement('span');
                 span.innerHTML = remaining;
                 element.appendChild(span);
                 break;
            }
        }
    }
}

function renderWikiHeader(div, msg) {
    if (!msg || !div) return;
    const existing = div.querySelector('.wiki-header');
    if (existing) existing.remove();
    const wikiHeader = document.createElement('div');
    wikiHeader.className = 'wiki-header';
    wikiHeader.style.cssText = 'margin-bottom:10px;';
    if (msg.wikiImageDataUrls && msg.wikiImageDataUrls.length > 0) {
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:10px;';
        for (const url of msg.wikiImageDataUrls) {
            const img = document.createElement('img');
            img.src = url;
            img.style.cssText = 'width:100%;height:140px;border-radius:8px;object-fit:cover;';
            img.loading = 'lazy';
            grid.appendChild(img);
        }
        wikiHeader.appendChild(grid);
    }
    if (msg.wikiImageDataUrl) {
        if (!msg.wikiImageDataUrls || msg.wikiImageDataUrls.length === 0) {
            const img = document.createElement('img');
            img.src = msg.wikiImageDataUrl;
            img.style.cssText = 'max-width:100%;max-height:300px;border-radius:12px;display:block;object-fit:contain;margin-bottom:10px;';
            img.loading = 'lazy';
            wikiHeader.appendChild(img);
        }
    } else if (msg.wikiImageUrl) {
        if (!msg.wikiImageDataUrls || msg.wikiImageDataUrls.length === 0) {
            const img = document.createElement('img');
            img.src = msg.wikiImageUrl;
            img.style.cssText = 'max-width:100%;max-height:300px;border-radius:12px;display:block;object-fit:contain;margin-bottom:10px;';
            img.loading = 'lazy';
            wikiHeader.appendChild(img);
        }
    }
    if (msg.wikiUrl) {
        const wikiBtn = document.createElement('button');
        wikiBtn.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/250px-Wikipedia-logo-v2.svg.png" alt="" style="width:14px;height:14px;vertical-align:middle;margin-right:6px;border-radius:2px;">View on WikiPedia<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-left:6px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
        wikiBtn.style.cssText = 'display:inline-flex;align-items:center;padding:6px 14px;border-radius:8px;background:rgba(26,115,232,0.12);color:var(--text);font-size:0.85em;cursor:pointer;border:1px solid rgba(26,115,232,0.25);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:all .2s;';
        wikiBtn.onmouseenter = () => wikiBtn.style.background = 'rgba(26,115,232,0.2)';
        wikiBtn.onmouseleave = () => wikiBtn.style.background = 'rgba(26,115,232,0.12)';
        wikiBtn.onclick = () => showExternalLinkModal(msg.wikiUrl);
        wikiHeader.appendChild(wikiBtn);
    }
    if (wikiHeader.children.length > 0) {
        div.insertBefore(wikiHeader, div.firstChild);
    }
}

function showMsgStats(div, text, elapsedMs) {
    if (!text) return;
    const tokens = window.tokenizer.tokenizeLikeLLM(text).length;
    const tps = elapsedMs > 0 ? (tokens / (elapsedMs / 1000)).toFixed(1) : "0.0";
    const elapsedStr = elapsedMs >= 1000 ? (elapsedMs / 1000).toFixed(1) + "s" : elapsedMs + "ms";

    const statsDiv = document.createElement("div");
    statsDiv.className = "msg-stats";
    statsDiv.innerHTML = `<span class="stats-icon">⏱</span><span class="stats-value">${tokens} tok · ${elapsedStr} · ${tps} tok/s</span>`;

    const existing = div.querySelector('.msg-stats');
    if (existing) existing.remove();

    const footer = div.querySelector('.message-footer');
    if (footer) {
        footer.appendChild(statsDiv);
    } else {
        const newFooter = document.createElement("div");
        newFooter.className = "message-footer";
        const actions = div.querySelector('.msg-actions');
        if (actions) {
            newFooter.appendChild(actions);
        }
        newFooter.appendChild(statsDiv);
        div.appendChild(newFooter);
    }
}

function appendMessage(text, role, isNew = false, imageUrl = null, footerText = null, messageObj = null) {
  let finalString = (text && typeof text === 'object') ? (text.text || text.message || JSON.stringify(text)) : String(text || "");
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); 
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
  const dayStr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
  const yearStr = now.getFullYear().toString();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-GB');

  let processedText = finalString.replace(/%DATE%/g, dateStr).replace(/%TIME%/g, timeStr)
    .replace(/%DAY%/g, dayStr).replace(/%YEAR%/g, yearStr).replace(/%TOMORROW%/g, tomorrowStr);

  // Parse <|think|> blocks for AI messages to get visibleText (stripped of reasoning)
  const { parts: thinkParts, hasThinking } = role === "ai" ? parseThinkBlocks(processedText) : { parts: [], hasThinking: false };
  let visibleText = processedText;
  let thinkBlocksHtml = '';
  let thinkTexts = [];

  if (hasThinking) {
    const visibleParts = [];
    for (const p of thinkParts) {
      if (p.type === 'think') {
        thinkTexts.push(p.content);
      } else {
        visibleParts.push(p.content);
      }
    }
    visibleText = visibleParts.join('');
    visibleText = visibleText.replace(/<\|think\|>[\s\S]*?<\/\|think\|>/g, '').trim();

    if (thinkTexts.length > 0) {
      thinkBlocksHtml = thinkTexts.map((t, i) => `
        <div class="think-block${showReasoning ? ' think-open' : ''}" data-think-index="${i}">
          <button class="think-toggle" onclick="this.parentElement.classList.toggle('think-open'); event.stopPropagation();">
            <span class="think-label">${i === 0 ? 'Model thinking' : 'Analyzing results'}</span>
            <span class="think-timer"></span>
            <svg class="think-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="think-content">${t}</div>
        </div>`).join('\n');
    }
  }

  const hasMath = /\{\\displaystyle|\$\$/.test(visibleText);
  const hasHTML = /<[a-z][\s\S]*>/i.test(visibleText);
  const hasMarkdown = !hasHTML && typeof hasMarkdownSyntax === 'function' && hasMarkdownSyntax(visibleText);

  // Render Markdown to HTML for display, keep raw for copy
  let displayText = visibleText;
  if (hasMarkdown) {
    displayText = renderMarkdown(visibleText);
  }

  let speechText = visibleText;
  if (hasMarkdown && typeof stripMarkdown === 'function') {
    speechText = stripMarkdown(visibleText);
  }

  const div = document.createElement("div");
  div.className = "message " + role;
  const textSpan = document.createElement("span");
  
  div.appendChild(textSpan);

  if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.style.maxWidth = "200px";
      img.style.borderRadius = "12px";
      img.style.marginTop = "10px";
      img.style.marginBottom = "10px";
      img.style.display = "block";
      div.appendChild(img);
  }

  if (footerText) {
      const footer = document.createElement("div");
      footer.textContent = footerText;
      footer.style.fontSize = "0.85em";
      footer.style.opacity = "0.8";
      div.appendChild(footer);
  }

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "msg-actions";
  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn copy-btn";
  copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  copyBtn.onclick = () => navigator.clipboard.writeText(processedText);
  actionsDiv.appendChild(copyBtn);

  if (imageUrl) {
      const downloadBtn = document.createElement("button");
      downloadBtn.className = "action-btn download-btn";
      downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
      downloadBtn.onclick = async () => {
          try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = `genesis-image-${Date.now()}.png`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
          } catch (err) {
              console.error("Download error:", err);
              window.open(imageUrl, '_blank');
          }
      };
      actionsDiv.appendChild(downloadBtn);
  }

  if (role === "ai") {
    const speakBtn = document.createElement("button");
    speakBtn.className = "action-btn speak-btn";
    speakBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    speakBtn.onclick = () => { if (window.speechSynthesis.speaking) window.speechSynthesis.cancel(); else window.speechSynthesis.speak(new SpeechSynthesisUtterance(speechText)); };
    actionsDiv.appendChild(speakBtn);
 
    if (isNew && window.shouldSpeakResponse) {
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        window.speechSynthesis.speak(utterance);
        window.shouldSpeakResponse = false;
    }

    const existingLatest = chatBox.querySelectorAll('.message.ai.latest');
    existingLatest.forEach(el => el.classList.remove('latest'));
    div.classList.add('latest');
    if (isNew) aiState.currentAiMessage = messageObj;
  }

  div.appendChild(actionsDiv);
  
  // Wrap actions in footer for better layout and static positioning
  const footer = document.createElement("div");
  footer.className = "message-footer";
  
  // Move actionsDiv into footer
  div.removeChild(actionsDiv);
  footer.appendChild(actionsDiv);
  div.appendChild(footer);

  if (role === "ai" && !isNew && messageObj && messageObj.elapsedTime !== undefined) {
      showMsgStats(div, messageObj.text, messageObj.elapsedTime);
  }

  chatBox.append(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (messageObj && messageObj.isWikipedia) {
      renderWikiHeader(div, messageObj);
  }

  if (role === "ai" && isNew) {
    const scheduleReset = () => {
      const capturedId = aiState.currentRequestId;
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          if (!warningInjected && chatBox && window.innerWidth <= 768) {
            chatBox.insertAdjacentHTML('beforeend', warningHtml);
            warningInjected = true;
          }
        }, 50);
      }
      aiState.resetTimeout = setTimeout(() => {
        if (capturedId !== aiState.currentRequestId) return;
        userInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
        userInput.focus();
        aiState.isResponding = false;
        sendBtn.innerHTML = aiState.originalSendIcon;
        updateSendButton();
      }, 1000);
    };

    // Errors/warnings render directly; all AI messages use typewriter
    if (role === "error") {
        textSpan.textContent = visibleText;
        const elapsed = Date.now() - (aiState.responseStartTime || Date.now());
        showMsgStats(div, visibleText, elapsed);
        aiState.currentAiMessage = null;
        scheduleReset();
    } else {
        aiState.firstTokenTime = Date.now();
        const onTextComplete = (fullText) => {
            if (hasMarkdown) {
                textSpan.innerHTML = displayText;
            } else if (hasMath && window.katex) {
                textSpan.textContent = "";
                renderTextWithMath(textSpan, fullText || visibleText);
            }
            const elapsed = Date.now() - aiState.firstTokenTime;
            showMsgStats(div, fullText || visibleText, elapsed);
            aiState.currentAiMessage = null;
            aiState.cancelTyping = null;
            scheduleReset();
        };
        const onScroll = () => {
            chatBox.scrollTop = chatBox.scrollHeight;
        };

        if (hasThinking && thinkBlocksHtml && thinkTexts.length > 0 && showReasoning) {
            // Insert think blocks BEFORE textSpan
            textSpan.insertAdjacentHTML('beforebegin', thinkBlocksHtml);
            const thinkEls = div.querySelectorAll('.think-block');
            const thinkStartTime = Date.now();
            let currentThinkIndex = 0;
            const typeNextThink = () => {
                if (currentThinkIndex >= thinkTexts.length) {
                    // All think blocks typed — show visible text
                    if (messageObj && typeof messageObj._onThinkDone === 'function') {
                        messageObj._onThinkDone((outputText) => {
                            const textToType = outputText || visibleText;
                            const cancelText = window.tokenizer.typewriter(textSpan, textToType, 30, () => {
                                onTextComplete(textToType);
                            }, onScroll);
                            aiState.cancelTyping = cancelText;
                        }, { div, textSpan, thinkEls, thinkStartTime });
                    } else {
                        setTimeout(() => {
                            const cancelText = window.tokenizer.typewriter(textSpan, visibleText, 30, () => {
                                onTextComplete(visibleText);
                            }, onScroll);
                            aiState.cancelTyping = cancelText;
                        }, 400);
                    }
                    return;
                }
                const block = thinkEls[currentThinkIndex];
                const contentEl = block.querySelector('.think-content');
                const labelEl = block.querySelector('.think-label');
                const timerEl = block.querySelector('.think-timer');
                if (labelEl) labelEl.textContent = 'Model is thinking';
                const thinkBlockStart = Date.now();
                const timerInterval = setInterval(() => {
                    if (timerEl) {
                        const elapsed = ((Date.now() - thinkBlockStart) / 1000).toFixed(1);
                        timerEl.textContent = elapsed + 's';
                    }
                }, 100);
                const cancelThink = window.tokenizer.typewriter(contentEl, thinkTexts[currentThinkIndex], 30, () => {
                    clearInterval(timerInterval);
                    const elapsed = ((Date.now() - thinkBlockStart) / 1000).toFixed(1);
                    if (labelEl) labelEl.textContent = currentThinkIndex === 0 ? 'Model thought for' : 'Analysis done';
                    if (timerEl) timerEl.textContent = elapsed + 's';
                    currentThinkIndex++;
                    // If there's a _onThinkDone callback and this is between blocks, call it
                    if (currentThinkIndex < thinkTexts.length && messageObj && typeof messageObj._onThinkDone === 'function') {
                        messageObj._onThinkDone(typeNextThink, { div, textSpan, thinkEls, thinkStartTime, phase: 'between' });
                    } else {
                        typeNextThink();
                    }
                }, onScroll);
                aiState.cancelTyping = cancelThink;
            };
            typeNextThink();
        } else {
            const cancel = window.tokenizer.typewriter(textSpan, visibleText, 30, () => {
                if (thinkBlocksHtml && textSpan.parentNode) {
                    textSpan.insertAdjacentHTML('beforebegin', thinkBlocksHtml);
                }
                onTextComplete(visibleText);
            }, onScroll);
            aiState.cancelTyping = cancel;
        }
    }
  } else { 
      if (hasMarkdown) {
          textSpan.innerHTML = displayText;
      } else if (hasMath && window.katex) {
          renderTextWithMath(textSpan, visibleText);
      } else {
          textSpan[hasHTML ? 'innerHTML' : 'textContent'] = visibleText; 
      }
      // Insert think block for existing messages
      if (thinkBlocksHtml) {
          textSpan.insertAdjacentHTML('beforebegin', thinkBlocksHtml);
      }
  }
}

// --- WIKIPEDIA API ---
async function fetchImageAsDataUrl(url) {
    if (!url) return null;
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

async function fetchPageImage(pageTitle) {
    try {
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
        const res = await fetch(imgUrl, {
            headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        return pages[pageId]?.thumbnail?.source || null;
    } catch {
        return null;
    }
}

async function fetchAnyPageImage(pageTitle) {
    try {
        const origUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
        const origRes = await fetch(origUrl, {
            headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
        });
        if (origRes.ok) {
            const data = await origRes.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const source = pages[pageId]?.original?.source || pages[pageId]?.thumbnail?.source;
            if (source) return source;
        }

        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId === "-1") return null;
        const images = pages[pageId]?.images || [];
        if (images.length === 0) return null;

        let candidates = images.map(img => img.title).filter(t => !/\.svg$/i.test(t) && !/\.(ogg|oga|wav|mp3)$/i.test(t)).slice(0, 5);
        if (candidates.length === 0) {
            candidates = images.map(img => img.title).filter(t => !/\.(ogg|oga|wav|mp3)$/i.test(t)).slice(0, 5);
        }
        if (candidates.length === 0) return null;

        const titles = candidates.join('|');
        const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&titles=${encodeURIComponent(titles)}&iiprop=url&format=json&origin=*`;
        const infoRes = await fetch(infoUrl, {
            headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
        });
        if (!infoRes.ok) return null;
        const infoData = await infoRes.json();
        const infoPages = infoData.query.pages;
        for (const id of Object.keys(infoPages)) {
            const info = infoPages[id]?.imageinfo?.[0]?.url;
            if (info) return info;
        }
        return null;
    } catch {
        return null;
    }
}

async function fetchPageImages(pageTitle, maxImages = 8) {
    try {
        const imgListUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(pageTitle)}&piprop=name&format=json&origin=*`;
        const res = await fetch(imgListUrl, {
            headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const images = pages[pageId]?.images || [];
        if (images.length === 0) return [];

        // Use images that appear in the article content (pageimages returns these by relevance)
        const topImages = images.filter(img => !/\.svg$/i.test(img.title)).slice(0, maxImages);
        if (topImages.length === 0) return [];

        const titles = topImages.map(img => img.title).join('|');
        const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&titles=${encodeURIComponent(titles)}&iiprop=url&iiurlwidth=400&format=json&origin=*`;
        const infoRes = await fetch(infoUrl, {
            headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
        });
        if (!infoRes.ok) return [];
        const infoData = await infoRes.json();
        const infoPages = infoData.query.pages;

        const urls = [];
        for (const id of Object.keys(infoPages)) {
            const info = infoPages[id]?.imageinfo?.[0]?.url;
            if (info && !info.includes('.svg')) urls.push(info);
        }
        return urls;
    } catch {
        return [];
    }
}

async function fetchWikipediaSummary(topic) {
    const questionPrefixes = [
        "how to", "what is", "who is", "where is", "when is", "why is",
        "tell me about", "define", "explain", "what are", "who are",
        "how do i", "how can i", "steps to", "guide for", "tutorial on",
        "method to", "process for", "meaning of", "describe", "summarize",
        "overview of", "details on", "concept of", "basics of",
        "difference between", "compare", "list of", "examples of",
        "pros and cons of", "who was", "where are", "origin of",
        "source of", "background on", "is there a", "whats", "what is a",
        "what is an", "what does", "how does", "how is", "can you",
        "do you know", "have you heard", "what about"
    ];

    let searchTopic = topic.trim();
    for (const prefix of questionPrefixes) {
        const regex = new RegExp('^' + prefix + '\\s*', 'i');
        if (regex.test(searchTopic)) {
            searchTopic = searchTopic.replace(regex, '').trim();
            break;
        }
    }

    searchTopic = searchTopic.replace(/[?.,!;:]+$/g, '').trim();
    if (!searchTopic || searchTopic.length < 2) searchTopic = topic.replace(/[?.,!;:]+$/g, '').trim();

    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTopic)}&srlimit=5&srprop=snippet&format=json&origin=*`;
        const searchRes = await fetch(searchUrl, {
            headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
        });
        if (!searchRes.ok) throw new Error(`Search HTTP ${searchRes.status}`);

        const searchData = await searchRes.json();
        let results = searchData.query?.search;

        if (!results || results.length === 0) {
            const fallbackUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&srlimit=5&srprop=snippet&format=json&origin=*`;
            const fbRes = await fetch(fallbackUrl, {
                headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
            });
            const fbData = await fbRes.json();
            results = fbData.query?.search;
            if (!results || results.length === 0) return null;
        }

        const bestPage = results[0];
        const pageTitle = bestPage.title;
        const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;

        const shortened = (await DB.get("shortenedAnswers")) === "true";

        // Always fetch the page image
        let imageUrl = await fetchPageImage(pageTitle);
        if (!imageUrl) {
            imageUrl = await fetchAnyPageImage(pageTitle);
        }

        let extract;
        if (shortened) {
            // Summary mode: use extracts API with limited chars
            const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=400&explaintext&exlimit=1&exchars=2000&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
            const extRes = await fetch(extractUrl, {
                headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
            });
            if (!extRes.ok) throw new Error(`Extract HTTP ${extRes.status}`);
            const extData = await extRes.json();
            const pages = extData.query.pages;
            const pageId = Object.keys(pages)[0];
            if (pageId === "-1" || pages[pageId].missing || pages[pageId].invalid) return null;
            extract = pages[pageId].extract || '';
            extract = extract.replace(/={2,}[^=]+={2,}\s*/g, '').replace(/\s+/g, ' ').trim();
        } else {
            // Full article mode: use parse API for the complete page content
            try {
                const parseUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&format=json&origin=*`;
                const parseRes = await fetch(parseUrl, {
                    headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
                });
                if (!parseRes.ok) throw new Error(`Parse HTTP ${parseRes.status}`);
                const parseData = await parseRes.json();
                const html = parseData.parse?.text?.['*'];
                if (!html) throw new Error('No HTML content returned');

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Remove navigation, reference, and decorative elements
                const unwanted = doc.querySelectorAll('script, style, .mw-editsection, .reference, ol.references, .navbox, .navbox-styles, .sistertable, .mbox-small, .metadata, .noprint, .sistersitebox, .plainlinks, .mw-empty-elt, .toc, #toc, .thumb, .gallery, .mw-jump-link, .shortdescription, .infobox, table.ambox, .mw-references-wrap, .reflist, .citation, .error, .magnify');
                unwanted.forEach(el => el.remove());

                extract = doc.body.textContent || '';
                extract = extract.replace(/\s+/g, ' ').trim();
            } catch (parseErr) {
                console.warn('Parse API failed, falling back to extracts:', parseErr);
                const fallbackUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&exlimit=1&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
                const fbRes = await fetch(fallbackUrl, {
                    headers: { 'User-Agent': 'GenesisAI/1.0 (wiki@genesis-ai)' }
                });
                const fbData = await fbRes.json();
                const fbPages = fbData.query.pages;
                const fbPageId = Object.keys(fbPages)[0];
                if (fbPageId === "-1" || fbPages[fbPageId].missing || fbPages[fbPageId].invalid) return null;
                extract = fbPages[fbPageId].extract || '';
            }
        }

        // Strip citation brackets: [1], [ 2 ], [a], [ a ], [nb 1], [citation needed], [edit], etc.
        extract = extract.replace(/\s*\[\s*(?:\d+(?:\s*[-\s,]\s*\d+\s*)*|[a-z]|note\s*\d*|nb\s*\d*|lower-alpha|lower-greek|lower-roman)\s*\]|\s*\[(?:citation needed|page needed|dead link|failed verification|verification needed|better source needed|primary source needed|not in citation given|full citation needed|edit|permanent dead link)\]/gi, '');
        // Remove ellipsis (...) from truncated text
        extract = extract.replace(/\u2026|\.{3,}/g, '');
        if (!extract) return null;
        return { text: extract, title: pageTitle, imageUrl, wikiUrl };
    } catch (error) {
        console.error(`Wikipedia failed for '${topic}':`, error);
        return null;
    }
}



// --- LOGIC MODULES ---
let bannedWords = [];
async function loadBannedWords() {
  try {
    const res = await fetch("https://xpdevs.github.io/Genesis-AI/js/banned/words.json?v=" + Date.now());
    if (res.ok) bannedWords = await res.json();
  } catch (err) { console.error("Error loading banned words:", err); }
}
loadBannedWords();

function showInfoModal(title, message) {
    const modal = document.getElementById('infoModal');
    if (!modal) return;
    document.getElementById('infoModalTitle').textContent = title;
    document.getElementById('infoModalMessage').textContent = message;
    modal.style.display = 'flex';
    document.getElementById('infoModalOk').onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function showExternalLinkModal(url) {
    const existing = document.getElementById('externalLinkModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'externalLinkModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2 style="margin: 0 0 10px 0;">Leaving Genesis AI</h2>
            <p style="margin: 0 0 20px 0; line-height: 1.6; opacity: 0.9;">You are about to leave the site. This will open an external website.</p>
            <div class="modal-actions" style="display:flex;gap:12px;justify-content:center;">
                <button id="externalLinkNo" class="confirm" style="background:var(--bg-card,#444);">No</button>
                <button id="externalLinkYes" class="confirm">Yes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.getElementById('externalLinkNo').onclick = () => modal.remove();
    document.getElementById('externalLinkYes').onclick = () => {
        modal.remove();
        window.open(url, '_blank', 'noopener');
    };
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function showWarningModal(message, onDismiss) {
    const existing = document.getElementById('warningModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'warningModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2 style="margin: 0 0 10px 0;">Content Warning</h2>
            <p style="margin: 0 0 20px 0; line-height: 1.6; opacity: 0.9;">${message}</p>
            <div class="modal-actions" style="justify-content: center;">
                <button id="warningModalOk" class="confirm">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.getElementById('warningModalOk').onclick = () => {
        modal.remove();
        if (onDismiss) onDismiss();
    };
}

function violatesRules(text) {
  if (!bannedWords.length) return false;
  if (!window.ContextEngine) {
    const lowerText = text.toLowerCase();
    return bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lowerText));
  }
  const lowerText = text.toLowerCase();
  const hasBanned = bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lowerText));
  if (!hasBanned) return false;
  const verdict = window.ContextEngine.judgeContext(text);
  return verdict.flag;
}

function summariseTitle(text) {
  const words = text.split(" ").slice(0, 4).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function playThinkingSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(1000, t + 0.1);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
}

function typeChatTitle(newTitle, callback) {
  chatTitle.textContent = ""; let i = 0;
  const interval = setInterval(() => {
    chatTitle.textContent += newTitle[i]; i++;
    if (i === newTitle.length) { clearInterval(interval); callback && callback(); }
  }, 70);
}

async function findResponses(input, history) {
  // Decode any hex escape sequences in the input
  const decodedInput = window.tokenizer.decode(input);
  const cleanInput = typeof normalizeInput === 'function' ? normalizeInput(decodedInput) : decodedInput.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();

  // Require model to be loaded for calculator and wiki features
  if (!responses || Object.keys(responses).length === 0) {
    // Still allow basic text matching but return early for features that need a model
  }

  // Calculator Integration — requires a loaded model
  if (responses && Object.keys(responses).length > 0 && typeof window.calc === 'function') {
      // Check for $$...$$ LaTeX math first
      const latexMatch = decodedInput.match(/\$\$([\s\S]*?)\$\$/);
      if (latexMatch && typeof window.solveLatex === 'function') {
          const result = window.solveLatex(latexMatch[1]);
          if (result && result.katex) {
              return { role: "ai", text: `$$ ${result.katex} $$` };
          }
          if (result && result.error) {
              return { role: "ai", text: `Cannot solve: ${result.error}` };
          }
      }
      const mathExpression = (() => {
          const explicitCmd = decodedInput.match(/^(?:calc|calculate|solve|math|compute|evaluate|simplify|find|work\s+out)\s+(.+)/i);
          if (explicitCmd) return explicitCmd[1];
          const whatMatch = decodedInput.match(/^what(?:'s|\s+is)(?:\s+the)?(?:\s+(?:value|result|answer)\s+(?:of|to|for))?\s+(.+)/i);
          if (whatMatch) return whatMatch[1];
          const whatDoesMatch = decodedInput.match(/^what\s+does\s+(.+?)\s+equal\b/i);
          if (whatDoesMatch) return whatDoesMatch[1];
          const cleaned = decodedInput.replace(/^(?:calc|calculate|solve|math)\s*/i, '').trim();
          const isMathLike = /\b(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sqrt|cbrt|log|ln|log2|log10|abs|floor|ceil|round|exp|factorial|fact|nCr|nPr)\s*\(/i.test(cleaned)
              || (/^[\d\s().+\-*/^x,!%]+$/.test(cleaned) && /[\d]/.test(cleaned) && /[-+*/^!]/.test(cleaned))
              || (/\b(pi|e)\b/i.test(cleaned) && cleaned.length < 30);
          if (isMathLike) return cleaned;
          return null;
      })();
      
      if (mathExpression) {
          const result = window.calc(mathExpression);
          if (result && result.katex) {
              return { role: "ai", text: `The answer is:\n\n$$ ${result.katex} $$` };
          }
      }
  }

  // Explicit Wikipedia search commands — requires a loaded model
  if (responses && Object.keys(responses).length > 0) {
  const wikiCmdPatterns = [
      /^(?:search|find|look up)\s+(?:wikipedia|wiki|wkpedia|wp)\s+(?:for\s+)?(.+)/i,
      /^(?:wikipedia|wiki|wkpedia)\s+(?:search\s+)?(?:for\s+)?(.+)/i,
      /^look\s+up\s+(.+)\s+(?:on|in)\s+(?:wikipedia|wiki)/i,
      /^find\s+(.+)\s+(?:on|in)\s+(?:wikipedia|wiki)/i,
      /^(?:image|picture|photo|img)\s+(?:of\s+)?(.+)/i,
      /^search\s+(?:the\s+)?(?:web|internet|online)\s+(?:for\s+)?(.+)/i,
      /^search\s+(?:for\s+)?(.+)/i,
      /^google\s+(.+)/i,
      /^look\s+(?:for\s+)?(.+)/i,
      /^find\s+(?:me\s+)?(?:information|details|data|out|results?)\s+(?:about|on|for|regarding)\s+(.+)/i,
      /^find\s+(?:me\s+)?(.+)/i,
      /^do\s+(?:a\s+)?(?:search|lookup|look-up)\s+(?:for\s+)?(?:me\s+)?(.+)/i,
      /^(?:can\s+you\s+)?(?:search|find|look\s+up|fetch|get)\s+(?:for\s+)?(?:me\s+)?(.+)/i,
      /^tell\s+me\s+(?:about|regarding)\s+(.+)/i,
      /^define\s+(.+)/i,
      /^explain\s+(.+)/i,
      /^describe\s+(.+)/i,
      /^summarize\s+(.+)/i,
      /(.+?)\s+search\s+(?:the\s+)?(?:web|internet|online)\s*$/i
  ];
  for (const pattern of wikiCmdPatterns) {
      const match = decodedInput.match(pattern);
      if (match && match[1] && match[1].trim()) {
          const query = match[1].trim();
          const isImageOnly = /^(?:image|picture|photo|img)/i.test(decodedInput);
          if (!useWikipedia) {
              return { role: "ai", text: "Web search is currently disabled. Please enable it in Settings to let me search the internet for answers. I'll try my best with what I know." };
          }
          const spinnerDiv = document.createElement("div");
          spinnerDiv.className = "message ai wiki-loading";
          spinnerDiv.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px;">
                  <svg viewBox="0 0 24 24" width="24" height="24" style="animation: wikiSpin 1.5s linear infinite; transform-origin: center; flex-shrink: 0;">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
                          <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1.5s" repeatCount="indefinite"/>
                      </circle>
                  </svg>
                  <img src="icon.png" alt="AI" style="width: 24px; height: 24px; border-radius: 4px;">
                  <span style="opacity: 0.7; font-size: 0.9em;">Searching the web</span>
              </div>
          `;
          document.getElementById('chatBox')?.appendChild(spinnerDiv);
          chatBox.scrollTop = chatBox.scrollHeight;

          const wikiResult = await fetchWikipediaSummary(query);
          if (spinnerDiv.parentNode) spinnerDiv.remove();

          if (wikiResult) {
              const { text: cleanText, title: pageTitle, imageUrl, wikiUrl } = wikiResult;
              const shortened = (await DB.get("shortenedAnswers")) === "true";
              let wikiImageDataUrls = [];
              if (!shortened) {
                  const imageUrls = await fetchPageImages(pageTitle);
                  wikiImageDataUrls = (await Promise.all(imageUrls.map(u => fetchImageAsDataUrl(u)))).filter(Boolean);
              }
              const wikiImageDataUrl = await fetchImageAsDataUrl(imageUrl);
              if (isImageOnly) {
                  if (imageUrl) {
                      return { role: "ai", text: "", isWikipedia: true, wikiUrl, wikiImageUrl: imageUrl, wikiImageDataUrl, wikiImageDataUrls, wikiImageOnly: true };
                  }
                  return { role: "ai", text: `No image found on Wikipedia for "${query}".`, isWikipedia: true, wikiUrl, wikiImageDataUrl };
              }
              let summaryText;
              if (!shortened) {
                  summaryText = cleanText;
              } else {
                  const clean = cleanText.replace(/={2,}[^=]+={2,}/g, '').replace(/\s+/g, ' ').trim();
                  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
                  if (sentences.length <= 3) {
                      summaryText = clean;
                  } else {
                      const scored = sentences.map((text, i) => {
                          let score = 0;
                          const c = text.toLowerCase();
                          if (i === 0) score += 10;
                          if (i === 1) score += 3;
                          if (/\d+/.test(text)) score += 3;
                          if (/[A-Z]{2,}/.test(text)) score += 2;
                          const markers = ["is", "was", "are", "were", "known", "famous", "important", "created", "founded", "built", "defined", "refers to", "consists of"];
                          markers.forEach(m => { if (c.includes(m)) score += 2; });
                          return { text: text.trim(), score, index: i };
                      });
                      const topSentences = scored.sort((a, b) => b.score - a.score).slice(0, 8).sort((a, b) => a.index - b.index).map(s => s.text);
                      summaryText = topSentences.join(' ');
                      if (summaryText.length > 1500) summaryText = summaryText.substring(0, 1500).replace(/\s+\S*$/, '') + '.';
                  }
              }
              return { role: "ai", text: `Here's what I found on Wikipedia about ${query}:\n\n${summaryText}`, isWikipedia: true, wikiUrl, wikiImageUrl: imageUrl, wikiImageDataUrl, wikiImageDataUrls };
          }
          return { role: "ai", text: `I couldn't find anything on Wikipedia for "${query}". Try a different search term.` };
      }
  }
  }

  // "Who am I" - Get user's name from userInfo
  const whoAmIPatterns = ["who am i", "who am i?", "who am i?", "what is my name", "do you know me", "what's my name", "whats my name"];
  if (whoAmIPatterns.some(p => cleanInput.includes(p))) {
      const userInfo = await DB.get("userInfo", {});
      const fullName = userInfo.name || "User";
      return { role: "ai", text: `You are ${fullName}.` };
  }

  // "@export" - Export chat as PDF or Markdown
  if (decodedInput.includes("@export")) {
      const isPDF = cleanInput.includes("pdf");
      const isMarkdown = cleanInput.includes("markdown") || cleanInput.includes("md");
      
      const activeChat = chats.find(c => c.id === activeChatId);
      if (!activeChat || activeChat.messages.length === 0) {
          return { role: "ai", text: "No chat to export. Start a conversation first!" };
      }
      
      if (isPDF) {
          exportChatAsPDF(activeChat);
          return { role: "ai", text: "Opening chat in PDF format for printing. Use your browser's Print dialog to save as PDF." };
      } else if (isMarkdown) {
          const md = await exportChatAsMarkdown(activeChat);
          const blob = new Blob([md], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${activeChat.title.replace(/[^a-z0-9]/gi, '_')}.md`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return { role: "ai", text: "Chat exported as Markdown!" };
      }
      // Default to markdown
      const md = await exportChatAsMarkdown(activeChat);
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeChat.title.replace(/[^a-z0-9]/gi, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { role: "ai", text: "Chat exported as Markdown!" };
  }

  const foundMatches = [];
  if (responses) {
    // Small model: direct in-memory object access
    const sortedKeys = Object.keys(responses).sort((a, b) => b.length - a.length);
    let tempInput = cleanInput;
    sortedKeys.forEach(key => {
      const lowerKey = key.toLowerCase();
      let index = tempInput.indexOf(lowerKey);
      while (index !== -1) {
        foundMatches.push({ text: responses[key], index: index });
        tempInput = tempInput.substring(0, index) + ' '.repeat(lowerKey.length) + tempInput.substring(index + lowerKey.length);
        index = tempInput.indexOf(lowerKey);
      }
    });
  } else {
    // Large model: query IndexedDB for each phrase
    const words = cleanInput.split(/\s+/);
    for (let n = 5; n >= 1; n--) {
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        if (phrase.length < 2) continue;
        const val = await DB.getResponse(phrase);
        if (val) {
          foundMatches.push({ text: val, index: cleanInput.indexOf(phrase) });
        }
      }
    }
  }

  if (foundMatches.length === 0) {
    // Fuzzy matching with word-level confidence check (at least 3 words must match)
    const fuzzyKeys = Object.keys(responses).filter(k => !k.startsWith('ver'));
    const fuzzyMatch = findFuzzyMatch(decodedInput, fuzzyKeys);
    const wordConfidence = typeof countWordMatches === 'function' ? countWordMatches(cleanInput) : 0;
    if (fuzzyMatch && wordConfidence >= 3) {
      return { role: "ai", text: removeRepetitions(formatListResponse(fuzzyMatch.text)) };
    }
    // Only attempt Wikipedia if the flag is enabled and a model is loaded
    if (useWikipedia && responses && Object.keys(responses).length > 0) {
        try {
          const prefixes = ["how to", "what is", "who is", "where is", "when is", "why is", "tell me about", "define", "explain", "what are", "who are","how do i", "how can i", "steps to", "guide for", "tutorial on", "method to", "process for","meaning of", "describe", "summarize", "overview of", "details on", "concept of", "basics of","difference between", "compare", "list of", "examples of", "pros and cons of","who was", "where are", "origin of", "source of", "background on", "is there a"];
          const isQuestion = prefixes.some(prefix => cleanInput.startsWith(prefix));

          const modelVer = (responses.ver || "").toLowerCase();
          let allowWiki = true;

          if (modelVer.includes("1.0")) {
              allowWiki = false;
          } else if (modelVer.includes("coder")) {
              const codingTerms = ["code", "coding", "program", "programming", "dev", "developer", "software", "script", "function", "variable", "class", "object", "api", "database", "sql", "html", "css", "javascript", "python", "java", "c++", "c#", "linux", "terminal", "git", "github", "error", "bug", "debug", "compile", "runtime", "framework", "library", "react", "node", "npm", "pip", "docker", "aws", "cloud", "http", "rest", "json", "xml"];
              allowWiki = codingTerms.some(t => cleanInput.includes(t));
          }

          if (isQuestion && allowWiki) {
            const chatBox = document.getElementById('chatBox');
            const spinnerDiv = document.createElement("div");
            spinnerDiv.className = "message ai wiki-loading";
            spinnerDiv.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px;">
                <svg viewBox="0 0 24 24" width="24" height="24" style="animation: wikiSpin 1.5s linear infinite; transform-origin: center; flex-shrink: 0;">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
                    <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <img src="icon.png" alt="AI" style="width: 24px; height: 24px; border-radius: 4px;">
                <span style="opacity: 0.7; font-size: 0.9em;">Searching the web</span>
              </div>
            `;
            if (chatBox) {
              chatBox.appendChild(spinnerDiv);
              chatBox.scrollTop = chatBox.scrollHeight;
            }
            
            const wikiResult = await fetchWikipediaSummary(decodedInput);
            
            // Remove spinner
            if (spinnerDiv.parentNode) spinnerDiv.remove();
            
            if (wikiResult) {
                const { text: cleanText, title: pageTitle, imageUrl, wikiUrl } = wikiResult;
                const shortened = (await DB.get("shortenedAnswers")) === "true";
                let wikiImageDataUrls = [];
                if (!shortened) {
                    const imageUrls = await fetchPageImages(pageTitle);
                    wikiImageDataUrls = (await Promise.all(imageUrls.map(u => fetchImageAsDataUrl(u)))).filter(Boolean);
                }
                const wikiImageDataUrl = await fetchImageAsDataUrl(imageUrl);
                const isUserSummary = cleanInput.includes('summarize') || cleanInput.includes('summary') || cleanInput.includes('summarise');
                
                let summaryText;
                if (!shortened) {
                    summaryText = cleanText;
                } else {
                    const clean = cleanText.replace(/={2,}[^=]+={2,}/g, '').replace(/\s+/g, ' ').trim();
                    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
                    if (sentences.length <= 3) {
                        summaryText = clean;
                    } else {
                        const maxSentences = isUserSummary ? 4 : 8;
                        const scored = sentences.map((text, i) => {
                            let score = 0;
                            const cl = text.toLowerCase();
                            if (i === 0) score += 10;
                            if (i === 1) score += 3;
                            if (/\d+/.test(text)) score += 3;
                            if (/[A-Z]{2,}/.test(text)) score += 2;
                            const markers = ["is", "was", "are", "were", "known", "famous", "important", "created", "founded", "built", "defined", "refers to", "consists of"];
                            markers.forEach(m => { if (cl.includes(m)) score += 2; });
                            return { text: text.trim(), score, index: i };
                        });
                        
                        const topSentences = scored
                            .sort((a, b) => b.score - a.score)
                            .slice(0, maxSentences)
                            .sort((a, b) => a.index - b.index)
                            .map(s => s.text);
                        
                        summaryText = topSentences.join(' ');
                        if (summaryText.length > 1500) summaryText = summaryText.substring(0, 1500).replace(/\s+\S*$/, '') + '.';
                    }
                }
                
                const searchTopic = decodedInput.replace(/^(?:what|who|where|when|why|how|tell me|define|explain|describe|search|find|look up)\s+/i, '').trim().replace(/[?.,!;:]+$/, '').trim();
                return { role: "ai", text: `Here's what I found on Wikipedia about ${searchTopic || decodedInput}:\n\n${summaryText}`, isWikipedia: true, wikiUrl, wikiImageUrl: imageUrl, wikiImageDataUrl, wikiImageDataUrls };
            }
          }
        } catch (e) {
          console.error("Wikipedia fetch failed:", e);
        }
    } else {
        var webSearchOff = true;
    }
    if (webSearchOff) {
        return { role: "ai", text: "Web search is currently disabled. Please enable it in Settings to let me search the internet for answers. I'll try my best with what I know.\n\nI'm not quite sure I follow. Could you give me a bit more detail?" };
    }
    return { role: "ai", text: "I'm not quite sure I follow. Could you give me a bit more detail?" };
  }
  const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
  return { role: "ai", text: mergeMatches(orderedMessages) };
}

async function sendMessage() {
  if (isReadOnlyMode) return;
  if (await isCurrentlyBanned()) { await showBanModal(); return; }

  if (userInput.value.trim() === "") {
    return;
  }

  // If AI is responding, stop generation
  if (aiState.isResponding) {
      stopGeneration();
      return;
  }

  const text = userInput.value.trim();
  if (!text && !currentUploadFile) return;
  
  if (!aiState.originalSendIcon) aiState.originalSendIcon = sendBtn.innerHTML;
  aiState.isResponding = true;
  const requestId = ++aiState.currentRequestId;
  // Change send button to stop square
  sendBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>';
  userInput.value = "";

  const continueSend = async (imgSrc) => {
  // Image Authentication Command
  const lowerText = text.toLowerCase();
  if (text.includes("@ImgAuth") || text.includes("@ImAuth") || (currentUploadFile && /\bis this ai\b/.test(lowerText))) {
      if (!currentUploadFile) {
          appendMessage("Please upload an image first to use @ImgAuth.", "error");
          return;
      }

      userInput.disabled = true; sendBtn.disabled = false; sendBtn.style.opacity = "1";

      if (!activeChatId) {
        const newChat = { id: Date.now().toString(), title: "New Chat", messages: [], lastActive: Date.now() };
        chats.unshift(newChat); activeChatId = newChat.id; await DB.set("activeChatId", activeChatId);
        await saveChats(); renderChatList();
      }

      const chat = chats.find(c => c.id === activeChatId);
      const userMsg = { role: "user", text: text };
      if (imgSrc) userMsg.imageUrl = imgSrc;
      chat.lastActive = Date.now();
      chat.messages.push(userMsg);
      await renderMessages(true); await saveChats();

      if (chat.messages.filter(m => m.role === "user").length === 1) {
        const newTitle = summariseTitle(text);
        typeChatTitle(newTitle, async () => { chat.title = newTitle; await saveChats(); renderChatList(); await updateURL(newTitle); });
      }

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "message ai wiki-loading";
      loadingDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg viewBox="0 0 24 24" width="24" height="24" style="animation: wikiSpin 1.5s linear infinite; transform-origin: center; flex-shrink: 0;">
            <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
              <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <img src="icon.png" alt="AI" style="width: 24px; height: 24px; border-radius: 4px;">
          <span style="opacity: 0.7; font-size: 0.9em;">Scanning image</span>
        </div>
      `;
      chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
      aiState.loadingDiv = loadingDiv;

      const runAuth = () => {
          const startTime = Date.now();
          window.authenticateImage(currentUploadFile).then(async result => {
              if (requestId !== aiState.currentRequestId) return;
              const elapsedTime = Date.now() - startTime;
              const delay = Math.max(0, 3000 - elapsedTime);
              setTimeout(async () => {
                  if (requestId !== aiState.currentRequestId) return;
                  loadingDiv.remove();
                  aiState.loadingDiv = null;
                  const botMsg = { role: "ai", text: result };
                   chat.lastActive = Date.now();
                   chat.messages.push(botMsg);
                   await saveChats();
                   updatePlaceholder();
                   appendMessage(botMsg.text, botMsg.role, true, null, null, botMsg);                  
                  userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; userInput.focus();
                  currentUploadFile = null;
                  if(uploadBtn) uploadBtn.style.color = "";
                  aiState.isResponding = false;
                  sendBtn.innerHTML = aiState.originalSendIcon;
                  updateSendButton(); // Restore button based on input content
              }, delay);
          });
      };

      if (window.authenticateImage) {
          runAuth();
      } else {
          const script = document.createElement('script');
          script.src = "https://xpdevs.github.io/Genesis-AI/js/ImgAuth.js?v=" + Date.now();
          script.onload = runAuth;
          script.onerror = () => {
              if (requestId !== aiState.currentRequestId) return;
              loadingDiv.remove();
              aiState.loadingDiv = null;
              appendMessage("Error loading authentication module.", "error");
              userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1";
              aiState.isResponding = false;
              sendBtn.innerHTML = aiState.originalSendIcon;
              updateSendButton();
          };
          document.head.appendChild(script);
      }
      return;
  }

  // Text Authentication Command
  if (lowerText.startsWith("@txtauth") || lowerText.startsWith("@checktext")) {
      const textToCheck = text.replace(/^@\w+\s*/, '').trim();
      if (!textToCheck) { appendMessage("Please provide text to analyze.", "error"); return; }

      userInput.disabled = true; sendBtn.disabled = false; sendBtn.style.opacity = "1";

      if (!activeChatId) {
        const newChat = { id: Date.now().toString(), title: "New Chat", messages: [], lastActive: Date.now() };
        chats.unshift(newChat); activeChatId = newChat.id; await DB.set("activeChatId", activeChatId);
        await saveChats(); renderChatList();
      }

      const chat = chats.find(c => c.id === activeChatId);
      const userMsg = { role: "user", text: text };
      chat.lastActive = Date.now();
      chat.messages.push(userMsg);
      await renderMessages(true); await saveChats();

      if (chat.messages.filter(m => m.role === "user").length === 1) {
        const newTitle = summariseTitle(text);
        typeChatTitle(newTitle, async () => { chat.title = newTitle; await saveChats(); renderChatList(); await updateURL(newTitle); });
      }

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "message ai wiki-loading";
      loadingDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg viewBox="0 0 24 24" width="24" height="24" style="animation: wikiSpin 1.5s linear infinite; transform-origin: center; flex-shrink: 0;">
            <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
              <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <img src="icon.png" alt="AI" style="width: 24px; height: 24px; border-radius: 4px;">
          <span style="opacity: 0.7; font-size: 0.9em;">Analyzing text</span>
        </div>
      `;
      chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
      aiState.loadingDiv = loadingDiv;

      const runTxtAuth = () => {
          window.authenticateText(textToCheck).then(async result => {
              if (requestId !== aiState.currentRequestId) return;
              loadingDiv.remove();
              aiState.loadingDiv = null;
              const botMsg = { role: "ai", text: result };
               chat.lastActive = Date.now();
               chat.messages.push(botMsg);
               await saveChats();
               updatePlaceholder();
               appendMessage(botMsg.text, botMsg.role, true, null, null, botMsg);              
               userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; userInput.focus();
               aiState.isResponding = false;
               sendBtn.innerHTML = aiState.originalSendIcon;
               updateSendButton();
           });
       };

      if (window.authenticateText) { runTxtAuth(); } 
      else { appendMessage("Text Auth module not loaded.", "error"); loadingDiv.remove(); userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; aiState.isResponding = false; sendBtn.innerHTML = aiState.originalSendIcon; updateSendButton(); }
      return;
  }

  if (await violatesRules(text)) {
    stopGeneration();
    const info = await loadBanInfo(); info.consecutiveViolations = (info.consecutiveViolations || 0) + 1; await saveBanInfo(info);
    if (info.consecutiveViolations >= 5) { await applyBan(); return; }
    const currentChat = activeChatId ? chats.find(c => c.id === activeChatId) : null;
    const isFirstMessage = !currentChat || currentChat.messages.filter(m => m.role === "user").length === 0;
    if (isFirstMessage) {
        showWarningModal('This message violates AI safety and use policies. Please try again.', () => {
            userInput.disabled = false;
            aiState.isResponding = false;
            updateSendButton();
        });
        return;
    }
    showWarningModal('This message violates AI safety and use policies. Please try again.', () => {
        userInput.disabled = false;
        aiState.isResponding = false;
        updateSendButton();
    });
    appendMessage('This message violates AI safety and use policies. Please try again.', 'error');
    userInput.disabled = false;
    aiState.isResponding = false;
    sendBtn.innerHTML = aiState.originalSendIcon;
    updateSendButton();
    return;
  }

  const info = await loadBanInfo(); info.consecutiveViolations = 0; await saveBanInfo(info);
  userInput.disabled = true; sendBtn.disabled = false; sendBtn.style.opacity = "1";

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [], lastActive: Date.now() };
    chats.unshift(newChat); activeChatId = newChat.id; await DB.set("activeChatId", activeChatId);
    await saveChats(); renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  const userMsg = { role: "user", text: text };
  if (imgSrc) userMsg.imageUrl = imgSrc;
  
  chat.lastActive = Date.now();
  chat.messages.push(userMsg);
  await renderMessages(true); await saveChats();

  if (chat.messages.filter(m => m.role === "user").length === 1) {
    const newTitle = summariseTitle(text);
    typeChatTitle(newTitle, async () => { chat.title = newTitle; await saveChats(); renderChatList(); await updateURL(newTitle); });
    const qaSetting = await DB.get("quickActionsEnabled");
    if (qaSetting === "new") {
      await DB.set("quickActionsEnabled", "false");
    }
  }

  const decodedInput = window.tokenizer.decode(text);
  const isCalcQuery = responses && Object.keys(responses).length > 0 && typeof window.calc === 'function' && (() => {
      const isMathLike = (s) => /\b(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sqrt|cbrt|log|ln|log2|log10|abs|floor|ceil|round|exp|factorial|fact|nCr|nPr)\s*\(/i.test(s)
          || (/^[\d\s().+\-*/^x,!%]+$/.test(s) && /[\d]/.test(s) && /[-+*/^!]/.test(s))
          || (/\b(pi|e)\b/i.test(s) && s.length < 30);
      const explicitCmd = decodedInput.match(/^(?:calc|calculate|solve|math|compute|evaluate|simplify|find|work\s+out)\s+(.+)/i);
      if (explicitCmd) return isMathLike(explicitCmd[1]);
      const whatMatch = decodedInput.match(/^what(?:'s|\s+is)(?:\s+the)?(?:\s+(?:value|result|answer)\s+(?:of|to|for))?\s+(.+)/i);
      if (whatMatch) return isMathLike(whatMatch[1].trim());
      const whatDoesMatch = decodedInput.match(/^what\s+does\s+(.+?)\s+equal\b/i);
      if (whatDoesMatch) return isMathLike(whatDoesMatch[1].trim());
      const cleaned = decodedInput.replace(/^(?:calc|calculate|solve|math)\s*/i, '').trim();
      return isMathLike(cleaned);
  })();
  const loadingLabel = isCalcQuery ? "Calculating" : "Thinking";

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message ai wiki-loading";
  loadingDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <svg viewBox="0 0 24 24" width="24" height="24" style="animation: wikiSpin 1.5s linear infinite; transform-origin: center; flex-shrink: 0;">
        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
          <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <img src="icon.png" alt="AI" style="width: 24px; height: 24px; border-radius: 4px;">
      <span style="opacity: 0.7; font-size: 0.9em;">${loadingLabel}</span>
    </div>
  `;
  chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
  aiState.loadingDiv = loadingDiv;

    aiState.responseStartTime = Date.now();
    aiState.thinkingTimeout = setTimeout(async () => {
        if (requestId !== aiState.currentRequestId) return;
        loadingDiv.remove();
        aiState.loadingDiv = null;

        // Auto-detect search intent
        const searchPatterns = /search\s+(the\s+)?(web|internet|online|for|up|about)|look\s+up|look\s+for|find\s+(information|details|data|out|me)\s+(about|on|for|regarding)|what\s+(is|are|was|were|can you tell)\s+.*(about|regarding)|who\s+is|where\s+is|define\s+|tell\s+me\s+(about|regarding)|do\s+a\s+search\s+for|google\s|(?=.*\bsearch\b)(?=.*\b(?:web|internet|online)\b)/i;
        const originalSearchPref = useWikipedia;
        let isSearchQuery = false;
        if (searchPatterns.test(text) && !useWikipedia) {
            useWikipedia = true;
            isSearchQuery = true;
        }
        const botMsg = await findResponses(text, chat.messages);
        useWikipedia = originalSearchPref;

        if (requestId !== aiState.currentRequestId) return;

        // Decode the AI's response before displaying
        if (botMsg && botMsg.text) {
            botMsg.text = window.tokenizer.decode(botMsg.text);
            // Strip unwanted lines (e.g. generic motivational phrases)
            if (typeof removeUnwantedLines === 'function') {
                botMsg.text = removeUnwantedLines(botMsg.text);
            }

            if (botMsg.isWikipedia && window.summariseConversation) {
                const shortened = (await DB.get("shortenedAnswers")) === "true";
                if (shortened) {
                    const sentences = botMsg.text.match(/[^.!?]+[.!?]+/g) || [botMsg.text];
                    const targetSentences = Math.max(1, Math.ceil(sentences.length * 0.4));
                    botMsg.text = window.summariseConversation(botMsg.text, targetSentences);
                }
            }

        }

        // Calculate response stats
        if (botMsg && botMsg.text) {
            const elapsedMs = Date.now() - aiState.responseStartTime;
            const tokens = window.tokenizer.tokenizeLikeLLM(botMsg.text).length;
            const tokPerSec = elapsedMs > 0 ? (tokens / (elapsedMs / 1000)).toFixed(1) : "0.0";
            botMsg.tokenCount = tokens;
            botMsg.elapsedTime = elapsedMs;
            botMsg.tokensPerSecond = tokPerSec;
        }

        // Add to history and then append to UI
        chat.lastActive = Date.now();
        chat.messages.push(botMsg);
        await saveChats();
        updatePlaceholder();
        
        // Pass botMsg so we can track it in aiState.currentAiMessage
        appendMessage(botMsg.text, botMsg.role, true, null, null, botMsg);

    }, 1500);
    
    if (currentUploadFile) { currentUploadFile = null; if(uploadBtn) uploadBtn.style.color = ""; }
  };

  if (currentUploadFile) {
      const reader = new FileReader();
      reader.onload = (e) => continueSend(e.target.result);
      reader.readAsDataURL(currentUploadFile);
  } else { continueSend(null); }
}

// --- DEVELOPER MODE ---
let isCustomModelLoaded = false;

function updateDevModalStatus() {
    if (!devModal || !devModal.style.display || devModal.style.display === 'none') return;
    const vals = getModelDisplayValues();
    devCurrentModalName.textContent = vals.ver;
    devCurrentModalMode.textContent = isCustomModelLoaded ? "Custom (Session)" : "Normal";
    uploadStatus.textContent = "";
}

// This function is kept for compatibility in case it's called from HTML, but password check is removed.
window.devAccess = function(password) {
    console.log("Developer access granted.");
    isDevMode = true;
    if (devModalWaiting) devModalWaiting.style.display = 'none';
    if (devModalOptions) devModalOptions.style.display = 'block';
    updateDevModalStatus();
};

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!devModal) return;
        devModal.style.display = 'flex';
        // Directly grant access without password
        isDevMode = true;
        devModalWaiting.style.display = 'none';
        devModalOptions.style.display = 'block';
        updateDevModalStatus();
    }
});

// --- INITIALIZATION ---
function showShareModal(chatId) {
    if (!shareLinkInput) return;
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.messages.length === 0) {
        shareLinkInput.value = "Cannot share empty chat.";
        shareLinkInput.disabled = true; copyShareLinkBtn.disabled = true; shareModal.style.display = "flex"; return;
    }
    const encoded = encodeChat(chat.messages);
    const shareBaseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    shareLinkInput.value = `${shareBaseUrl}?q=${encoded}`;
    shareLinkInput.disabled = false; copyShareLinkBtn.disabled = false; shareModal.style.display = "flex";
}

if (shareCancel) shareCancel.onclick = () => shareModal.style.display = "none";
if (copyShareLinkBtn) copyShareLinkBtn.onclick = () => {
    shareLinkInput.select(); document.execCommand('copy');
    copyShareLinkBtn.textContent = "Copied!"; setTimeout(() => { copyShareLinkBtn.textContent = "Copy"; shareModal.style.display = "none"; }, 1500);
};

if (devModal) { devModalCancel.onclick = () => devModal.style.display = 'none'; devModalClose.onclick = () => devModal.style.display = 'none'; }
if (renameConfirm) renameConfirm.onclick = async () => {
  const chat = chats.find(c => c.id === currentRenameId);
  if (chat && renameInput.value.trim()) { 
    chat.title = renameInput.value.trim(); 
    await saveChats(); renderChatList(); await renderMessages(); await updateURL(chat.title); 
  }
  renameModal.style.display = "none";
};
if (deleteConfirm) deleteConfirm.onclick = async () => {
    chats = chats.filter(c => c.id !== currentDeleteId);
    if (activeChatId === currentDeleteId) {
        activeChatId = null;
        await DB.delete("activeChatId");
        chatBox.innerHTML = "";
        warningInjected = false;
        let newChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
        if (!newChat) {
            newChat = { id: Date.now().toString(), title: "New Chat", messages: [], lastActive: Date.now() };
            chats.unshift(newChat);
        }
        activeChatId = newChat.id;
        await DB.set("activeChatId", activeChatId);
    }
    await saveChats(); renderChatList(); await renderMessages(); deleteModal.style.display = "none";
};

newChatBtn.onclick = async () => {
  if (isReadOnlyMode) return;
  let existingNewChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
  if (existingNewChat) {
      activeChatId = existingNewChat.id;
  } else {
      const newChat = { id: Date.now().toString(), title: "New Chat", messages: [], lastActive: Date.now() };
      chats.unshift(newChat);
      activeChatId = newChat.id;
  }
  await DB.set("activeChatId", activeChatId);
  await saveChats(); renderChatList(); await renderMessages(); await updateURL("New Chat");
};

if (uploadBtn && imgUploadInput) {
    uploadBtn.onclick = () => imgUploadInput.click();
    imgUploadInput.onchange = (e) => {
        if(e.target.files.length > 0) {
            currentUploadFile = e.target.files[0];
            uploadBtn.style.color = "#00C851";
            userInput.focus();
        }
        // Reset the file input so the same file can be selected again
        e.target.value = '';
    };
}

if (userInput && suggestionBox) {
    userInput.addEventListener('input', () => {
        updateSendButton(); // Update button state on input
        const val = userInput.value;
        if (val.endsWith('@')) {
            suggestionBox.innerHTML = `
                <div class="suggestion-item" onclick="userInput.value += 'ImgAuth '; suggestionBox.style.display='none'; userInput.focus(); updateSendButton();"><span></span> ImgAuth</div>
                <div class="suggestion-item" onclick="userInput.value += 'TxtAuth '; suggestionBox.style.display='none'; userInput.focus(); updateSendButton();"><span></span> Check Text</div>
            `;
            suggestionBox.style.display = 'block';
        } else {
            suggestionBox.style.display = 'none';
        }
    });
    // Hide suggestion box if clicked outside
    document.addEventListener('click', (e) => { if (e.target !== userInput && e.target !== suggestionBox) suggestionBox.style.display = 'none'; });
}

sendBtn.onclick = () => {
    // If AI is responding, always stop first
    if (aiState.isResponding) {
        stopGeneration();
        return;
    }
    const isMobile = window.innerWidth <= 768;
    if (isMobile && userInput.value.trim() === '') {
        userInput.focus();
    } else {
        sendMessage();
    }
};
userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        if (aiState.isResponding) {
            stopGeneration();
        } else {
            sendMessage();
        }
    }
});
settingsBtn.onclick = () => {
    settingsModal.style.display = "flex";
    const vals = getModelDisplayValues();
    document.getElementById("modelNameDisplay").textContent = vals.ver;
    document.getElementById("modelParamsDisplay").textContent = vals.params;
    const statusEl = document.getElementById("customModelStatus");
    if (statusEl) statusEl.innerHTML = "";
};
settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.style.display = "none"; };
if (accountModal) accountModal.onclick = e => { if (e.target === accountModal) accountModal.style.display = "none"; };

if (userIcon) {
    userIcon.onclick = async () => {
        const userInfo = await DB.get("userInfo", {});
        const name = userInfo.name || "User";
        
        if (userInfo.picture) {
            userIcon.textContent = "";
            userIcon.style.background = `url('${userInfo.picture}') center/cover no-repeat`;
        } else {
            userIcon.textContent = name.charAt(0).toUpperCase();
            userIcon.style.background = "linear-gradient(135deg, #007bff, #0056b3)";
        }

        if (accountModal) {
            accountModal.style.display = "flex";
            const currentInfo = await DB.get("userInfo", {});
            const currentName = currentInfo.name || "User";
            const accName = document.getElementById("accountName");
            const accAvatar = document.getElementById("accountAvatar");
            
            if (accName) accName.textContent = currentName;
            
            if (currentInfo.picture && accAvatar) {
                accAvatar.textContent = "";
                accAvatar.style.background = `url('${currentInfo.picture}') center/cover no-repeat`;
            } else if (accAvatar) {
                accAvatar.textContent = currentName.charAt(0).toUpperCase();
                accAvatar.style.background = "linear-gradient(135deg, #007bff, #0056b3)";
            }
            
            const gBtn = document.getElementById("googleSignInContainer");
            if (gBtn) {
                gBtn.style.display = currentInfo.googleId ? "none" : "flex";
            }
        }
    };

    // Initial icon setup
    (async () => {
        const userInfo = await DB.get("userInfo", {});
        const name = userInfo.name || "User";
        if (userInfo.picture) {
            userIcon.textContent = "";
            userIcon.style.background = `url('${userInfo.picture}') center/cover no-repeat`;
        } else {
            userIcon.textContent = name.charAt(0).toUpperCase();
        }
    })();
}

const MODELS = [
  {
    value: "https://base44.app/api/apps/69ff62869abc2f6968205265/files/mp/public/69ff62869abc2f6968205265/8897d4c1d_Genesis-55.json",
    name: "Genesis 5.5",
    desc: "Latest model with improved response quality"
  },
  {
    value: "https://base44.app/api/apps/69ff62869abc2f6968205265/files/mp/public/69ff62869abc2f6968205265/9d01496ae_Genesis-SPT-50.json",
    name: "Genesis SPT 5.0",
    desc: "Previous generation model"
  },
  {
    value: "https://base44.app/api/apps/69ff62869abc2f6968205265/files/mp/public/69ff62869abc2f6968205265/46ab2cf3c_Genesis-SPT-46.json",
    name: "Genesis SPT 4.6",
    desc: "Balanced model for general conversations"
  },
  {
    value: "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json",
    name: "Genesis SPT 1.0 (Legacy)",
    desc: "Original model for simple interactions"
  }
];

function currentModelSupportsThinking() {
  return true;
}

function isModel55(url) {
  return url && url.includes("8897d4c1d_Genesis-55");
}

function getModelDisplayValues() {
  const url = jsonURL || "";
  if (isModel55(url)) {
    return { ver: "Genesis 5.5", params: "525.8K" };
  }
  if (responses) {
    return { ver: responses.ver || "Unknown", params: Object.keys(responses).length };
  }
  return { ver: "Unknown", params: "?" };
}

function getModelInfo(value) {
  return MODELS.find(m => m.value === value) || MODELS[0];
}

function updateModelInfoDisplay() {
  const modelNameDisplay = document.getElementById("modelNameDisplay");
  const modelParamsDisplay = document.getElementById("modelParamsDisplay");
  const vals = getModelDisplayValues();
  if (modelNameDisplay) modelNameDisplay.textContent = vals.ver;
  if (modelParamsDisplay) modelParamsDisplay.textContent = vals.params;
}

function updateThinkingUI() {
  if (reasoningToggleBtn) {
    reasoningToggleBtn.style.display = '';
  }
  const reasoningRow = document.getElementById("reasoningToggle")?.closest('div');
  if (reasoningRow) {
    reasoningRow.style.display = '';
  }
  updateReasoningToggleIcon();
}

function updateReasoningToggleIcon() {
  if (!reasoningToggleBtn) return;
  const svg = reasoningToggleBtn.querySelector('svg');
  if (!svg) return;
  if (showReasoning) {
    svg.setAttribute('fill', '#f59e0b');
    svg.style.stroke = '#f59e0b';
    reasoningToggleBtn.classList.add('active');
  } else {
    svg.setAttribute('fill', 'none');
    svg.style.stroke = '';
    reasoningToggleBtn.classList.remove('active');
  }
}

async function switchModel(value) {
  if (aiState.isResponding) stopGeneration();
  await DB.set("selectedModel", value);
  await loadModel(true);
  updateModelInfoDisplay();
  updateThinkingUI();
}

// Secret function: wipes all cached models, then downloads and caches the latest model only
window.Full = window.Full || {};
const LEGACY_MODEL = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json";
window.Full.FormatRemoveModels = async function() {
  if (aiState.isResponding) stopGeneration();

  // Step 1: Clear all cached models and responses
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB.dbName, DB.dbVersion);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const tx = db.transaction([DB.modelStore, DB.responsesStore], "readwrite");
  tx.objectStore(DB.modelStore).clear();
  tx.objectStore(DB.responsesStore).clear();
  await new Promise(r => tx.oncomplete = r);
  db.close();

  // Step 2: Download and cache the legacy model (1.0)
  await DB.set("selectedModel", LEGACY_MODEL);
  await loadModel(true);

  // Step 3: Download and cache the latest model
  await DB.set("selectedModel", defaultModel);
  await loadModel(true);

  updateModelInfoDisplay();
};

// Settings modal model select
if (modelSelect) {
    if (!modelSelect.querySelector('option[value="custom"]')) {
        const customOption = document.createElement('option');
        customOption.value = "custom";
        customOption.textContent = "Load from file...";
        modelSelect.appendChild(customOption);
    }
    if (!modelSelect.querySelector('option[value="upload-custom"]')) {
        const uploadCustomOption = document.createElement('option');
        uploadCustomOption.value = "upload-custom";
        uploadCustomOption.textContent = "Upload Custom...";
        modelSelect.appendChild(uploadCustomOption);
    }

    (async () => {
        modelSelect.value = await DB.get("selectedModel", defaultModel);
    })();

    modelSelect.onchange = async () => {
        const selectedValue = modelSelect.value;
        const currentModel = await DB.get("selectedModel", defaultModel);
        if (selectedValue === "custom") {
            if (customModelInput) customModelInput.click();
            setTimeout(() => { modelSelect.value = currentModel; }, 100);
        } else if (selectedValue === "upload-custom") {
            if (customModelConfirmModal) {
                customModelConfirmModal.style.display = 'flex';
            }
            setTimeout(() => { modelSelect.value = currentModel; }, 100);
        } else if (selectedValue !== currentModel) {
            // Sync desktop dropdown if visible
            if (window.innerWidth > 768) {
                const info = getModelInfo(selectedValue);
                const nameEl = document.getElementById("modelSelectName");
                const descEl = document.getElementById("modelSelectDesc");
                if (nameEl) nameEl.textContent = info.name;
                if (descEl) descEl.textContent = info.desc;
                const dd = document.getElementById("modelSelectDropdown");
                if (dd) dd.querySelectorAll(".model-dropdown-option").forEach(o => o.classList.toggle("active", o.dataset.value === selectedValue));
            }
            await switchModel(selectedValue);
        }
    };
}

// On desktop, hide the AI Modal row in settings; on mobile leave it
const isDesktop = window.innerWidth > 768;
if (isDesktop) {
    const aiModalRow = modelSelect ? modelSelect.closest('div') : null;
    if (aiModalRow) aiModalRow.style.display = 'none';
}

// Desktop rich dropdown
if (headerModelSelect) {
  const trigger = document.getElementById("modelSelectTrigger");
  const dropdown = document.getElementById("modelSelectDropdown");
  const nameEl = document.getElementById("modelSelectName");
  const descEl = document.getElementById("modelSelectDesc");

  dropdown.innerHTML = MODELS.map(m => `
    <button class="model-dropdown-option" data-value="${m.value}">
      <span class="model-option-name">${m.name}</span>
      <span class="model-option-desc">${m.desc}</span>
    </button>
  `).join("") + `
    <div class="model-dropdown-divider"></div>
    <button class="model-dropdown-option" data-value="custom">
      <span class="model-option-name">Load from file...</span>
      <span class="model-option-desc">Upload a custom .json model file</span>
    </button>
    <button class="model-dropdown-option" data-value="upload-custom">
      <span class="model-option-name">Upload Custom</span>
      <span class="model-option-desc">Upload file or paste URL to preview model info</span>
    </button>`;

  (async () => {
    const saved = await DB.get("selectedModel", defaultModel);
    const info = getModelInfo(saved);
    nameEl.textContent = info.name;
    descEl.textContent = info.desc;
    dropdown.querySelectorAll(".model-dropdown-option").forEach(opt => {
      opt.classList.toggle("active", opt.dataset.value === saved);
    });
  })();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    headerModelSelect.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!headerModelSelect.contains(e.target)) {
      headerModelSelect.classList.remove("open");
    }
  });

  dropdown.addEventListener("click", async (e) => {
    const option = e.target.closest(".model-dropdown-option");
    if (!option) return;

    const value = option.dataset.value;

    if (value === "custom") {
      headerModelSelect.classList.remove("open");
      if (customModelInput) customModelInput.click();
      return;
    }

    if (value === "upload-custom") {
      headerModelSelect.classList.remove("open");
      if (customModelConfirmModal) {
        customModelConfirmModal.style.display = 'flex';
      }
      return;
    }

    const currentModel = await DB.get("selectedModel", defaultModel);
    if (value === currentModel) {
      headerModelSelect.classList.remove("open");
      return;
    }

    const info = getModelInfo(value);
    nameEl.textContent = info.name;
    descEl.textContent = info.desc;
    dropdown.querySelectorAll(".model-dropdown-option").forEach(opt => {
      opt.classList.toggle("active", opt.dataset.value === value);
    });
    headerModelSelect.classList.remove("open");

    if (modelSelect) modelSelect.value = value;
    await switchModel(value);
  });
}

// Keep refreshWarningModal handlers for potential external use
document.getElementById("refreshConfirm").onclick = async () => {
    document.getElementById("refreshWarningModal").style.display = "none";
};
document.getElementById("refreshCancel").onclick = async () => {
    document.getElementById("refreshWarningModal").style.display = "none";
};
const redownloadModelBtn = document.getElementById("redownloadModelBtn");
if (redownloadModelBtn) {
    redownloadModelBtn.onclick = async () => {
        const currentModel = modelSelect ? modelSelect.value : await DB.get("selectedModel", defaultModel);
        await loadModel(true);
        const vals = getModelDisplayValues();
        const modelNameDisplay = document.getElementById("modelNameDisplay");
        const modelParamsDisplay = document.getElementById("modelParamsDisplay");
        if (modelNameDisplay) modelNameDisplay.textContent = vals.ver;
        if (modelParamsDisplay) modelParamsDisplay.textContent = vals.params;
        showInfoModal("Success", "Model re-downloaded successfully!");
    };
}

async function applyTheme() {
    // Default to auto if not set, unless legacy theme exists
    if (await DB.get("autoTheme") === null) {
        const legacyTheme = await DB.get("theme");
        await DB.set("autoTheme", legacyTheme === null ? "true" : "false");
    }
    
    const isAuto = (await DB.get("autoTheme")) === "true";
    if (autoThemeToggle) autoThemeToggle.checked = isAuto;
    
    if (themeToggle) {
        themeToggle.disabled = isAuto;
        themeToggle.parentElement.style.opacity = isAuto ? "0.5" : "1";
    }

    const shortenedAnswersToggle = document.getElementById("shortenedAnswersToggle");
    if (shortenedAnswersToggle) {
        const shortenedEnabled = (await DB.get("shortenedAnswers")) === "true";
        shortenedAnswersToggle.checked = shortenedEnabled;
    }

    let isDark;
    if (isAuto) {
        const hour = new Date().getHours();
        isDark = (hour < 10 || hour >= 17);
    } else {
        isDark = (await DB.get("theme")) === "dark";
    }
    
    if (themeToggle) themeToggle.checked = isDark;
    document.body.classList.toggle("dark", isDark);
}

applyTheme();
if (autoThemeToggle) autoThemeToggle.onchange = async () => { 
    await DB.set("autoTheme", autoThemeToggle.checked ? "true" : "false"); 
    if (!autoThemeToggle.checked) await DB.set("theme", themeToggle.checked ? "dark" : "light"); 
    await applyTheme(); 
};
if (themeToggle) themeToggle.onchange = async () => { 
    document.body.classList.toggle("dark", themeToggle.checked); 
    await DB.set("theme", themeToggle.checked ? "dark" : "light"); 
};

const deleteAllBtn = document.getElementById("deleteAllChatsBtn");
if (deleteAllBtn) {
    deleteAllBtn.onclick = () => document.getElementById("deleteAllModal").style.display = "flex";
}
document.getElementById("deleteAllCancel").onclick = () => document.getElementById("deleteAllModal").style.display = "none";
document.getElementById("deleteAllConfirm").onclick = async () => { 
    chats = []; 
    await DB.delete("chats"); 
    await DB.delete("activeChatId"); 
    activeChatId = null; 
    renderChatList(); 
    chatBox.innerHTML = ""; 
    warningInjected = false;
    document.getElementById("deleteAllModal").style.display = "none"; 
};

const exportDataBtn = document.getElementById("exportDataBtn");
const importExportModal = document.getElementById("importExportModal");

if (exportDataBtn && importExportModal) {
    exportDataBtn.onclick = () => {
        document.getElementById("accountModal").style.display = "none";
        importExportModal.style.display = "flex";
    };
}

// --- Export Option ---
document.getElementById("exportOptionBtn").onclick = async () => {
    const userInfo = await DB.get("userInfo", {});
    const banInfo = await DB.get("genesisBanInfo", {});
    
    const data = {
        exportDate: new Date().toISOString(),
        source: "genesis-ai",
        version: 1,
        user: {
            name: userInfo.name || null,
            email: userInfo.email || null,
            googleId: userInfo.googleId || null,
            picture: userInfo.picture || null
        },
        stats: {
            totalChats: chats.length,
            totalWarnings: banInfo.consecutiveViolations || 0,
            banHistoryCount: banInfo.banHistoryCount || 0
        },
        chats: chats
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    importExportModal.style.display = "none";
};

// --- Import Functionality ---
async function importAccountData(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        let importedChats = [];
        let importedUserInfo = null;
        
        if (data.source === "genesis-ai" || (data.chats && Array.isArray(data.chats))) {
            importedChats = data.chats || [];
            importedUserInfo = data.user || null;
        } else {
            const { chats: xChats, user: xUser, conversations } = extractExternalChats(data);
            importedChats = xChats;
            importedUserInfo = xUser;
            if (conversations && conversations.length > importedChats.length) {
                importedChats = conversations;
            }
        }
        
        if (!importedChats.length && !importedUserInfo) {
            throw new Error("No recognizable chat data found in this file.");
        }
        
        const existingIds = new Set(chats.map(c => c.id));
        let addedCount = 0;
        
        for (const chat of importedChats) {
            if (!chat.id) {
                chat.id = "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
            }
            if (!existingIds.has(chat.id)) {
                if (!chat.title) chat.title = "Imported Chat";
                if (!chat.messages) chat.messages = [];
                chats.push(chat);
                existingIds.add(chat.id);
                addedCount++;
            }
        }
        
        await saveChats();
        
        if (importedUserInfo && importedUserInfo.name && !(await DB.get("userInfo", {})).name) {
            await DB.set("userInfo", importedUserInfo);
        }
        
        renderChatList();
        
        showInfoModal(
            "Import Complete",
            addedCount > 0
                ? `Successfully imported ${addedCount} chat${addedCount > 1 ? 's' : ''}!${importedUserInfo && importedUserInfo.name ? ' User profile was also restored.' : ''}`
                : "No new chats were imported (they may already exist in your account)."
        );
    } catch (e) {
        showInfoModal("Import Failed", e.message + " Please make sure you selected a valid export file.");
    }
}

function extractExternalChats(data) {
    const chats = [];
    let user = null;
    
    let messages = data.messages || data.history || data.conversations || [];
    
    if (data.title || data.name) {
        const title = data.title || data.name || "Imported Chat";
        const msgs = Array.isArray(data.messages) ? data.messages
                  : Array.isArray(data.history) ? data.history
                  : Array.isArray(data.conversations) ? data.conversations
                  : [];
        if (msgs.length) {
            chats.push({ id: "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), title, messages: msgs.map(normalizeMessage) });
            return { chats, user };
        }
    }
    
    if (Array.isArray(data)) {
        for (const item of data) {
            if (item.messages || item.history || item.conversations) {
                const title = item.title || item.name || "Imported Chat";
                const msgs = item.messages || item.history || item.conversations || [];
                chats.push({ id: "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), title, messages: msgs.map(normalizeMessage) });
            }
        }
    }
    
    if (data.user || data.userInfo || data.profile) {
        user = data.user || data.userInfo || data.profile;
    }
    
    return { chats, user };
}

function normalizeMessage(msg) {
    if (typeof msg === "string") {
        return { role: msg.startsWith("http") || msg.startsWith("!") ? "ai" : "user", text: msg };
    }
    const text = msg.text || msg.content || msg.message || "";
    let role = msg.role || msg.from || msg.sender || "user";
    role = role.toLowerCase();
    if (role === "assistant" || role === "bot" || role === "ai" || role === "model" || role === "genesis") role = "ai";
    if (role === "human" || role === "me") role = "user";
    return { role, text };
}

const importOptionBtn = document.getElementById("importOptionBtn");
const importFileInput = document.getElementById("importFileInput");
if (importOptionBtn && importFileInput) {
    importOptionBtn.onclick = () => importFileInput.click();
    importFileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        importOptionBtn.textContent = "Importing...";
        importOptionBtn.style.opacity = "0.6";
        importOptionBtn.disabled = true;
        await importAccountData(file);
        importFileInput.value = "";
        importOptionBtn.textContent = "Import Data";
        importOptionBtn.style.opacity = "1";
        importOptionBtn.disabled = false;
        importExportModal.style.display = "none";
    };
}

const deleteAccountBtn = document.getElementById("deleteAccountBtn");
if (deleteAccountBtn) {
    deleteAccountBtn.onclick = () => {
        if (accountModal) accountModal.style.display = "none";
        document.getElementById("deleteAccountModal").style.display = "flex";
        const list = document.getElementById("deleteAccountList");
        if (list) {
            const count = chats.length;
            list.innerHTML = `<li>All chat history (${count} chat${count === 1 ? '' : 's'})</li>
        <li>Your saved name</li>
        <li>Agreement to Terms & Privacy Policy</li>`;
        }
    };
}
document.getElementById("deleteAccountCancel").onclick = () => document.getElementById("deleteAccountModal").style.display = "none";
document.getElementById("deleteAccountConfirm").onclick = async () => { 
    if (window.google && window.google.accounts) google.accounts.id.disableAutoSelect();
    await DB.clear();
    localStorage.clear(); 
    window.location.reload(); 
};

// --- Account Management & Google Sign-In ---

async function updateUserProfile(newName, newPicture) {
    const userInfo = await DB.get("userInfo", {});
    userInfo.name = newName;
    if (newPicture) userInfo.picture = newPicture;
    await DB.set("userInfo", userInfo);
    
    const initial = newName.charAt(0).toUpperCase();
    
    const accName = document.getElementById("accountName");
    const accAvatar = document.getElementById("accountAvatar");
    const userIcon = document.getElementById("userIcon");
    
    if (accName) accName.textContent = newName;
    
    const updateEl = (el) => {
        if (!el) return;
        if (userInfo.picture) {
            el.textContent = "";
            el.style.background = `url('${userInfo.picture}') center/cover no-repeat`;
        } else {
            el.textContent = initial;
            el.style.background = "linear-gradient(135deg, #007bff, #0056b3)";
        }
    };
    updateEl(accAvatar);
    updateEl(userIcon);
}

const editNameBtn = document.getElementById("editNameBtn");
if (editNameBtn) {
    editNameBtn.onclick = async () => {
        const userInfo = await DB.get("userInfo", {});
        const currentName = userInfo.name || "User";
        document.getElementById('editNameInput').value = currentName;
        document.getElementById('editNameModal').style.display = 'flex';
    };
}

const editNameCancel = document.getElementById('editNameCancel');
const editNameConfirm = document.getElementById('editNameConfirm');
const editNameInput = document.getElementById('editNameInput');
if (editNameCancel) editNameCancel.onclick = () => { document.getElementById('editNameModal').style.display = 'none'; };
if (editNameConfirm) editNameConfirm.onclick = async () => {
    const newName = editNameInput ? editNameInput.value.trim() : '';
    if (newName) {
        await updateUserProfile(newName);
    }
    document.getElementById('editNameModal').style.display = 'none';
};
if (editNameInput) editNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && editNameConfirm) editNameConfirm.click();
});

// --- PFP Change Modal ---
const pfpModal = document.getElementById('pfpModal');
const pfpUploadInput = document.getElementById('pfpUploadInput');
const pfpUploadBtn = document.getElementById('pfpUploadBtn');
const pfpRemoveBtn = document.getElementById('pfpRemoveBtn');
const pfpGoogleBtn = document.getElementById('pfpGoogleBtn');
const pfpCancel = document.getElementById('pfpCancel');
const pfpPreview = document.getElementById('pfpPreview');
const pfpRemoveContainer = document.getElementById('pfpRemoveContainer');
const pfpGoogleContainer = document.getElementById('pfpGoogleContainer');

function updatePfpPreview() {
    const userInfo = DB.get("userInfo", {});
    userInfo.then(info => {
        const name = info.name || "User";
        const initial = name.charAt(0).toUpperCase();
        if (info.picture && pfpPreview) {
            pfpPreview.textContent = "";
            pfpPreview.style.background = `url('${info.picture}') center/cover no-repeat`;
        } else if (pfpPreview) {
            pfpPreview.textContent = initial;
            pfpPreview.style.background = "linear-gradient(135deg, #007bff, #0056b3)";
        }
        if (pfpRemoveContainer) pfpRemoveContainer.style.display = info.picture ? 'block' : 'none';
        if (pfpGoogleContainer) pfpGoogleContainer.style.display = info.googleId ? 'block' : 'none';
    });
}

// Click avatar in account modal -> open PFP modal
const accAvatar = document.getElementById('accountAvatar');
if (accAvatar) {
    accAvatar.addEventListener('click', async () => {
        const userInfo = await DB.get("userInfo", {});
        const name = userInfo.name || "User";
        const initial = name.charAt(0).toUpperCase();
        if (pfpPreview) {
            if (userInfo.picture) {
                pfpPreview.textContent = "";
                pfpPreview.style.background = `url('${userInfo.picture}') center/cover no-repeat`;
            } else {
                pfpPreview.textContent = initial;
                pfpPreview.style.background = "linear-gradient(135deg, #007bff, #0056b3)";
            }
        }
        if (pfpRemoveContainer) pfpRemoveContainer.style.display = userInfo.picture ? 'block' : 'none';
        if (pfpGoogleContainer) pfpGoogleContainer.style.display = userInfo.googleId ? 'block' : 'none';
        if (pfpModal) pfpModal.style.display = 'flex';
    });
}

if (pfpCancel) pfpCancel.onclick = () => { if (pfpModal) pfpModal.style.display = 'none'; };
if (pfpModal) pfpModal.onclick = (e) => { if (e.target === pfpModal) pfpModal.style.display = 'none'; };

if (pfpUploadBtn && pfpUploadInput) {
    pfpUploadBtn.onclick = () => pfpUploadInput.click();
    pfpUploadInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const dataUrl = ev.target.result;
            await updateUserProfile((await DB.get("userInfo", {})).name || "User", dataUrl);
            updatePfpPreview();
            if (pfpModal) pfpModal.style.display = 'none';
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };
}

if (pfpRemoveBtn) {
    pfpRemoveBtn.onclick = async () => {
        const userInfo = await DB.get("userInfo", {});
        delete userInfo.picture;
        await DB.set("userInfo", userInfo);
        await updateUserProfile(userInfo.name || "User");
        updatePfpPreview();
        if (pfpModal) pfpModal.style.display = 'none';
    };
}

if (pfpGoogleBtn) {
    pfpGoogleBtn.onclick = async () => {
        const userInfo = await DB.get("userInfo", {});
        if (userInfo.googleId && userInfo.picture) {
            await updateUserProfile(userInfo.name || "User", userInfo.picture);
            updatePfpPreview();
            if (pfpModal) pfpModal.style.display = 'none';
        }
    };
}

// PFP URL input
const pfpUrlInput = document.getElementById('pfpUrlInput');
if (pfpUrlInput) {
    pfpUrlInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const url = pfpUrlInput.value.trim();
            if (!url) return;
            await updateUserProfile((await DB.get("userInfo", {})).name || "User", url);
            updatePfpPreview();
            if (pfpModal) pfpModal.style.display = 'none';
            pfpUrlInput.value = '';
        }
    });
}

// --- Custom Model Confirmation Modal ---
const customModelConfirmModal = document.getElementById('customModelConfirmModal');
const customModelConfirmInput = document.getElementById('customModelConfirmInput');
const customModelUrlInput = document.getElementById('customModelUrlInput');
const customModelConfirmOk = document.getElementById('customModelConfirmOk');
const customModelConfirmCancel = document.getElementById('customModelConfirmCancel');
const customModelConfirmStatus = document.getElementById('customModelConfirmStatus');
const customModelConfirmName = document.getElementById('customModelConfirmName');
const customModelConfirmParams = document.getElementById('customModelConfirmParams');
const customModelConfirmReasoning = document.getElementById('customModelConfirmReasoning');
const customModelConfirmWebSearch = document.getElementById('customModelConfirmWebSearch');

let pendingModelData = null;

function showModelConfirmModal(modelData, source) {
    const ver = modelData.ver || "Unknown Model";
    const params = Object.keys(modelData).length;

    customModelConfirmName.textContent = ver;
    customModelConfirmParams.textContent = params;

    const hasReasoning = Object.values(modelData).some(v =>
        typeof v === 'string' && (v.includes('<|think|>') || v.includes('</|think|>'))
    );
    customModelConfirmReasoning.innerHTML = hasReasoning
        ? 'Reasoning: <span style="color: var(--green, #22c55e);">&#10003; Supported</span>'
        : 'Reasoning: <span style="opacity: 0.5;">Not detected</span>';

    customModelConfirmWebSearch.innerHTML = 'Web Search: <span style="color: var(--green, #22c55e);">&#10003; Available</span>';

    customModelConfirmStatus.textContent = '';
    pendingModelData = modelData;
    customModelConfirmModal.style.display = 'flex';
}

function applyPendingModel() {
    if (!pendingModelData) return;
    responses = pendingModelData;
    isCustomModelLoaded = true;
    const vals = getModelDisplayValues();
    if (document.getElementById("modelNameDisplay")) {
        document.getElementById("modelNameDisplay").textContent = vals.ver;
    }
    if (document.getElementById("modelParamsDisplay")) {
        document.getElementById("modelParamsDisplay").textContent = vals.params;
    }
    if (isDevMode) updateDevModalStatus();
    const nameEl = document.getElementById("modelSelectName");
    const descEl = document.getElementById("modelSelectDesc");
    const fileName = pendingModelData.ver || "Custom Model";
    if (nameEl) nameEl.textContent = fileName;
    if (descEl) descEl.textContent = "Custom session model";
    const dd = document.getElementById("modelSelectDropdown");
    if (dd) dd.querySelectorAll(".model-dropdown-option").forEach(o => o.classList.remove("active"));
    customModelConfirmModal.style.display = 'none';
    customModelConfirmStatus.textContent = `Loaded "${fileName}" successfully.`;
    pendingModelData = null;
    if (customModelUrlInput) customModelUrlInput.value = '';
}

if (customModelConfirmCancel) {
    customModelConfirmCancel.onclick = () => {
        customModelConfirmModal.style.display = 'none';
        pendingModelData = null;
    };
}

if (customModelConfirmModal) {
    customModelConfirmModal.onclick = (e) => {
        if (e.target === customModelConfirmModal) {
            customModelConfirmModal.style.display = 'none';
            pendingModelData = null;
        }
    };
}

if (customModelConfirmOk) {
    customModelConfirmOk.onclick = applyPendingModel;
}

// File upload in confirmation modal
if (customModelConfirmInput) {
    customModelConfirmInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const statusEl = customModelConfirmStatus;
        statusEl.textContent = `Reading ${file.name}...`;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const rawText = new TextDecoder().decode(ev.target.result).trim();
                const modelData = JSON.parse(rawText);
                if (typeof modelData !== 'object' || modelData === null) {
                    throw new Error("Invalid model file.");
                }
                showModelConfirmModal(modelData, 'file');
                statusEl.textContent = '';
            } catch (err) {
                statusEl.textContent = `Error: ${err.message}`;
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    });
}

// URL input in confirmation modal
if (customModelUrlInput) {
    let urlTimeout = null;
    customModelUrlInput.addEventListener('input', () => {
        clearTimeout(urlTimeout);
        urlTimeout = setTimeout(async () => {
            const url = customModelUrlInput.value.trim();
            if (!url || !url.startsWith('http')) return;
            customModelConfirmStatus.textContent = 'Fetching model...';
            try {
                const r = await fetch(url);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const rawText = await r.text();
                const modelData = JSON.parse(rawText);
                if (typeof modelData !== 'object' || modelData === null) {
                    throw new Error("Invalid model format.");
                }
                showModelConfirmModal(modelData, 'url');
                customModelConfirmStatus.textContent = '';
            } catch (err) {
                customModelConfirmStatus.textContent = `Error: ${err.message}`;
            }
        }, 600);
    });
}

// Also hook into the original customModelInput file picker (for settings modal "Load from file...")
if (customModelInput) {
    customModelInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const rawText = new TextDecoder().decode(ev.target.result).trim();
                const modelData = JSON.parse(rawText);
                if (typeof modelData !== 'object' || modelData === null) {
                    throw new Error("Invalid model file.");
                }
                showModelConfirmModal(modelData, 'file');
            } catch (err) {
                const statusEl = document.getElementById("customModelStatus") || document.getElementById("uploadStatus");
                if (statusEl) statusEl.textContent = `Error: ${err.message}`;
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    });
}

window.handleGoogleCredentialResponse = async function(response) {
    try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        if (payload.name) {
            const userInfo = await DB.get("userInfo", {});
            userInfo.googleId = payload.sub;
            await DB.set("userInfo", userInfo);
            
            await updateUserProfile(payload.name, payload.picture);
            
            const container = document.getElementById("googleSignInContainer");
            if (container) container.style.display = "none";
        }
    } catch (e) { console.error("Error parsing Google credential", e); }
}

async function initGoogleSignIn() {
    const container = document.getElementById("googleSignInContainer");
    const userInfo = await DB.get("userInfo", {});
    
    if (userInfo.googleId && container) {
        container.style.display = "none";
        return;
    }

    if (window.google && container) {
        google.accounts.id.initialize({
            client_id: "243159738325-feq9jnd1sulm3tdpq7nq1b2vtoltu6r3.apps.googleusercontent.com",
            callback: window.handleGoogleCredentialResponse
        });
        google.accounts.id.renderButton(container, { theme: "outline", size: "large" });
    } else if (container) { setTimeout(initGoogleSignIn, 500); }
}

async function startApp() {
    if (await isCurrentlyBanned()) {
        await showBanModal();
        return;
    }
    
    await loadModel();

    if (loadSharedChat()) return;

    chats = await DB.get("chats", []);
    activeChatId = await DB.get("activeChatId");

    const urlParams = new URLSearchParams(window.location.search);
    const chatCode = urlParams.get("c");
    if (chatCode) {
        const chatByCode = chats.find(c => c.urlCode === chatCode);
        if (chatByCode) {
            activeChatId = chatByCode.id;
            await DB.set("activeChatId", activeChatId);
        }
    }

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        // Desktop: Always start with a New Chat
        let newChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
        if (!newChat) {
            newChat = { id: Date.now().toString(), title: "New Chat", messages: [], lastActive: Date.now() };
            chats.unshift(newChat);
            await saveChats();
        }
        activeChatId = newChat.id;
        await DB.set("activeChatId", activeChatId);
    } else {
        // Mobile: Always start with a New Chat (same as desktop)
        let newChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
        if (!newChat) {
            newChat = { id: Date.now().toString(), title: "New Chat", messages: [], lastActive: Date.now() };
            chats.unshift(newChat);
            await saveChats();
        }
        activeChatId = newChat.id;
        await DB.set("activeChatId", activeChatId);
    }
    renderChatList();
    await renderMessages();

    // Load web search preference from settings
    useWikipedia = await DB.get("useWikipedia", false);
    const webSearchToggle = document.getElementById("webSearchToggle");
    if (webSearchToggle) {
        webSearchToggle.checked = useWikipedia;
        webSearchToggle.onchange = async () => {
            useWikipedia = webSearchToggle.checked;
            await DB.set("useWikipedia", useWikipedia);
        };
    }

    // Reasoning (lightbulb) toggle and settings sync
    const reasoningToggle = document.getElementById("reasoningToggle");
    const savedReasoning = await DB.get("showReasoning", false);
    showReasoning = savedReasoning;
    if (reasoningToggle) reasoningToggle.checked = savedReasoning;
    updateReasoningToggleIcon();

    const syncReasoning = (val) => {
      showReasoning = val;
      if (reasoningToggle) reasoningToggle.checked = val;
      if (reasoningToggleBtn) {
        if (val) reasoningToggleBtn.classList.add('active');
        else reasoningToggleBtn.classList.remove('active');
      }
      updateReasoningToggleIcon();
      DB.set("showReasoning", val);
    };

    if (reasoningToggleBtn) {
      reasoningToggleBtn.onclick = () => {
        syncReasoning(!showReasoning);
      };
    }
    if (reasoningToggle) {
      reasoningToggle.onchange = () => {
        syncReasoning(reasoningToggle.checked);
      };
    }

    // Initialize help icons
    const helpTexts = {
        'dark-mode': {
            title: 'Dark Mode',
            text: 'Toggle between dark and light theme. Dark mode is easier on the eyes in low-light conditions.'
        },
        'auto-theme': {
            title: 'Auto Theme',
            text: 'Automatically switches to Light Mode between 10:00 AM and 5:00 PM, and Dark Mode otherwise.'
        },
        'web-search': {
            title: 'Web Search',
            text: 'Enable to allow the AI to search Wikipedia for answers when it doesn\'t have a built-in response. A globe icon will appear in the input area when enabled.'
        },
        'ai-modal': {
            title: 'AI Modal',
            text: 'Choose which AI model to use. Different models have different capabilities and knowledge bases. SPT 5.0 is the latest default model with 45,000 parameters. SPT 4.6 (5,000 parameters) remains available as a secondary option.'
        },
        'shortened-answers': {
            title: 'Shortened Answers',
            text: 'When enabled, Wikipedia-sourced responses will be reduced to 60% of their original length using intelligent text summarization, plus a short concluding sentence. Only applies to answers fetched from Wikipedia.'
        },
        'quick-actions': {
            title: 'Quick Actions',
            text: 'Suggested prompts shown on empty chats to help you get started. New users see these on their first chat only. Enable this setting to always show quick actions.'
        },
        'model-thinking': {
            title: 'Show Model Thinking',
            text: 'When enabled, displays the AI\'s internal reasoning steps from <|think|> blocks in responses. This reveals how the model processes your input before generating a reply.'
        }
    };

    document.querySelectorAll('.help-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const helpKey = e.target.getAttribute('data-help');
            const helpData = helpTexts[helpKey];
            if (helpData) {
                document.getElementById('helpTitle').textContent = helpData.title;
                document.getElementById('helpText').textContent = helpData.text;
                document.getElementById('helpOverlay').classList.add('show');
            }
        });
    });

    document.getElementById('helpOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'helpOverlay') {
            document.getElementById('helpOverlay').classList.remove('show');
        }
    });

    const shortenedAnswersToggle = document.getElementById("shortenedAnswersToggle");
    if (shortenedAnswersToggle) {
        shortenedAnswersToggle.onchange = async () => {
            await DB.set("shortenedAnswers", shortenedAnswersToggle.checked ? "true" : "false");
        };
    }

    // Initialize Quick Actions setting
    let qaSetting = await DB.get("quickActionsEnabled");
    if (qaSetting === null) {
      const hasSentMessages = chats.some(c => c.messages && c.messages.length > 0);
      await DB.set("quickActionsEnabled", hasSentMessages ? "false" : "new");
      qaSetting = hasSentMessages ? "false" : "new";
    }

    const quickActionsToggle = document.getElementById("quickActionsToggle");
    if (quickActionsToggle) {
      quickActionsToggle.checked = qaSetting === "true";
      quickActionsToggle.onchange = async () => {
        await DB.set("quickActionsEnabled", quickActionsToggle.checked ? "true" : "false");
      };
    }

    if (qaSetting === "new") {
      setTimeout(showQuickActionsGuide, 600);
    }

    // Sync thinking UI for current model
    updateThinkingUI();

    // Set initial send button state
    updateSendButton();
}

window.addEventListener('app-ready', startApp);

(async function() {
  await DB.init();
  const setup = await DB.get("SETUP");
  const userInfo = await DB.get("userInfo");
  
  if (setup !== "FLAG_TRUE" || !userInfo) {
    // Migration fallback
    if (localStorage.getItem("SETUP") === "FLAG_TRUE" || localStorage.getItem("userInfo")) {
      await migrateFromLocalStorage();
      // Verify again after migration
      const migratedSetup = await DB.get("SETUP");
      const migratedUserInfo = await DB.get("userInfo");
      if (migratedSetup === "FLAG_TRUE" || migratedUserInfo) {
        initializeApp();
        return;
      }
    }
    window.location.href = "https://xpdevs.github.io/Genesis-AI/legal/setup.html";
    return;
  }
  initializeApp();
})();
