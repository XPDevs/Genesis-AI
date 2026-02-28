function initializeApp() {
    console.log("Website loaded successfully V6.4");
    window.dispatchEvent(new Event('app-ready'));
    loadMathSupport();
    injectCSS();
    initGoogleSignIn();
    setupSidebarUI();

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

    if (!localStorage.getItem("hasWelcomed")) {
        if (window.innerWidth <= 768) {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const name = userInfo.name || "User";
            Genesis.welcome(name);
        }
        localStorage.setItem("hasWelcomed", "true");
    }
}

function loadMathSupport() {
    if (document.getElementById('katex-css')) return;
    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = 'https://xpdevs.github.io/Genesis-AI/styles/calc-display.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://xpdevs.github.io/Genesis-AI/js/calc-display.js';
    script.onload = () => { window.katexLoaded = true; };
    document.head.appendChild(script);
}

function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .sidebar-footer {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            margin-top: auto;
            width: 100%;
            box-sizing: border-box;
        }
        .genesis-sidebar.collapsed .sidebar-footer {
            flex-direction: column;
            justify-content: center;
            gap: 16px;
            padding: 16px 0;
        }
        .genesis-sidebar.collapsed #settingsBtn {
            width: 40px;
            height: 40px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        .genesis-sidebar.collapsed #userIcon {
            width: 40px;
            height: 40px;
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

// State
let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let activeChatId = localStorage.getItem("activeChatId");
let responses = {};
let currentRenameId = null;
let currentDeleteId = null;
let isReadOnlyMode = false;
let currentUploadFile = null;
let isDevMode = false;
let searchQuery = "";
const DEV_PASSWORD = "7v#K9!mP2@zR5*qX";


// AI Control State
let aiState = {
    isResponding: false,
    currentRequestId: 0,
    loadingDiv: null,
    typingInterval: null,
    thinkingTimeout: null,
    resetTimeout: null,
    originalSendIcon: null
};

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

