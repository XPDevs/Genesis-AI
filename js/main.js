// --- DATABASE UTILITY (IndexedDB) ---
const DB = {
    dbName: "GenesisAI",
    dbVersion: 1,
    storeName: "settings",
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
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
    tokenizerScript.src = 'https://xpdevs.github.io/Genesis-AI/js/token.js?v=' + Date.now();
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
        // Add globe icon to search button (blue when active)
        if (searchToggleBtn && !searchToggleBtn.querySelector('svg')) {
            searchToggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';
            searchToggleBtn.title = "Web Search (Click for Settings)";
        }
        // Hide search button by default (will show when search is enabled)
        if (searchToggleBtn) {
            searchToggleBtn.style.display = 'none';
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
        #settingsBtn, #searchToggleBtn {
            width: 40px;
            height: 40px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            flex-shrink: 0; /* Prevent shrinking in flex container */
            border: none;
            background: rgba(128, 128, 128, 0.1);
            cursor: pointer;
            transition: all 0.2s;
        }
        .input-area {
            padding: 14px 12px 14px 22px; /* Thicker input area for desktop */
        }
        #searchToggleBtn {
            position: absolute;
            left: 48px;
            top: 50%;
            transform: translateY(-50%);
            margin: 0;
            background: transparent;
            padding: 4px 6px;
        }
        #searchToggleBtn svg {
            width: 22px;
            height: 22px;
            stroke: #666;
        }
        #searchToggleBtn.active svg {
            stroke: #3b82f6;
        }
        #searchToggleBtn:hover {
            background: transparent;
        }
        #searchToggleBtn.active:hover {
            background: transparent;
        }
        .help-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgba(128, 128, 128, 0.3);
            color: var(--text, #fff);
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            margin-left: 6px;
            transition: all 0.2s;
        }
        .help-icon:hover {
            background: var(--primary, #3b82f6);
            color: white;
        }
        .help-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 100000;
        }
        .help-overlay.show {
            display: flex;
        }
        .help-overlay-content {
            background: var(--input-bg, #222);
            border: 1px solid var(--border, #444);
            border-radius: 12px;
            padding: 20px;
            max-width: 320px;
            text-align: center;
        }
        .help-overlay-content h3 {
            margin: 0 0 12px 0;
            color: var(--text, #fff);
        }
        .help-overlay-content p {
            color: var(--text, #fff);
            opacity: 0.8;
            font-size: 0.9rem;
            line-height: 1.5;
            margin: 0 0 15px 0;
        }
        .help-overlay-close {
            background: var(--primary, #3b82f6);
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
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

// NEW: Search toggle button
const searchToggleBtn = document.getElementById("searchToggleBtn");

// NEW: Live Mode button
const liveModeBtn = document.getElementById("liveModeBtn");

// State
let chats = [];
let activeChatId = null;
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
    typingInterval: null,
    thinkingTimeout: null,
    resetTimeout: null,
    originalSendIcon: null,
    currentAiMessage: null
};

// Wikipedia Search flag (default false)
let useWikipedia = false;

// Function to update send button based on input content
function updateSendButton() {
    if (!userInput) return;
    // Now the send button only shows send arrow or stop square.
    // It never shows the microphone (live mode is separate).
    if (aiState.isResponding) {
        // If responding, show stop square
        sendBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>';
    } else {
        // Normal send icon
        sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/></svg>';
    }
    sendBtn.classList.remove('live-mode');
}

function stopGeneration() {
    if (!aiState.isResponding) return;
    
    aiState.isResponding = false;
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    aiState.currentRequestId++; // Invalidate pending operations
    
    if (aiState.typingInterval) {
        clearInterval(aiState.typingInterval);
        aiState.typingInterval = null;
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
            const latestMsg = chatBox.querySelector('.message.ai.latest span');
            if (latestMsg) {
                aiState.currentAiMessage.text = latestMsg.textContent;
                saveChats();
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
    if (!window.isSpeechLiveModeActive || !window.isSpeechLiveModeActive()) {
        userInput.focus();
    }
    
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
    const newChat = { id: Date.now().toString(), title: newChatTitle, messages: messages };
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

// --- BINARY DECODER (V4.5 OPTIMIZED) ---
// Matches XPDevs Nano-Compiler v2.0 (json2bin.c)
const defaultModel = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-4.6.bin";
let jsonURL = defaultModel;

function decodeBinary(buffer) {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    const XOR_KEY = 0xAA; 
    const decoder = new TextDecoder('utf-8');
    let jsonString = "";
    
    // 1. Signature Check (Match #define SIG_SMALL 0x53494E47)
    // We check the first 4 bytes for the "GNIS" signature
    let i = 0;
    try {
        const sig = view.getUint32(0, true); // true = little-endian
        if (sig === 0x53494E47) {
            i = 4; // Skip "GNIS" header
            console.log("Valid Signature.");
        } else {
            console.warn("Signature mismatch, attempting skip-less parse.");
            i = 0;
        }
    } catch (e) {
        i = 0;
    }

    // 2. Token-based Reconstruction
    while (i < bytes.length) {
        const b = bytes[i];
        
        switch(b) {
            case 0x01: jsonString += "{"; break; // T_START
            case 0x02: jsonString += "}"; break; // T_END
            case 0x03: jsonString += ":"; break; // T_SEP
            case 0x04: // T_NEXT
                // Prevent trailing commas: only add comma if next token is NOT } (0x02) or ] (0x06)
                if (i + 1 < bytes.length && bytes[i + 1] !== 0x02 && bytes[i + 1] !== 0x06) {
                    jsonString += ",";
                }
                break;
            case 0x05: jsonString += "["; break; // T_ARR_S
            case 0x06: jsonString += "]"; break; // T_ARR_E
            case 0x07: // T_STR (String Start)
                i++; 
                let start = i;
                
                // Find the 0x00 null terminator used in json2bin.c
                while (i < bytes.length && bytes[i] !== 0x00) {
                    i++;
                }
                
                const chunk = bytes.slice(start, i);
                const decrypted = new Uint8Array(chunk.length);
                for (let j = 0; j < chunk.length; j++) {
                    decrypted[j] = chunk[j] ^ XOR_KEY;
                }
                
                // The C compiler preserves the string content as it appears in the JSON file,
                // including escape characters like \". Using JSON.stringify would re-escape
                // these, corrupting the data (e.g., \" becomes \\").
                // The correct approach is to simply wrap the decoded string in quotes,
                // mirroring the behavior of the nano_decompile function in json2bin.c.
                const stringContent = decoder.decode(decrypted);
                jsonString += '"' + stringContent + '"';
                break;
            default:
                // Ignore unexpected bytes (like padding)
                break;
        }
        i++;
    }
    
    return jsonString.trim();
}  

// 3. Model Loading Logic
async function loadModel() {
  jsonURL = await DB.get("selectedModel", defaultModel);
  try {
    const r = await fetch(jsonURL + "?v=" + Date.now());
    if (!r.ok) throw new Error("File not found!");
    const buffer = await r.arrayBuffer();
    try {
      const decoded = decodeBinary(buffer);
      
      // Safety: Ensure the result is valid JSON before parsing
      if (!decoded || (!decoded.startsWith("{") && !decoded.startsWith("["))) {
          throw new Error("Reconstructed string is invalid!");
      }
      
      responses = JSON.parse(decoded);
      console.log("Binary modal loaded.");
    } catch (e) {
      console.warn("Binary reconstruction failed: " + e.message);
      
      // Fallback: Check if the file was just raw JSON all along
      try {
          const rawText = new TextDecoder().decode(buffer).trim();
          responses = JSON.parse(rawText);
          console.log("Fallback successful.");
      } catch (innerErr) {
          throw new Error("File is not in either supported format.");
      }
    }
  } catch (err) {
    console.error("Reconstruction Error:", err);
    // Legacy Safety Fallback to 1.0 JSON (with cache busting)
    try {
      const r = await fetch("https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json?v=" + Date.now());
      const data = await r.json();
      responses = data; 
      if (typeof showLegacyModal === "function") showLegacyModal();
    } catch (e) {
      console.error("Final fallback failed:", e);
    }
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

  displayChats.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  displayChats.forEach(chat => {
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
            // On desktop, sidebar toggle is hidden, so we just want settings on right
            const isMobile = window.innerWidth <= 768;
            chatHeader.style.justifyContent = isMobile ? 'space-between' : 'flex-end';
            
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
        const hour = new Date().getHours();
        const greetingText = hour < 12 ? 'Good Morning' : 'Good Afternoon';
        greetingEl.textContent = `${greetingText}, ${name}`;
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

async function renderMessages() {
  if (isReadOnlyMode) return;
  const chat = chats.find(c => c.id === activeChatId);
  chatTitle.textContent = chat ? chat.title : "New Chat";
  chatBox.innerHTML = "";
  if (!chat) { await updateChatView(); return; }
  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false, msg.imageUrl, msg.footer));
  chatBox.scrollTop = chatBox.scrollHeight;
  if (chat) await updateURL(chat.title);
  await updateChatView();
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

  const hasMath = /\{\\displaystyle|\$\$/.test(processedText);
  const hasHTML = /<[a-z][\s\S]*>/i.test(processedText);

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
    speakBtn.onclick = () => { if (window.speechSynthesis.speaking) window.speechSynthesis.cancel(); else window.speechSynthesis.speak(new SpeechSynthesisUtterance(processedText)); };
    actionsDiv.appendChild(speakBtn);
 
    if (isNew && window.shouldSpeakResponse) {
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(processedText);
        const ball = document.getElementById('pulsing-ball');
        const captionEl = document.getElementById('live-caption-text');

        // Split text into sentences for chunked captioning
        const sentences = processedText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [processedText];
        let currentSentenceIdx = -1;

        utterance.onboundary = (event) => {
             if (event.name === 'word') {
                let charCount = 0;
                let newIndex = 0;
                for (let i = 0; i < sentences.length; i++) {
                    charCount += sentences[i].length;
                    if (event.charIndex < charCount) {
                        newIndex = i;
                        break;
                    }
                }
                if (newIndex !== currentSentenceIdx) {
                    currentSentenceIdx = newIndex;
                    if (captionEl && document.getElementById('live-mode-overlay')?.style.display === 'flex') {
                        let text = sentences[currentSentenceIdx];
                        if (sentences[currentSentenceIdx + 1]) text += " " + sentences[currentSentenceIdx + 1];
                        captionEl.textContent = text;
                    }
                }
             }
        };

        utterance.onstart = () => {
            if (ball) ball.classList.add('speaking');
            if (captionEl && document.getElementById('live-mode-overlay')?.style.display === 'flex') {
                let text = sentences[0];
                if (sentences[1]) text += " " + sentences[1];
                captionEl.textContent = text;
                captionEl.className = 'ai-caption';
            }
        };
        utterance.onend = () => {
            if (ball) ball.classList.remove('speaking');
            // This global function is defined in speech.js to restart the listening loop
            if (window.startListeningAfterSpeech) window.startListeningAfterSpeech();
        };

        window.speechSynthesis.speak(utterance);
        window.shouldSpeakResponse = false; // Reset the flag
    }

    const existingLatest = chatBox.querySelectorAll('.message.ai.latest');
    existingLatest.forEach(el => el.classList.remove('latest'));
    div.classList.add('latest');
    if (isNew) aiState.currentAiMessage = messageObj;
  }

  div.appendChild(actionsDiv);
  chatBox.append(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (role === "ai" && isNew) {
    if (hasHTML || (hasMath && !processedText.includes('\n'))) {
        if (hasMath && window.katex) {
            renderTextWithMath(textSpan, processedText);
        } else {
            textSpan.innerHTML = processedText;
        }
        aiState.currentAiMessage = null; // Finished rendering immediately
    } else {
    let i = 0;
    const interval = setInterval(() => {
      if (i < processedText.length) {
          textSpan.textContent += processedText[i]; 
          i++;
          chatBox.scrollTop = chatBox.scrollHeight;
      }
      if (i === processedText.length) {
          clearInterval(interval);
          if (hasMath && window.katex) {
              textSpan.textContent = ""; // Clear typed text before rendering math
              renderTextWithMath(textSpan, processedText);
          }
          aiState.currentAiMessage = null;
          aiState.typingInterval = null;
      }
    }, 30);
    aiState.typingInterval = interval;
    }
  } else { 
      if (hasMath && window.katex) {
          renderTextWithMath(textSpan, processedText);
      } else {
          textSpan[hasHTML ? 'innerHTML' : 'textContent'] = processedText; 
      }
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

function violatesRules(text) {
  if (!bannedWords.length) return false;
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lowerText));
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
  // Decode the input from UTF-8 hex format
  const decodedInput = window.tokenizer.decode(input);
  const lowerInput = decodedInput.toLowerCase();

  // Calculator Integration
  if (typeof window.calc === 'function') {
      const isExplicit = /^(calc|calculate|solve|math)\b/i.test(decodedInput);
      const isMathExpression = /^[\d\s().+\-*/^x]+$/i.test(decodedInput) && /[\d]/.test(decodedInput) && /[-+*/^x]/.test(decodedInput);
      
      if (isExplicit || isMathExpression) {
          const result = window.calc(decodedInput);
          if (result !== "Error" && result !== "Invalid input") {
              // Encode the response before returning
              return { role: "ai", text: window.tokenizer.encode(`The answer is: ${result}`) };
          }
      }
  }

  const foundMatches = [];
  const sortedKeys = Object.keys(responses).sort((a, b) => b.length - a.length);
  let tempInput = lowerInput;
  sortedKeys.forEach(key => {
    const lowerKey = key.toLowerCase();
    let index = tempInput.indexOf(lowerKey);
    while (index !== -1) {
      foundMatches.push({ text: responses[key], index: index });
      tempInput = tempInput.substring(0, index) + ' '.repeat(lowerKey.length) + tempInput.substring(index + lowerKey.length);
      index = tempInput.indexOf(lowerKey);
    }
  });

  if (foundMatches.length === 0) {
    // Only attempt Wikipedia if the flag is enabled
    if (useWikipedia) {
        try {
          const prefixes = [
            "how to", "what is", "who is", "where is", "when is", "why is", "tell me about", "define", "explain", "what are", "who are",
            "how do i", "how can i", "steps to", "guide for", "tutorial on", "method to", "process for",
            "meaning of", "describe", "summarize", "overview of", "details on", "concept of", "basics of",
            "difference between", "compare", "list of", "examples of", "pros and cons of",
            "who was", "where are", "origin of", "source of", "background on", "is there a"
          ];
          const isQuestion = prefixes.some(prefix => lowerInput.startsWith(prefix));

          const modelVer = (responses.ver || "").toLowerCase();
          let allowWiki = true;

          if (modelVer.includes("1.0")) {
              allowWiki = false;
          } else if (modelVer.includes("coder")) {
              const codingTerms = ["code", "coding", "program", "programming", "dev", "developer", "software", "script", "function", "variable", "class", "object", "api", "database", "sql", "html", "css", "javascript", "python", "java", "c++", "c#", "linux", "terminal", "git", "github", "error", "bug", "debug", "compile", "runtime", "framework", "library", "react", "node", "npm", "pip", "docker", "aws", "cloud", "http", "rest", "json", "xml"];
              allowWiki = codingTerms.some(t => lowerInput.includes(t));
          }

          if (isQuestion && allowWiki) {
            playThinkingSound();
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(decodedInput)}&format=json&origin=*`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
              const topResult = searchData.query.search[0];
              const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&titles=${encodeURIComponent(topResult.title)}&format=json&origin=*`;
              const contentRes = await fetch(contentUrl);
              const contentData = await contentRes.json();
              const pages = contentData.query.pages;
              const pageId = Object.keys(pages)[0];

              if (pages[pageId] && pages[pageId].extract) {
                let fullText = pages[pageId].extract;
                fullText = fullText.replace(/={2,}[^=]+={2,}/g, '').replace(/\s+/g, ' ').trim();
                
                const summary = window.summariseConversation(fullText, 5);
                
                const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [summary];
                let formattedSummary = summary;

                if (sentences.length >= 3) {
                    const intro = sentences[0];
                    const outro = sentences[sentences.length - 1];
                    const facts = sentences.slice(1, -1);
                    formattedSummary = `${intro}\n\n${facts.map(s => `• ${s}`).join('\n\n')}\n\n${outro}`;
                } else {
                    formattedSummary = sentences.map(s => `• ${s}`).join('\n\n');
                }
                
                return { role: "ai", text: window.tokenizer.encode(`\n\n${formattedSummary}\n\n`) };
              }
            }
          }
        } catch (e) {
          console.error("Wikipedia fetch failed:", e);
        }
    }
    return { role: "ai", text: window.tokenizer.encode("I’m not quite sure I follow. Could you give me a bit more detail?") };
  }
  const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
  if (orderedMessages.length === 1) return { role: "ai", text: window.tokenizer.encode(orderedMessages[0]) };
  const last = orderedMessages.pop();
  return { role: "ai", text: window.tokenizer.encode(orderedMessages.join(", ") + " and " + last) };
}

async function sendMessage() {
  if (isReadOnlyMode) return;
  if (await isCurrentlyBanned()) { await showBanModal(); return; }

  // Removed the live mode trigger for empty input
  if (userInput.value.trim() === "") {
    // Do nothing – live mode is separate
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
  sendBtn.classList.remove('live-mode');
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
        const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
        chats.unshift(newChat); activeChatId = newChat.id; await DB.set("activeChatId", activeChatId);
        await saveChats(); renderChatList();
      }

      const chat = chats.find(c => c.id === activeChatId);
      const userMsg = { role: "user", text: text };
      if (imgSrc) userMsg.imageUrl = imgSrc;
      chat.messages.push(userMsg);
      await renderMessages(); await saveChats();

      if (chat.messages.filter(m => m.role === "user").length === 1) {
        const newTitle = summariseTitle(text);
        typeChatTitle(newTitle, async () => { chat.title = newTitle; await saveChats(); renderChatList(); await updateURL(newTitle); });
      }

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "message loading-container";
      loadingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span class="loading-text">Scanning image...</span>`;
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
                  chat.messages.push(botMsg);
                  await saveChats();
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

  // Image Generation Command
  if (lowerText.startsWith("@img") || lowerText.startsWith("@generate")) {
      const prompt = text.replace(/^@\w+\s*/, '').trim();
      if (!prompt) { appendMessage("Please provide a prompt.", "error"); return; }

      userInput.disabled = true; sendBtn.disabled = false; sendBtn.style.opacity = "1";

      if (!activeChatId) {
        const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
        chats.unshift(newChat); activeChatId = newChat.id; await DB.set("activeChatId", activeChatId);
        await saveChats(); renderChatList();
      }

      const chat = chats.find(c => c.id === activeChatId);
      const userMsg = { role: "user", text: text };
      chat.messages.push(userMsg);
      await renderMessages(); await saveChats();

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "message loading-container";
      loadingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span class="loading-text">Generating image...</span>`;
      chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
      aiState.loadingDiv = loadingDiv;

      const runGen = () => {
          window.generateImage(prompt).then(async imgUrl => {
              if (requestId !== aiState.currentRequestId) return;
              loadingDiv.remove();
              aiState.loadingDiv = null;
              if (imgUrl && imgUrl.trim()) {
                  const botMsg = { role: "ai", text: "Here is your generated image:", imageUrl: imgUrl, footer: "Would you like to me add anything the image?" };
                  chat.messages.push(botMsg);
                  await saveChats();
                  appendMessage(botMsg.text, botMsg.role, true, botMsg.imageUrl, botMsg.footer, botMsg);
              } else {
                  appendMessage("Failed to generate image. Please try again.", "error");
              }
              userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; userInput.focus();
              aiState.isResponding = false;
              sendBtn.innerHTML = aiState.originalSendIcon;
              updateSendButton();
          });
      };

      if (window.generateImage) {
          runGen();
      } else {
          const script = document.createElement('script');
          script.src = "js/image-gen.js?v=" + Date.now();
          script.onload = runGen;
          script.onerror = () => {
              if (requestId !== aiState.currentRequestId) return;
              loadingDiv.remove();
              aiState.loadingDiv = null;
              appendMessage("Error loading image generation module.", "error");
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
        const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
        chats.unshift(newChat); activeChatId = newChat.id; await DB.set("activeChatId", activeChatId);
        await saveChats(); renderChatList();
      }

      const chat = chats.find(c => c.id === activeChatId);
      const userMsg = { role: "user", text: text };
      chat.messages.push(userMsg);
      await renderMessages(); await saveChats();

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "message loading-container";
      loadingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span class="loading-text">Analyzing text...</span>`;
      chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
      aiState.loadingDiv = loadingDiv;

      const runTxtAuth = () => {
          window.authenticateText(textToCheck).then(async result => {
              if (requestId !== aiState.currentRequestId) return;
              loadingDiv.remove();
              aiState.loadingDiv = null;
              const botMsg = { role: "ai", text: result };
              chat.messages.push(botMsg);
              await saveChats();
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
    const info = await loadBanInfo(); info.consecutiveViolations = (info.consecutiveViolations || 0) + 1; await saveBanInfo(info);
    if (info.consecutiveViolations >= 5) { await applyBan(); return; }
    return appendMessage('This message violates AI safety and use policies. Please try again.', 'error');
  }

  const info = await loadBanInfo(); info.consecutiveViolations = 0; await saveBanInfo(info);
  userInput.disabled = true; sendBtn.disabled = false; sendBtn.style.opacity = "1";

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat); activeChatId = newChat.id; await DB.set("activeChatId", activeChatId);
    await saveChats(); renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  const userMsg = { role: "user", text: text };
  if (imgSrc) userMsg.imageUrl = imgSrc;
  
  chat.messages.push(userMsg);
  await renderMessages(); await saveChats();

  if (chat.messages.filter(m => m.role === "user").length === 1) {
    const newTitle = summariseTitle(text);
    typeChatTitle(newTitle, async () => { chat.title = newTitle; await saveChats(); renderChatList(); await updateURL(newTitle); });
  }

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message loading-container";
  loadingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span class="loading-text">Thinking...</span>`;
  chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
  aiState.loadingDiv = loadingDiv;

    aiState.thinkingTimeout = setTimeout(async () => {
        if (requestId !== aiState.currentRequestId) return;
        loadingDiv.remove();
        aiState.loadingDiv = null;

        // Encode user input before sending to the AI
        const encodedText = window.tokenizer.encode(text);
        const botMsg = await findResponses(encodedText, chat.messages);

        if (requestId !== aiState.currentRequestId) return;

        // Decode the AI's response before displaying
        if (botMsg && botMsg.text) {
            botMsg.text = window.tokenizer.decode(botMsg.text);
        }

        // Add to history and then append to UI
        chat.messages.push(botMsg);
        await saveChats();
        
        // Pass botMsg so we can track it in aiState.currentAiMessage
        appendMessage(botMsg.text, botMsg.role, true, null, null, botMsg); 

        const timeout = !botMsg.text ? 500 : (botMsg.text.length * 30) + 500;
        aiState.resetTimeout = setTimeout(() => { 
            if (requestId !== aiState.currentRequestId) return;
            userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; 
            if (!window.isSpeechLiveModeActive || !window.isSpeechLiveModeActive()) {
                userInput.focus(); 
            }
            aiState.isResponding = false; sendBtn.innerHTML = aiState.originalSendIcon;
            updateSendButton(); // Restore button based on input content
        }, timeout);
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
function updateDevModalStatus() {
    if (!devModal || !devModal.style.display || devModal.style.display === 'none') return;
    devCurrentModalName.textContent = responses.ver || "Unknown Version";
    devCurrentModalMode.textContent = customModelInput.files.length > 0 ? "Custom (Session)" : "Normal";
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

function handleCustomModelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const statusEl = document.getElementById("customModelStatus") || document.getElementById("uploadStatus");
    if (statusEl) statusEl.textContent = `Reading ${file.name}...`;
    const reader = new FileReader();

    reader.onload = function(e) {
        const buffer = e.target.result;
        try {
            let newResponses;
            if (file.name.endsWith('.json')) {
                const rawText = new TextDecoder().decode(buffer).trim();
                newResponses = JSON.parse(rawText);
                console.log("Genesis-AI: Custom JSON modal loaded for session.");
            } else if (file.name.endsWith('.bin')) {
                const decoded = decodeBinary(buffer);
                if (!decoded || (!decoded.startsWith("{") && !decoded.startsWith("["))) {
                    throw new Error("Reconstructed string from .bin is not valid JSON.");
                }
                newResponses = JSON.parse(decoded);
                console.log("Genesis-AI: Custom Binary modal loaded for session.");
            } else {
                throw new Error("Unsupported file type. Please use .json or .bin");
            }

            if (typeof newResponses !== 'object' || newResponses === null) {
                throw new Error("Parsed modal is not a valid object.");
            }

            responses = newResponses; // Override for session
            if (statusEl) statusEl.textContent = `Success! Loaded "${newResponses.ver || file.name}". Keys: ${Object.keys(newResponses).length}.`;
            
            // Update settings modal display
            if (document.getElementById("modelNameDisplay")) {
                document.getElementById("modelNameDisplay").textContent = responses.ver || "Unknown Version";
            }
            if (document.getElementById("modelParamsDisplay")) {
                document.getElementById("modelParamsDisplay").textContent = Object.keys(responses).length;
            }
            
            // Also update dev modal if it's open
            if (isDevMode) updateDevModalStatus();

        } catch (err) {
            console.error("Custom modal load failed:", err);
            if (statusEl) statusEl.textContent = `Error: ${err.message}`;
        }
    };

    reader.onerror = function() {
        if (statusEl) statusEl.textContent = "Error reading file.";
    };

    reader.readAsArrayBuffer(file);
}

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

if (devModal) { devModalCancel.onclick = () => devModal.style.display = 'none'; devModalClose.onclick = () => devModal.style.display = 'none'; customModelInput.addEventListener('change', handleCustomModelUpload); }
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
        // After deleting, go to a new chat screen
        let newChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
        if (!newChat) {
            newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
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
      const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
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
            uploadBtn.style.color = "#00C851"; // Green to indicate file selected
            userInput.focus();
        }
    };
}

if (userInput && suggestionBox) {
    userInput.addEventListener('input', () => {
        updateSendButton(); // Update button state on input
        const val = userInput.value;
        if (val.endsWith('@')) {
            suggestionBox.innerHTML = `
                <div class="suggestion-item" onclick="userInput.value += 'ImgAuth '; suggestionBox.style.display='none'; userInput.focus(); updateSendButton();"><span>🔒</span> ImgAuth</div>
                <div class="suggestion-item" onclick="userInput.value += 'img '; suggestionBox.style.display='none'; userInput.focus(); updateSendButton();"><span>🎨</span> Generate Image</div>
                <div class="suggestion-item" onclick="userInput.value += 'TxtAuth '; suggestionBox.style.display='none'; userInput.focus(); updateSendButton();"><span>📝</span> Check Text</div>
            `;
            suggestionBox.style.display = 'block';
        } else {
            suggestionBox.style.display = 'none';
        }
    });
    // Hide suggestion box if clicked outside
    document.addEventListener('click', (e) => { if (e.target !== userInput && e.target !== suggestionBox) suggestionBox.style.display = 'none'; });
}

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
settingsBtn.onclick = () => {
    settingsModal.style.display = "flex";
    document.getElementById("modelNameDisplay").textContent = responses.ver || "Genesis-SPT-4.6";
    document.getElementById("modelParamsDisplay").textContent = Object.keys(responses).length;
    // Add upload status element if it doesn't exist
    if (modelSelect && !document.getElementById("customModelStatus")) {
        const statusEl = document.createElement('p');
        statusEl.id = "customModelStatus";
        statusEl.style.fontSize = "0.8em";
        statusEl.style.marginTop = "5px";
        statusEl.style.opacity = "0.7";
        modelSelect.parentElement.insertBefore(statusEl, modelSelect.nextSibling);
    }
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

if (modelSelect) {
    // Add custom model upload option
    if (!modelSelect.querySelector('option[value="custom"]')) {
        const customOption = document.createElement('option');
        customOption.value = "custom";
        customOption.textContent = "Load from file...";
        modelSelect.appendChild(customOption);
    }

    (async () => {
        modelSelect.value = await DB.get("selectedModel", defaultModel);
    })();

    modelSelect.onchange = async () => {
        const selectedValue = modelSelect.value;
        const currentModel = await DB.get("selectedModel", defaultModel);
        if (selectedValue === "custom") {
            if (customModelInput) customModelInput.click();
            // Reset dropdown to current model after opening file dialog
            setTimeout(() => { modelSelect.value = currentModel; }, 100);
        } else if (selectedValue !== currentModel) {
            document.getElementById("refreshWarningModal").style.display = "flex";
        }
    };
}
document.getElementById("refreshConfirm").onclick = async () => {
    const selectedValue = modelSelect.value;
    await DB.set("selectedModel", selectedValue);
    window.location.reload();
};
document.getElementById("refreshCancel").onclick = async () => {
    document.getElementById("refreshWarningModal").style.display = "none";
    modelSelect.value = await DB.get("selectedModel", defaultModel);
};

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
    document.getElementById("deleteAllModal").style.display = "none"; 
};

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
        const newName = prompt("Enter your name:", currentName);
        if (newName && newName.trim() !== "") {
            await updateUserProfile(newName.trim());
        }
    };
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
            newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
            chats.unshift(newChat);
            await saveChats();
        }
        activeChatId = newChat.id;
        await DB.set("activeChatId", activeChatId);
    } else {
        // Mobile: Load last active chat or create new if none exists
        if (activeChatId && !chats.find(c => c.id === activeChatId)) activeChatId = null;
        
        if (!activeChatId && chats.length > 0) {
            activeChatId = chats[0].id;
            await DB.set("activeChatId", activeChatId);
        }
        if (!activeChatId && chats.length === 0) {
            const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
            chats.unshift(newChat);
            activeChatId = newChat.id;
            await saveChats();
            await DB.set("activeChatId", activeChatId);
        }
    }
    renderChatList();
    await renderMessages();

    // Initialize search toggle - show globe icon in input area next to upload button
    // Globe is grey when off, blue when on
    if (searchToggleBtn) {
        // Ensure globe is positioned inside input area (next to upload button)
        const inputArea = document.getElementById('inputArea');
        if (inputArea && !inputArea.contains(searchToggleBtn)) {
            const uploadBtn = document.getElementById('uploadBtn');
            if (uploadBtn) {
                inputArea.insertBefore(searchToggleBtn, uploadBtn.nextSibling);
            }
        }
        
        const savedSearchPref = await DB.get("useWikipedia", false);
        useWikipedia = savedSearchPref;
        if (useWikipedia) {
            searchToggleBtn.classList.add('active');
            searchToggleBtn.style.display = 'flex';
        } else {
            searchToggleBtn.classList.remove('active');
            searchToggleBtn.style.display = 'flex'; // Always show, just grey
        }
        // Click handler opens settings modal
        searchToggleBtn.onclick = () => {
            const settingsModal = document.getElementById("settingsModal");
            if (settingsModal) {
                settingsModal.style.display = "flex";
            }
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
            text: 'Choose which AI model to use. Different models have different capabilities and knowledge bases. SPT 4.6 is the latest default model.'
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

    // Initialize web search toggle in settings modal
    const webSearchToggle = document.getElementById("webSearchToggle");
    if (webSearchToggle) {
        webSearchToggle.checked = await DB.get("useWikipedia", false);
        webSearchToggle.onchange = async () => {
            useWikipedia = webSearchToggle.checked;
            await DB.set("useWikipedia", useWikipedia);
            if (searchToggleBtn) {
                if (useWikipedia) {
                    searchToggleBtn.classList.add('active');
                } else {
                    searchToggleBtn.classList.remove('active');
                }
            }
        };
    }

    // Set initial send button state
    updateSendButton();

    // NEW: Live Mode button handler
    if (liveModeBtn) {
        liveModeBtn.onclick = () => {
            if (window.isSpeechLiveModeActive && window.isSpeechLiveModeActive()) {
                if (window.stopLiveMode) window.stopLiveMode();
                liveModeBtn.classList.remove('active');
            } else {
                if (window.startLiveMode) window.startLiveMode();
                liveModeBtn.classList.add('active');
            }
        };
    }
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
