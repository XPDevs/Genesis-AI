(function() {
  if (localStorage.getItem("SETUP") !== "FLAG_TRUE") {
    window.location.href = "https://xpdevs.github.io/Genesis-AI/legal/setup.html";
    return;
  }

  if (!localStorage.getItem("userInfo")) {
    window.addEventListener('DOMContentLoaded', ensureSetupModal);
  } else {
    initializeApp();
  }
})();

function initializeApp() {
    console.log("Genesis Core: Environment Ready.");
    window.dispatchEvent(new Event('app-ready'));
}

function ensureSetupModal() {
    let existing = document.getElementById('setupModal');
    if (existing) return existing;
    const modal = document.createElement('div');
    modal.id = 'setupModal';
    Object.assign(modal.style, {
        position: 'fixed', inset: '0', display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)', zIndex: '999999999', padding: '20px',
    });
    modal.innerHTML = `
        <div style="max-width:400px;width:100%;background:var(--bg, #fff);padding:24px;border-radius:12px;text-align:center;font-family:Arial, sans-serif;color:var(--text, #222);box-shadow:0 0 25px rgba(0,0,0,0.5);">
            <h2 style="margin-top:0;">Welcome to Genesis-AI</h2>
            <p style="margin:8px 0 18px;">Please enter your name to get started.</p>
            <input id="setupNameInput" type="text" placeholder="Your full name" style="width: calc(100% - 20px); padding: 10px; margin-bottom: 15px; border: 1px solid var(--border, #ccc); border-radius: 8px; font-size: 1rem; background: var(--input-bg, #f0f4f9); color: var(--text, #222);">
            <button id="setupConfirmBtn" style="width: 100%; padding: 12px; border: none; background-color: var(--primary, #1a73e8); color: white; border-radius: 8px; font-size: 1rem; cursor: pointer;">Continue</button>
        </div>
    `;
    document.body.appendChild(modal);

    const nameInput = document.getElementById('setupNameInput');
    const confirmBtn = document.getElementById('setupConfirmBtn');

    const completeSetup = () => {
        const name = nameInput.value.trim();
        if (name) {
            localStorage.setItem('userInfo', JSON.stringify({ name: name }));
            modal.style.display = 'none';
            initializeApp();
        } else {
            nameInput.style.borderColor = 'red';
        }
    };

    confirmBtn.onclick = completeSetup;
    nameInput.addEventListener('keypress', (e) => e.key === 'Enter' && completeSetup());
    return modal;
}