function loadAndSaveSharedChat(messages, originalTitle) {
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
    localStorage.setItem("activeChatId", activeChatId);
    saveChats(); renderChatList(); renderMessages();
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

function loadBanInfo() {
  const raw = localStorage.getItem(BAN_STORAGE_KEY);
  if (!raw) return { consecutiveViolations: 0, banHistoryCount: 0, bannedUntil: null };
  try { return JSON.parse(raw); } catch { return { consecutiveViolations: 0, banHistoryCount: 0, bannedUntil: null }; }
}
function saveBanInfo(info) { localStorage.setItem(BAN_STORAGE_KEY, JSON.stringify(info)); }
function isCurrentlyBanned() {
  const info = loadBanInfo();
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
function applyBan() {
  const info = loadBanInfo();
  const nextBanIndex = info.banHistoryCount || 0;
  let durationMs;
  let perm = false;
  if (nextBanIndex === 0) durationMs = 5 * 60 * 1000; 
  else if (nextBanIndex === 1) durationMs = 10 * 60 * 1000; 
  else perm = true;
  info.banHistoryCount = nextBanIndex + 1;
  info.consecutiveViolations = 0;
  info.bannedUntil = perm ? 'perm' : Date.now() + durationMs;
  saveBanInfo(info);
  showBanModal();
}

function liftBan() {
  const info = loadBanInfo();
  info.bannedUntil = null;
  info.consecutiveViolations = 0;
  saveBanInfo(info);
  const m = document.getElementById('banModal');
  if (m) m.style.display = 'none';
  if (banCountdownInterval) { clearInterval(banCountdownInterval); banCountdownInterval = null; }
}

window.unbanGenesis = function(code) {
  if (code === SECRET_UNBAN_CODE) { liftBan(); return true; }
  return false;
};

function showBanModal() {
  const modal = ensureBanModal();
  const title = modal.querySelector('#banModalTitle');
  const msg = modal.querySelector('#banModalMessage');
  const countdownEl = modal.querySelector('#banModalCountdown');
  const info = loadBanInfo();
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
  function updateCountdown() {
    const remaining = end - Date.now();
    if (remaining <= 0) {
      countdownEl.textContent = 'Ban expired — you may continue.';
      liftBan(); document.body.style.pointerEvents = 'auto'; return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    countdownEl.textContent = `Time left: ${mins}m ${secs}s`;
  }
  updateCountdown();
  if (banCountdownInterval) clearInterval(banCountdownInterval);
  banCountdownInterval = setInterval(updateCountdown, 1000);
  modal.style.display = 'flex';
  document.body.style.pointerEvents = 'none';
}

// --- BINARY DECODER (V4.5 OPTIMIZED) ---
// Matches XPDevs Nano-Compiler v2.0 (json2bin.c)
const defaultModel = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-4.5-240126P1105M.bin";
const jsonURL = localStorage.getItem("selectedModel") || defaultModel;

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
fetch(jsonURL + "?v=" + Date.now())
  .then(r => r.ok ? r.arrayBuffer() : Promise.reject("File not found!"))
  .then(buffer => {
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
  })
  .catch(err => {
    console.error("Reconstruction Error:", err);
    // Legacy Safety Fallback to 1.0 JSON
    fetch("https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json")
      .then(r => r.json())
      .then(data => { 
        responses = data; 
        if (typeof showLegacyModal === "function") showLegacyModal(); 
      });
  });

// --- UI & MESSAGING ---
function saveChats() { localStorage.setItem("chats", JSON.stringify(chats)); }
function updateURL(chatTitle) {
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
      saveChats();
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

    pinBtn.onclick = e => { e.stopPropagation(); chat.pinned = !chat.pinned; saveChats(); renderChatList(); dropdown.style.display = "none"; };
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
    li.onclick = () => { activeChatId = chat.id; localStorage.setItem("activeChatId", activeChatId); renderChatList(); renderMessages(); updateURL(chat.title); };
    li.append(span, options);
    chatList.append(li);
  });
}

function updateChatView() {
    const chat = chats.find(c => c.id === activeChatId);
    let greetingEl = document.getElementById('greeting');
    const chatMain = document.querySelector('.chat-main');

    if (chat && chat.messages.length === 0) {
        document.body.classList.add('is-new-chat');
        if (!greetingEl) {
            greetingEl = document.createElement('div');
            greetingEl.id = 'greeting';
            if (chatMain) {
                chatMain.insertBefore(greetingEl, chatBox);
            }
        }
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const name = userInfo.name ? userInfo.name.split(' ')[0] : 'User';
        const hour = new Date().getHours();
        const greetingText = hour < 12 ? 'Good Morning' : 'Good Afternoon';
        greetingEl.textContent = `${greetingText}, ${name}`;
    } else {
        document.body.classList.remove('is-new-chat');
        if (greetingEl) {
            greetingEl.remove();
        }
    }
}

function renderMessages() {
  if (isReadOnlyMode) return;
  const chat = chats.find(c => c.id === activeChatId);
  chatTitle.textContent = chat ? chat.title : "New Chat";
  chatBox.innerHTML = "";
  if (!chat) { updateChatView(); return; }
  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false, msg.imageUrl, msg.footer));
  chatBox.scrollTop = chatBox.scrollHeight;
  if (chat) updateURL(chat.title);
  updateChatView();
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

