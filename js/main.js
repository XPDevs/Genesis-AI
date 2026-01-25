(function() {
  if (localStorage.getItem("SETUP") !== "FLAG_TRUE") {
    window.location.href = "https://xpdevs.github.io/Genesis-AI/legal/setup.html";
    return;
  }
  console.log("Genesis Core: Environment Ready.");
})();

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

// State
let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let activeChatId = localStorage.getItem("activeChatId");
let responses = {};
let currentRenameId = null;
let currentDeleteId = null;
let isReadOnlyMode = false; 
let isImageGenMode = localStorage.getItem("isImageGenMode") === "true";
let imageResponses = {};
const imageModelURL = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-4.5-image-250126P0137M.bin";

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

// --- BINARY DECODER ---
const defaultModel = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-4.5-240126P1105M.bin";
const jsonURL = localStorage.getItem("selectedModel") || defaultModel;

function decodeBinary(buffer) {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    const XOR_KEY = 0xAA; 
    const decoder = new TextDecoder('utf-8');
    let jsonString = "";
    let i = 0;
    try {
        const sig = view.getUint32(0, true);
        if (sig === 0x53494E47) i = 4;
    } catch (e) { i = 0; }

    while (i < bytes.length) {
        const b = bytes[i];
        switch(b) {
            case 0x01: jsonString += "{"; break;
            case 0x02: jsonString += "}"; break;
            case 0x03: jsonString += ":"; break;
            case 0x04: if (i + 1 < bytes.length && bytes[i + 1] !== 0x02 && bytes[i + 1] !== 0x06) jsonString += ","; break;
            case 0x05: jsonString += "["; break;
            case 0x06: jsonString += "]"; break;
            case 0x07:
                i++; let start = i;
                while (i < bytes.length && bytes[i] !== 0x00) i++;
                const chunk = bytes.slice(start, i);
                const decrypted = new Uint8Array(chunk.length);
                for (let j = 0; j < chunk.length; j++) decrypted[j] = chunk[j] ^ XOR_KEY;
                jsonString += '"' + decoder.decode(decrypted) + '"';
                break;
        }
        i++;
    }
    return jsonString.trim();
}

fetch(jsonURL + "?v=" + Date.now())
  .then(r => r.ok ? r.arrayBuffer() : Promise.reject("File not found"))
  .then(buffer => {
    try {
      const decoded = decodeBinary(buffer);
      responses = JSON.parse(decoded);
    } catch (e) {
      const rawText = new TextDecoder().decode(buffer).trim();
      responses = JSON.parse(rawText);
    }
  }).catch(err => console.error(err));

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

function injectImageStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        .genesis-image-container { width: 100%; max-width: 400px; aspect-ratio: 1/1; border-radius: 16px; margin: 10px 0; overflow: hidden; background: #111; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .genesis-image-container iframe { width: 100%; height: 100%; border: none; }
    `;
    document.head.appendChild(style);
}

function renderMessages() {
  const chat = chats.find(c => c.id === activeChatId);
  chatTitle.textContent = chat ? chat.title : "New Chat";
  chatBox.innerHTML = "";
  if (!chat) return;
  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false));
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(text, role, isNew = false) {
  const div = document.createElement("div");
  div.className = "message " + role;
  const textSpan = document.createElement("span");

  // THE FIX: Check if the AI returned an iframe (Image)
  if (role === "ai" && text.includes("<iframe")) {
      const container = document.createElement("div");
      container.className = "genesis-image-container";
      container.innerHTML = text; // Safe rendering of our own generated iframe
      div.appendChild(container);
      
      // Remove loading indicator if it exists
      const loader = chatBox.querySelector('.loading-container');
      if (loader) loader.remove();
  } else {
      div.appendChild(textSpan);
      
      if (role === "ai" && isNew) {
        let i = 0;
        const interval = setInterval(() => {
          textSpan.textContent += text[i]; i++;
          chatBox.scrollTop = chatBox.scrollHeight;
          if (i === text.length) clearInterval(interval);
        }, 30);
      } else { textSpan.textContent = text; }
  }

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "msg-actions";
  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn copy-btn";
  copyBtn.innerHTML = '📋';
  copyBtn.onclick = () => navigator.clipboard.writeText(text);
  actionsDiv.appendChild(copyBtn);

  if (role === "ai") {
    const speakBtn = document.createElement("button");
    speakBtn.className = "action-btn speak-btn";
    speakBtn.innerHTML = '🔊';
    speakBtn.onclick = () => window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    actionsDiv.appendChild(speakBtn);
  }

  div.appendChild(actionsDiv);
  chatBox.append(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- LOGIC MODULES ---
function genesisLoadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src; script.async = true;
        script.onload = () => resolve(); script.onerror = () => reject();
        document.head.appendChild(script);
    });
}

async function handleImageRequest(text) {
    try {
        if (typeof window.generateImageResponse === 'undefined') await genesisLoadScript('js/image-gen.js');
        if (Object.keys(imageResponses).length === 0) {
            const res = await fetch(imageModelURL + "?v=" + Date.now());
            const buffer = await res.arrayBuffer();
            try { imageResponses = JSON.parse(decodeBinary(buffer)); } 
            catch { imageResponses = JSON.parse(new TextDecoder().decode(buffer)); }
        }
        if (text === 'pre-load') return null;
        return window.generateImageResponse(text, imageResponses);
    } catch (e) { return { role: "error", text: "Image Module Error: " + e.message }; }
}

function summariseTitle(text) { return text.split(" ").slice(0, 4).join(" "); }

function findResponses(input) {
  const lowerInput = input.toLowerCase();
  const sortedKeys = Object.keys(responses).sort((a, b) => b.length - a.length);
  const found = [];
  let temp = lowerInput;
  sortedKeys.forEach(k => {
    if (temp.includes(k.toLowerCase())) {
        found.push(responses[k]);
        temp = temp.replace(k.toLowerCase(), "");
    }
  });
  if (found.length === 0) return { role: "ai", text: "I'm not quite sure. Tell me more." };
  return { role: "ai", text: found.join(", ") };
}

async function sendMessage() {
  if (isReadOnlyMode || isCurrentlyBanned()) return;
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";
  userInput.disabled = true; sendBtn.disabled = true;

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat); activeChatId = newChat.id; saveChats(); renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ role: "user", text: text });
  renderMessages();

  const isImageRequest = isImageGenMode || text.toLowerCase().includes("image");
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message loading-container";
  loadingDiv.innerHTML = `<span class="loading-text">${isImageRequest ? 'Generating...' : 'Thinking...'}</span>`;
  chatBox.append(loadingDiv);

  setTimeout(async () => {
      let botMsg = isImageRequest ? await handleImageRequest(text) : findResponses(text);
      if (!isImageRequest) loadingDiv.remove();
      chat.messages.push(botMsg);
      saveChats();
      appendMessage(botMsg.text, botMsg.role, true);
      userInput.disabled = false; sendBtn.disabled = false; userInput.focus();
  }, 1000);
}

// --- INITIALIZATION ---
window.addEventListener('load', () => {
  injectImageStyles();
  if (isImageGenMode) {
      chatTitle.textContent = "Image Generation";
      userInput.placeholder = "Describe an image...";
      handleImageRequest("pre-load");
  }
  renderChatList(); renderMessages();
});

sendBtn.onclick = sendMessage;
userInput.onkeypress = e => e.key === "Enter" && sendMessage();
newChatBtn.onclick = () => {
    activeChatId = Date.now().toString();
    chats.unshift({ id: activeChatId, title: "New Chat", messages: [] });
    saveChats(); renderChatList(); renderMessages();
};