// UI Elements
const chatList = document.getElementById("chatList");
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const themeToggle = document.getElementById("themeToggle");
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
let isDevMode = false;
const DEV_PASSWORD = "7v#K9!mP2@zR5*qX";

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
  Object.assign(modal.style, {
    position: 'fixed', inset: '0', display: 'none', justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: '999999999', padding: '20px', pointerEvents: 'all'
  });
  modal.innerHTML = `
    <div id="banModalCard" style="max-width:520px;width:100%;background:#fff;padding:18px;border-radius:12px;text-align:center;font-family:Arial, sans-serif;color:#222;box-shadow:0 0 25px rgba(0,0,0,0.5);">
      <h2 id="banModalTitle">You have been banned</h2>
      <p id="banModalMessage">Reason: multiple violations of terms of service.</p>
      <p id="banModalCountdown" style="font-size:1.1rem;margin:14px 0 8px;">Time left: calculating...</p>
      <p style="margin:8px 0 18px;">Read our <a id="banTosLink" href="https://xpdevs.github.io/Genesis-AI/legal/terms-of-service" target="_blank" rel="noopener">Terms of Service</a> for details.</p>
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
            console.log("Genesis-AI: Valid Binary Signature detected.");
        } else {
            console.warn("Genesis-AI: Signature mismatch, attempting skip-less parse.");
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
  .then(r => r.ok ? r.arrayBuffer() : Promise.reject("File not found"))
  .then(buffer => {
    try {
      const decoded = decodeBinary(buffer);
      
      // Safety: Ensure the result is valid JSON before parsing
      if (!decoded || (!decoded.startsWith("{") && !decoded.startsWith("["))) {
          throw new Error("Reconstructed string is not valid JSON.");
      }
      
      responses = JSON.parse(decoded);
      console.log("Genesis-AI: SPT-4.5 Binary active.");
    } catch (e) {
      console.warn("Binary reconstruction failed: " + e.message);
      
      // Fallback: Check if the file was just raw JSON all along
      try {
          const rawText = new TextDecoder().decode(buffer).trim();
          responses = JSON.parse(rawText);
          console.log("Genesis-AI: Raw JSON Fallback successful.");
      } catch (innerErr) {
          throw new Error("Critical: File is neither valid Genesis-AI Binary nor JSON.");
      }
    }
  })
  .catch(err => {
    console.error("Critical Reconstruction Error:", err);
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
  url.searchParams.set("chat", chatTitle);
  history.pushState({}, "", url);
}

function renderChatList() {
  if (isReadOnlyMode) return;
  chatList.innerHTML = "";
  chats.forEach(chat => {
    const li = document.createElement("li");
    li.className = "chat-item" + (chat.id === activeChatId ? " active" : "");
    const span = document.createElement("span");
    span.textContent = chat.title;
    span.className = "chat-name";
    const options = document.createElement("div");
    options.className = "chat-options";
    const dots = document.createElement("button");
    dots.textContent = "⋮";
    dots.className = "dots-btn";
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";

    renameBtn.onclick = e => { e.stopPropagation(); currentRenameId = chat.id; renameInput.value = chat.title; renameModal.style.display = "flex"; dropdown.style.display = "none"; };
    deleteBtn.onclick = e => { e.stopPropagation(); currentDeleteId = chat.id; deleteModal.style.display = "flex"; dropdown.style.display = "none"; };
    shareBtn.onclick = e => { e.stopPropagation(); showShareModal(chat.id); dropdown.style.display = "none"; };
    dots.onclick = e => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex"; };

    dropdown.append(renameBtn, deleteBtn, shareBtn);
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
  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false));
  chatBox.scrollTop = chatBox.scrollHeight;
  if (chat) updateURL(chat.title);
  updateChatView();
}

function appendMessage(text, role, isNew = false) {
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

  const div = document.createElement("div");
  div.className = "message " + role;
  const textSpan = document.createElement("span");
  div.appendChild(textSpan);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "msg-actions";
  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn copy-btn";
  copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  copyBtn.onclick = () => navigator.clipboard.writeText(processedText);
  actionsDiv.appendChild(copyBtn);

  if (role === "ai") {
    const speakBtn = document.createElement("button");
    speakBtn.className = "action-btn speak-btn";
    speakBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    speakBtn.onclick = () => { if (window.speechSynthesis.speaking) window.speechSynthesis.cancel(); else window.speechSynthesis.speak(new SpeechSynthesisUtterance(processedText)); };
    actionsDiv.appendChild(speakBtn);
    const existingLatest = chatBox.querySelectorAll('.message.ai.latest');
    existingLatest.forEach(el => el.classList.remove('latest'));
    div.classList.add('latest');
  }

  div.appendChild(actionsDiv);
  chatBox.append(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (role === "ai" && isNew) {
    let i = 0;
    const interval = setInterval(() => {
      textSpan.textContent += processedText[i]; i++;
      chatBox.scrollTop = chatBox.scrollHeight;
      if (i === processedText.length) clearInterval(interval);
    }, 30);
  } else { textSpan.textContent = processedText; }
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

function typeChatTitle(newTitle, callback) {
  chatTitle.textContent = ""; let i = 0;
  const interval = setInterval(() => {
    chatTitle.textContent += newTitle[i]; i++;
    if (i === newTitle.length) { clearInterval(interval); callback && callback(); }
  }, 70);
}

function findResponses(input, history) {
  const lowerInput = input.toLowerCase();
  
  // XPDevs Logic: Priority on Kernels and System info
  if (lowerInput.includes("kernel")) {
      return { role: "ai", text: "XPDevs utilizes custom kernels, primarily NexShell, which is a highly optimized x86 kernel based on basekernel." };
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

  if (foundMatches.length === 0) return { role: "ai", text: "I’m not quite sure I follow. Could you give me a bit more detail?" };
  const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
  if (orderedMessages.length === 1) return { role: "ai", text: orderedMessages[0] };
  const last = orderedMessages.pop();
  return { role: "ai", text: orderedMessages.join(", ") + " and " + last };
}

function sendMessage() {
  if (isReadOnlyMode) return;
  if (isCurrentlyBanned()) { showBanModal(); return; }
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  if (violatesRules(text)) {
    const info = loadBanInfo(); info.consecutiveViolations = (info.consecutiveViolations || 0) + 1; saveBanInfo(info);
    if (info.consecutiveViolations >= 5) { applyBan(); return; }
    return appendMessage('This message violates AI safety and use policies. Please try again.', 'error');
  }

  const info = loadBanInfo(); info.consecutiveViolations = 0; saveBanInfo(info);
  userInput.disabled = true; sendBtn.disabled = true; sendBtn.style.opacity = "0.5";

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat); activeChatId = newChat.id; localStorage.setItem("activeChatId", activeChatId);
    saveChats(); renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ role: "user", text: text });
  renderMessages(); saveChats();

  if (chat.messages.filter(m => m.role === "user").length === 1) {
    const newTitle = summariseTitle(text);
    typeChatTitle(newTitle, () => { chat.title = newTitle; saveChats(); renderChatList(); updateURL(newTitle); });
  }

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message loading-container";
  loadingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div><span class="loading-text">Thinking...</span>`;
  chatBox.append(loadingDiv); chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        loadingDiv.remove();
        const botMsg = findResponses(text, chat.messages);

        chat.messages.push(botMsg);
        saveChats();
        appendMessage(botMsg.text, botMsg.role, true); 

        const timeout = !botMsg.text ? 500 : (botMsg.text.length * 30) + 500;
        setTimeout(() => { userInput.disabled = false; sendBtn.disabled = false; sendBtn.style.opacity = "1"; userInput.focus(); }, timeout);
    }, 1500);
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

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
settingsBtn.onclick = () => {
    settingsModal.style.display = "flex";
    document.getElementById("modelNameDisplay").textContent = responses.ver || "Genesis-SPT-4.5";
    document.getElementById("modelParamsDisplay").textContent = Object.keys(responses).length;
};
settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.style.display = "none"; };

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