function appendMessage(text, role, isNew = false, imageUrl = null, footerText = null) {
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
  }

  div.appendChild(actionsDiv);
  chatBox.append(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (role === "ai" && isNew) {
    if (hasHTML || hasMath) {
        if (hasMath && window.katex) {
            renderTextWithMath(textSpan, processedText);
        } else {
            textSpan.innerHTML = processedText;
        }
    } else {
    let i = 0;
    const interval = setInterval(() => {
      textSpan.textContent += processedText[i]; i++;
      chatBox.scrollTop = chatBox.scrollHeight;
      if (i === processedText.length) clearInterval(interval);
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
  const lowerInput = input.toLowerCase();


  // Calculator Integration
  if (typeof window.calc === 'function') {
      const isExplicit = /^(calc|calculate|solve|math)\b/i.test(input);
      const isMathExpression = /^[\d\s().+\-*/^x]+$/i.test(input) && /[\d]/.test(input) && /[-+*/^x]/.test(input);
      
      if (isExplicit || isMathExpression) {
          const result = window.calc(input);
          if (result !== "Error" && result !== "Invalid input") {
              return { role: "ai", text: `The answer is ${result}` };
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
    try {
      const prefixes = ["how to", "what is", "who is", "where is", "when is", "why is", "tell me about", "define", "explain", "what are", "who are"];
      const isQuestion = prefixes.some(prefix => lowerInput.startsWith(prefix));

      if (isQuestion) {
        playThinkingSound();
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(input)}&format=json&origin=*`;
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
            // Remove Wikipedia-style headings (e.g. == History ==) and normalize whitespace
            fullText = fullText.replace(/={2,}[^=]+={2,}/g, '').replace(/\s+/g, ' ').trim();
            
            const summary = window.summariseConversation(fullText, 5);
            
            // Format with intro, bullet points, and outro if enough content exists
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
            
            return { role: "ai", text: `\n\n${formattedSummary}\n\n` };
          }
        }
      }
    } catch (e) {
      console.error("Wikipedia fetch failed:", e);
    }
    return { role: "ai", text: "I’m not quite sure I follow. Could you give me a bit more detail?" };
  }
  const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
  if (orderedMessages.length === 1) return { role: "ai", text: orderedMessages[0] };
  const last = orderedMessages.pop();
  return { role: "ai", text: orderedMessages.join(", ") + " and " + last };
}

function sendMessage() {
  if (isReadOnlyMode) return;
  if (isCurrentlyBanned()) { showBanModal(); return; }

  if (aiState.isResponding) {
      stopGeneration();
      return;
  }

  const text = userInput.value.trim();
  if (!text && !currentUploadFile) return;
  
  if (!aiState.originalSendIcon) aiState.originalSendIcon = sendBtn.innerHTML;
  aiState.isResponding = true;
  const requestId = ++aiState.currentRequestId;
  sendBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>';
  userInput.value = "";

  const continueSend = (imgSrc) => {
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
        chats.unshift(newChat); activeChatId = newChat.id; localStorage.setItem("activeChatId", activeChatId);
        saveChats(); renderChatList();
      }

      const chat = chats.find(c => c.id === activeChatId);
      const userMsg = { role: "user", text: text };
      if (imgSrc) userMsg.imageUrl = imgSrc;
      chat.messages.push(userMsg);
      renderMessages(); saveChats();

      if (chat.messages.filter(m => m.role === "user").length === 1) {
        const newTitle = summariseTitle(text);
        typeChatTitle(newTitle, () => { chat.title = newTitle; saveChats(); renderChatList(); updateURL(newTitle); });
      }

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "message loading-container";
      loadingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span class="loading-text">Scanning image...</span>`;
      chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
      aiState.loadingDiv = loadingDiv;

      const runAuth = () => {
          const startTime = Date.now();
          window.authenticateImage(currentUploadFile).then(result => {
              if (requestId !== aiState.currentRequestId) return;
              const elapsedTime = Date.now() - startTime;
              const delay = Math.max(0, 3000 - elapsedTime);
              setTimeout(() => {
                  if (requestId !== aiState.currentRequestId) return;
                  loadingDiv.remove();
                  aiState.loadingDiv = null;
                  const botMsg = { role: "ai", text: result };
                  chat.messages.push(botMsg);
                  saveChats();
                  appendMessage(botMsg.text, botMsg.role, true);
                  
                  userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; userInput.focus();
                  currentUploadFile = null;
                  if(uploadBtn) uploadBtn.style.color = "";
                  aiState.isResponding = false;
                  sendBtn.innerHTML = aiState.originalSendIcon;
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
        chats.unshift(newChat); activeChatId = newChat.id; localStorage.setItem("activeChatId", activeChatId);
        saveChats(); renderChatList();
      }

      const chat = chats.find(c => c.id === activeChatId);
      const userMsg = { role: "user", text: text };
      chat.messages.push(userMsg);
      renderMessages(); saveChats();

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "message loading-container";
      loadingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span class="loading-text">Generating image...</span>`;
      chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
      aiState.loadingDiv = loadingDiv;

      const runGen = () => {
          window.generateImage(prompt).then(imgUrl => {
              if (requestId !== aiState.currentRequestId) return;
              loadingDiv.remove();
              aiState.loadingDiv = null;
              if (imgUrl && imgUrl.trim()) {
                  const botMsg = { role: "ai", text: "Here is your generated image:", imageUrl: imgUrl, footer: "Would you like to me add anything the image?" };
                  chat.messages.push(botMsg);
                  saveChats();
                  appendMessage(botMsg.text, botMsg.role, true, botMsg.imageUrl, botMsg.footer);
              } else {
                  appendMessage("Failed to generate image. Please try again.", "error");
              }
              userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; userInput.focus();
              aiState.isResponding = false;
              sendBtn.innerHTML = aiState.originalSendIcon;
          });
      };

      if (window.generateImage) {
          runGen();
      } else {
          const script = document.createElement('script');
          script.src = "js/image-gen.js";
          script.onload = runGen;
          script.onerror = () => {
              if (requestId !== aiState.currentRequestId) return;
              loadingDiv.remove();
              aiState.loadingDiv = null;
              appendMessage("Error loading image generation module.", "error");
              userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1";
              aiState.isResponding = false;
              sendBtn.innerHTML = aiState.originalSendIcon;
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
        chats.unshift(newChat); activeChatId = newChat.id; localStorage.setItem("activeChatId", activeChatId);
        saveChats(); renderChatList();
      }

      const chat = chats.find(c => c.id === activeChatId);
      const userMsg = { role: "user", text: text };
      chat.messages.push(userMsg);
      renderMessages(); saveChats();

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "message loading-container";
      loadingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span class="loading-text">Analyzing text...</span>`;
      chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;
      aiState.loadingDiv = loadingDiv;

      const runTxtAuth = () => {
          window.authenticateText(textToCheck).then(result => {
              if (requestId !== aiState.currentRequestId) return;
              loadingDiv.remove();
              aiState.loadingDiv = null;
              const botMsg = { role: "ai", text: result };
              chat.messages.push(botMsg);
              saveChats();
              appendMessage(botMsg.text, botMsg.role, true);
              
              userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; userInput.focus();
              aiState.isResponding = false;
              sendBtn.innerHTML = aiState.originalSendIcon;
          });
      };

      if (window.authenticateText) { runTxtAuth(); } 
      else { appendMessage("Text Auth module not loaded.", "error"); loadingDiv.remove(); userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; aiState.isResponding = false; sendBtn.innerHTML = aiState.originalSendIcon; }
      return;
  }

  if (violatesRules(text)) {
    const info = loadBanInfo(); info.consecutiveViolations = (info.consecutiveViolations || 0) + 1; saveBanInfo(info);
    if (info.consecutiveViolations >= 5) { applyBan(); return; }
    return appendMessage('This message violates AI safety and use policies. Please try again.', 'error');
  }

  const info = loadBanInfo(); info.consecutiveViolations = 0; saveBanInfo(info);
  userInput.disabled = true; sendBtn.disabled = false; sendBtn.style.opacity = "1";

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat); activeChatId = newChat.id; localStorage.setItem("activeChatId", activeChatId);
    saveChats(); renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  const userMsg = { role: "user", text: text };
  if (imgSrc) userMsg.imageUrl = imgSrc;
  
  chat.messages.push(userMsg);
  renderMessages(); saveChats();

  if (chat.messages.filter(m => m.role === "user").length === 1) {
    const newTitle = summariseTitle(text);
    typeChatTitle(newTitle, () => { chat.title = newTitle; saveChats(); renderChatList(); updateURL(newTitle); });
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
        const botMsg = await findResponses(text, chat.messages);
        if (requestId !== aiState.currentRequestId) return;

        chat.messages.push(botMsg);
        saveChats();
        appendMessage(botMsg.text, botMsg.role, true); 

        const timeout = !botMsg.text ? 500 : (botMsg.text.length * 30) + 500;
        aiState.resetTimeout = setTimeout(() => { 
            if (requestId !== aiState.currentRequestId) return;
            userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; 
            if (!window.isSpeechLiveModeActive || !window.isSpeechLiveModeActive()) {
                userInput.focus(); 
            }
            aiState.isResponding = false; sendBtn.innerHTML = aiState.originalSendIcon;
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

window.devAccess = function(password) {
    if (password === DEV_PASSWORD) {
        console.log("Developer access granted.");
        isDevMode = true;
        devModalWaiting.style.display = 'none';
        devModalOptions.style.display = 'block';
        updateDevModalStatus();
    } else {
        console.error("Incorrect developer password.");
    }
};

function handleCustomModelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadStatus.textContent = `Reading ${file.name}...`;
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
            uploadStatus.textContent = `Success! Loaded "${newResponses.ver || file.name}". Keys: ${Object.keys(newResponses).length}.`;
            updateDevModalStatus();

        } catch (err) {
            console.error("Custom modal load failed:", err);
            uploadStatus.textContent = `Error: ${err.message}`;
        }
    };

    reader.onerror = function() {
        uploadStatus.textContent = "Error reading file.";
    };

    reader.readAsArrayBuffer(file);
}

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!devModal) return;
        devModal.style.display = 'flex';
        if (isDevMode) { devModalWaiting.style.display = 'none'; devModalOptions.style.display = 'block'; updateDevModalStatus(); } 
        else { devModalWaiting.style.display = 'block'; devModalOptions.style.display = 'none'; }
    }
});

function setupSidebarUI() {
    const sidebar = chatList.parentElement;
    if (!sidebar) return;
    
    sidebar.classList.add('genesis-sidebar');
    
    const toggleSidebar = () => {
        sidebar.classList.toggle('collapsed');
    };

    // Hide original new chat button if it exists
    if (newChatBtn) newChatBtn.style.display = 'none';

    // Create Header
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    
    // Logo
    const logoLink = document.createElement('a');
    logoLink.href = 'https://xpdevs.github.io/Genesis-AI';
    logoLink.className = 'genesis-logo';
    logoLink.innerHTML = `
        <img src="https://xpdevs.github.io/Genesis-AI/icon.png" alt="Genesis">
        <div class="expand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/></svg>
        </div>
        <span>Genesis AI</span>`;
    
    logoLink.onclick = (e) => {
        if (sidebar.classList.contains('collapsed')) {
            e.preventDefault();
            toggleSidebar();
        }
    };
    
    // Controls Container (New Chat + Collapse)
    const controls = document.createElement('div');
    controls.className = 'sidebar-controls';
    
    // New Chat Icon
    const newChatIcon = document.createElement('button');
    newChatIcon.className = 'icon-btn new-chat-icon';
    newChatIcon.title = 'New Chat';
    newChatIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
    newChatIcon.onclick = () => {
        if (newChatBtn) newChatBtn.click();
    };
    
    // Collapse Icon
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'icon-btn collapse-btn';
    collapseBtn.title = 'Toggle Sidebar';
    collapseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/></svg>';
    
    collapseBtn.onclick = toggleSidebar;
    
    controls.appendChild(newChatIcon);
    controls.appendChild(collapseBtn);
    
    header.appendChild(logoLink);
    header.appendChild(controls);
    
    // Search Container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    // Expanded Search Input
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-input-wrapper';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search chats...';
    searchInput.className = 'search-input';
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderChatList();
    });
    
    const searchIcon = document.createElement('div');
    searchIcon.className = 'search-icon-overlay';
    searchIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
    
    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(searchIcon);
    
    // Collapsed Stack (New Chat + Search)
    const collapsedStack = document.createElement('div');
    collapsedStack.className = 'collapsed-stack';

    const collapsedNewChatBtn = newChatIcon.cloneNode(true);
    collapsedNewChatBtn.onclick = () => {
        if (newChatBtn) newChatBtn.click();
        if (sidebar.classList.contains('collapsed')) toggleSidebar();
    };

    const collapsedSearchBtn = document.createElement('button');
    collapsedSearchBtn.className = 'icon-btn collapsed-search-btn';
    collapsedSearchBtn.title = 'Search';
    collapsedSearchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
    collapsedSearchBtn.onclick = () => {
        if (sidebar.classList.contains('collapsed')) toggleSidebar();
        setTimeout(() => searchInput.focus(), 300);
    };

    collapsedStack.appendChild(collapsedNewChatBtn);
    collapsedStack.appendChild(collapsedSearchBtn);

    searchContainer.appendChild(searchWrapper);
    searchContainer.appendChild(collapsedStack);
    
    // Insert at top of sidebar
    sidebar.insertBefore(searchContainer, sidebar.firstChild);
    sidebar.insertBefore(header, sidebar.firstChild);

    // Create Footer
    const footer = document.createElement('div');
    footer.className = 'sidebar-footer';
    if (settingsBtn) footer.appendChild(settingsBtn);
    if (userIcon) footer.appendChild(userIcon);
    sidebar.appendChild(footer);
}

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
if (renameCancel) renameCancel.onclick = () => renameModal.style.display = "none";
if (deleteCancel) deleteCancel.onclick = () => deleteModal.style.display = "none";
if (renameConfirm) renameConfirm.onclick = () => {
  const chat = chats.find(c => c.id === currentRenameId);
  if (chat && renameInput.value.trim()) { chat.title = renameInput.value.trim(); saveChats(); renderChatList(); renderMessages(); updateURL(chat.title); }
  renameModal.style.display = "none";
};
if (deleteConfirm) deleteConfirm.onclick = () => {
    chats = chats.filter(c => c.id !== currentDeleteId);
    if (activeChatId === currentDeleteId) {
        activeChatId = null;
        localStorage.removeItem("activeChatId");
        chatBox.innerHTML = "";
        // After deleting, go to a new chat screen
        let newChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
        if (!newChat) {
            newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
            chats.unshift(newChat);
        }
        activeChatId = newChat.id;
    }
    saveChats(); renderChatList(); renderMessages(); deleteModal.style.display = "none";
};

newChatBtn.onclick = () => {
  if (isReadOnlyMode) return;
  let existingNewChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
  if (existingNewChat) {
      activeChatId = existingNewChat.id;
  } else {
      const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
      chats.unshift(newChat);
      activeChatId = newChat.id;
  }
  localStorage.setItem("activeChatId", activeChatId);
  saveChats(); renderChatList(); renderMessages(); updateURL("New Chat");
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
        const val = userInput.value;
        if (val.endsWith('@')) {
            suggestionBox.innerHTML = `
                <div class="suggestion-item" onclick="userInput.value += 'ImgAuth '; suggestionBox.style.display='none'; userInput.focus();"><span>🔒</span> ImgAuth</div>
                <div class="suggestion-item" onclick="userInput.value += 'img '; suggestionBox.style.display='none'; userInput.focus();"><span>🎨</span> Generate Image</div>
                <div class="suggestion-item" onclick="userInput.value += 'TxtAuth '; suggestionBox.style.display='none'; userInput.focus();"><span>📝</span> Check Text</div>
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
    document.getElementById("modelNameDisplay").textContent = responses.ver || "Genesis-SPT-4.5";
    document.getElementById("modelParamsDisplay").textContent = Object.keys(responses).length;
};
settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.style.display = "none"; };
if (accountModal) accountModal.onclick = e => { if (e.target === accountModal) accountModal.style.display = "none"; };

if (userIcon) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const name = userInfo.name || "User";
    
    if (userInfo.picture) {
        userIcon.textContent = "";
        userIcon.style.background = `url('${userInfo.picture}') center/cover no-repeat`;
    } else {
        userIcon.textContent = name.charAt(0).toUpperCase();
    }

    userIcon.onclick = () => {
        if (accountModal) {
            accountModal.style.display = "flex";
            const currentInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
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
}

if (modelSelect) {
    modelSelect.value = jsonURL;
    modelSelect.onchange = () => {
        const selectedValue = modelSelect.value;
        if (selectedValue !== jsonURL) {
            document.getElementById("refreshWarningModal").style.display = "flex";
        }
    };
}
document.getElementById("refreshConfirm").onclick = () => {
    const selectedValue = modelSelect.value;
    localStorage.setItem("selectedModel", selectedValue);
    window.location.reload();
};
document.getElementById("refreshCancel").onclick = () => {
    document.getElementById("refreshWarningModal").style.display = "none";
    modelSelect.value = jsonURL;
};

function applyTheme() {
    // Default to auto if not set, unless legacy theme exists
    if (localStorage.getItem("autoTheme") === null) {
        localStorage.setItem("autoTheme", localStorage.getItem("theme") === null ? "true" : "false");
    }
    
    const isAuto = localStorage.getItem("autoTheme") === "true";
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
        isDark = localStorage.getItem("theme") === "dark";
    }
    
    if (themeToggle) themeToggle.checked = isDark;
    document.body.classList.toggle("dark", isDark);
}

applyTheme();
if (autoThemeToggle) autoThemeToggle.onchange = () => { localStorage.setItem("autoTheme", autoThemeToggle.checked); if (!autoThemeToggle.checked) localStorage.setItem("theme", themeToggle.checked ? "dark" : "light"); applyTheme(); };
if (themeToggle) themeToggle.onchange = () => { document.body.classList.toggle("dark", themeToggle.checked); localStorage.setItem("theme", themeToggle.checked ? "dark" : "light"); };

const deleteAllBtn = document.getElementById("deleteAllChatsBtn");
if (deleteAllBtn) {
    deleteAllBtn.onclick = () => document.getElementById("deleteAllModal").style.display = "flex";
}
document.getElementById("deleteAllCancel").onclick = () => document.getElementById("deleteAllModal").style.display = "none";
document.getElementById("deleteAllConfirm").onclick = () => { chats = []; localStorage.removeItem("chats"); localStorage.removeItem("activeChatId"); activeChatId = null; renderChatList(); chatBox.innerHTML = ""; document.getElementById("deleteAllModal").style.display = "none"; };

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
document.getElementById("deleteAccountConfirm").onclick = () => { 
    if (window.google && window.google.accounts) google.accounts.id.disableAutoSelect();
    localStorage.clear(); 
    window.location.reload(); 
};

// --- Account Management & Google Sign-In ---

function updateUserProfile(newName, newPicture) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    userInfo.name = newName;
    if (newPicture) userInfo.picture = newPicture;
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    
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
    editNameBtn.onclick = () => {
        const currentName = document.getElementById("accountName").textContent;
        const newName = prompt("Enter your name:", currentName);
        if (newName && newName.trim() !== "") {
            updateUserProfile(newName.trim());
        }
    };
}

window.handleGoogleCredentialResponse = function(response) {
    try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        if (payload.name) {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            userInfo.googleId = payload.sub;
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            
            updateUserProfile(payload.name, payload.picture);
            
            const container = document.getElementById("googleSignInContainer");
            if (container) container.style.display = "none";
        }
    } catch (e) { console.error("Error parsing Google credential", e); }
}

function initGoogleSignIn() {
    const container = document.getElementById("googleSignInContainer");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    
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

function startApp() {
    if (isCurrentlyBanned()) {
        showBanModal();
        return;
    }
    
    if (loadSharedChat()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const chatCode = urlParams.get("c");
    if (chatCode) {
        const chatByCode = chats.find(c => c.urlCode === chatCode);
        if (chatByCode) {
            activeChatId = chatByCode.id;
            localStorage.setItem("activeChatId", activeChatId);
        }
    }

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        // Desktop: Always start with a New Chat
        let newChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
        if (!newChat) {
            newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
            chats.unshift(newChat);
            saveChats();
        }
        activeChatId = newChat.id;
        localStorage.setItem("activeChatId", activeChatId);
    } else {
        // Mobile: Load last active chat or create new if none exists
        if (activeChatId && !chats.find(c => c.id === activeChatId)) activeChatId = null;
        
        if (!activeChatId && chats.length > 0) {
            activeChatId = chats[0].id;
            localStorage.setItem("activeChatId", activeChatId);
        }
        if (!activeChatId && chats.length === 0) {
            const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
            chats.unshift(newChat);
            activeChatId = newChat.id;
            saveChats();
            localStorage.setItem("activeChatId", activeChatId);
        }
    }
    renderChatList();
    renderMessages();
}

window.addEventListener('app-ready', startApp);

(function() {
  if (localStorage.getItem("SETUP") !== "FLAG_TRUE" || !localStorage.getItem("userInfo")) {
    window.location.href = "https://xpdevs.github.io/Genesis-AI/legal/setup.html";
    return;
  }
  initializeApp();
})();