themeToggle.checked = localStorage.getItem("theme") === "dark";
document.body.classList.toggle("dark", themeToggle.checked);
themeToggle.onchange = () => { document.body.classList.toggle("dark", themeToggle.checked); localStorage.setItem("theme", themeToggle.checked ? "dark" : "light"); };

const deleteAllBtn = document.getElementById("deleteAllChatsBtn");
if (deleteAllBtn) {
    deleteAllBtn.onclick = () => document.getElementById("deleteAllModal").style.display = "flex";
}
document.getElementById("deleteAllCancel").onclick = () => document.getElementById("deleteAllModal").style.display = "none";
document.getElementById("deleteAllConfirm").onclick = () => { chats = []; localStorage.removeItem("chats"); localStorage.removeItem("activeChatId"); activeChatId = null; renderChatList(); chatBox.innerHTML = ""; document.getElementById("deleteAllModal").style.display = "none"; };
function startApp() {
    if (isCurrentlyBanned()) {
        showBanModal();
        return;
    }
    if (!loadSharedChat()) {
        let newChat = chats.find(c => c.title === "New Chat" && c.messages.length === 0);
        if (!newChat) {
            newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
            chats.unshift(newChat);
            saveChats();
        }
        activeChatId = newChat.id;
        localStorage.setItem("activeChatId", activeChatId);
    }
    renderChatList();
    renderMessages();
}

window.addEventListener('app-ready', startApp);
