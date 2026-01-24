(function() {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  const handshakeCode = "9980748324";
  const mobileURL = "https://xpdevs.github.io/Genesis-AI/mobile/unspported";

  // 1. Primary Environment Check
  if (isMobile) {
    // If code is MISSING or WRONG on mobile, redirect to mobile landing
    if (window.GENESIS_CODE !== handshakeCode) {
      window.location.href = mobileURL;
      return; 
    }
    // If code matches, continue normal execution on mobile
    console.log("Genesis Mobile: Handshake Verified.");
  } else {
    // Desktop: Continue normally without code check
    console.log("Genesis Desktop: Verified.");
  }

  // 2. Setup Flag Check
  if (localStorage.getItem("SETUP") !== "FLAG_TRUE") {
    window.location.href = "https://xpdevs.github.io/Genesis-AI/legal/setup.html";
    return;
  }

  console.log("Genesis Core: Environment Ready.");
})();

const chatList = document.getElementById("chatList");
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const themeToggle = document.getElementById("themeToggle");
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

let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let activeChatId = localStorage.getItem("activeChatId");
let responses = {};
let currentRenameId = null;
let currentDeleteId = null;
let isReadOnlyMode = false; 

const CHAR_SEPARATOR = '000'; 
const ROLE_SEPARATOR = '555'; 
const MSG_SEPARATOR = '9999'; 

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
    const newChat = {
        id: Date.now().toString(),
        title: newChatTitle,
        messages: messages
    };

    chats.unshift(newChat);
    activeChatId = newChat.id;
    localStorage.setItem("activeChatId", activeChatId);
    saveChats();
    renderChatList();
    renderMessages();
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
  modal.addEventListener('click', (e) => e.stopPropagation());
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
      liftBan();
      document.body.style.pointerEvents = 'auto';
      return;
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

const jsonURL = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT.bin";

async function loadAndReconstruct() {
    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("Failed to fetch binary.");
        
        const buffer = await response.arrayBuffer();
        const result = decodeBinary(buffer);
        
        // result is now a clean JSON string
        return JSON.parse(result);
    } catch (err) {
        console.error("XPDevs Reconstruct Error:", err);
    }
}

function decodeBinary(buffer) {
    const bytes = new Uint8Array(buffer);
    const XOR_KEY = 0xAA;
    const decoder = new TextDecoder('utf-8'); // Ensures dashes and quotes show correctly
    
    // Skip the 4-byte signature (0-3)
    let jsonString = "";
    let i = 4; 

    while (i < bytes.length) {
        const b = bytes[i];

        // Structural Tokens matching your C compiler
        switch(b) {
            case 0x01: jsonString += "{"; break;
            case 0x02: jsonString += "}"; break;
            case 0x03: jsonString += ":"; break;
            case 0x04: jsonString += ","; break;
            case 0x05: jsonString += "["; break;
            case 0x06: jsonString += "]"; break;
            case 0x07: // String Start Marker
                jsonString += '"';
                i++; 
                
                let stringBytes = [];
                // Read until we hit the 0x00 null terminator
                while (i < bytes.length && bytes[i] !== 0x00) {
                    stringBytes.push(bytes[i] ^ XOR_KEY);
                    i++;
                }
                
                // Convert the XORed byte array into a proper UTF-8 string
                jsonString += decoder.decode(new Uint8Array(stringBytes));
                jsonString += '"';
                break;
            case 0x00:
                // Skip stray null terminators outside of string blocks
                break;
        }
        i++;
    }
    return jsonString;
}

function showLegacyModal() {
  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "20000"
  });
  
  const content = document.createElement("div");
  Object.assign(content.style, {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    maxWidth: "300px",
    fontFamily: "sans-serif",
    color: "#333"
  });
  
  content.innerHTML = `
    <h3 style="margin-top:0;">Model Error</h3>
    <p>Failed to load the primary modal. Switched to Legacy Mode.</p>
    <button id="closeLegacyModal" style="padding:8px 16px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">OK</button>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  document.getElementById("closeLegacyModal").onclick = () => modal.remove();
}

fetch(jsonURL + "?v=" + Date.now())
  .then(r => r.ok ? r.arrayBuffer() : Promise.reject("File not found"))
  .then(buffer => {
    try {
      responses = JSON.parse(decodeBinary(buffer));
      console.log("Using binary modal");
    } catch (e) {
      try {
        const text = new TextDecoder().decode(buffer);
        responses = JSON.parse(text);
        console.log("Using JSON modal");
      } catch (err) {
        throw new Error("Invalid Modal Format");
      }
    }
  })
  .catch(err => {
    console.log("Using legacy modal");
    fetch("https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json?v=" + Date.now())
      .then(r => r.ok ? r.json() : Promise.reject("Legacy file not found"))
      .then(data => { 
        responses = data; 
        showLegacyModal();
      })
      .catch(e => appendMessage(`Failed to load data: ${e}`, "error"));
  });

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
    // Added 'active' class logic and standard chat-item class
    li.className = "chat-item" + (chat.id === activeChatId ? " active" : "");
    
    const span = document.createElement("span");
    span.textContent = chat.title;
    span.className = "chat-name";

    const options = document.createElement("div");
    options.className = "chat-options";

    // This is the specific button you wanted to fix
    const dots = document.createElement("button");
    dots.textContent = "⋮";
    dots.className = "dots-btn"; // Assigned class for custom CSS styling

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";
    
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";

    // Button Actions
    renameBtn.onclick = e => { 
      e.stopPropagation(); 
      currentRenameId = chat.id; 
      renameInput.value = chat.title; 
      renameModal.style.display = "flex"; 
      dropdown.style.display = "none"; 
    };
    
    deleteBtn.onclick = e => { 
      e.stopPropagation(); 
      currentDeleteId = chat.id; 
      deleteModal.style.display = "flex"; 
      dropdown.style.display = "none"; 
    };
    
    shareBtn.onclick = e => { 
      e.stopPropagation(); 
      showShareModal(chat.id); 
      dropdown.style.display = "none"; 
    };

    // Toggle Dropdown
    dots.onclick = e => { 
      e.stopPropagation(); 
      // Toggle display between none and flex
      const isVisible = dropdown.style.display === "flex";
      dropdown.style.display = isVisible ? "none" : "flex"; 
    };

    // Assemble components
    dropdown.append(renameBtn, deleteBtn, shareBtn);
    options.append(dots, dropdown);

    // Sidebar selection logic
    li.onclick = () => {
      activeChatId = chat.id;
      localStorage.setItem("activeChatId", activeChatId);
      renderChatList(); 
      renderMessages(); 
      updateURL(chat.title);
    };

    li.append(span, options);
    chatList.append(li);
  });
}

function renderMessages() {
  if (isReadOnlyMode) return;
  const chat = chats.find(c => c.id === activeChatId);
  chatTitle.textContent = chat ? chat.title : "New Chat";
  chatBox.innerHTML = "";
  if (!chat) return;
  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false));
  chatBox.scrollTop = chatBox.scrollHeight;
  if (chat) updateURL(chat.title);
}

function appendMessage(text, role, isNew = false) {
  let finalString = (text && typeof text === 'object') ? (text.text || text.message || JSON.stringify(text)) : String(text || "");

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); 
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayStr = dayNames[now.getDay()];
  const yearStr = now.getFullYear().toString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-GB');

  let processedText = finalString.replace(/%DATE%/g, dateStr).replace(/%TIME%/g, timeStr)
    .replace(/%DAY%/g, dayStr).replace(/%YEAR%/g, yearStr)
    .replace(/%TOMORROW%/g, tomorrowStr);

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
    speakBtn.onclick = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      } else {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(processedText));
      }
    };
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
      textSpan.textContent += processedText[i];
      i++;
      chatBox.scrollTop = chatBox.scrollHeight;
      if (i === processedText.length) clearInterval(interval);
    }, 30);
  } else {
    textSpan.textContent = processedText;
  }
}

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
  chatTitle.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    chatTitle.textContent += newTitle[i];
    i++;
    if (i === newTitle.length) { clearInterval(interval); callback && callback(); }
  }, 70);
}

function findResponses(input, history) {
  const lowerInput = input.toLowerCase();

  // --- NEW DYNAMIC LOGIC START ---
  
  // 1. Past Dates: "What date was it 5 days ago"
  const daysAgoMatch = lowerInput.match(/what date was it (\d+) days ago/);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1]);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return { role: "ai", text: `It was ${d.toLocaleDateString('en-GB')}.` };
  }

  // 2. Days Until: "How many days until 25/12/2026"
  const untilMatch = lowerInput.match(/(?:how many days|what day) until (.+)/);
  if (untilMatch) {
    let targetStr = untilMatch[1].replace("?", "").trim();
    let targetDate;
    // Basic date parsing (DD/MM/YYYY or YYYY-MM-DD)
    if (targetStr.includes("/")) {
        const [d, m, y] = targetStr.split("/");
        targetDate = new Date(`${y}-${m}-${d}`);
    } else {
        targetDate = new Date(targetStr);
    }
    
    if (!isNaN(targetDate.getTime())) {
        const now = new Date();
        now.setHours(0,0,0,0);
        targetDate.setHours(0,0,0,0);
        const diff = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
        
        if (diff > 0) return { role: "ai", text: `There are ${diff} days until ${targetStr}.` };
        if (diff === 0) return { role: "ai", text: "That is today!" };
        return { role: "ai", text: `That date was ${Math.abs(diff)} days ago.` };
    }
  }

  // 3. Time Offset: "What time is it in 5 hours" or "What time was it 5 minutes ago"
  const futureTime = lowerInput.match(/what time .+in (\d+) (hour|minute|second)s?/);
  const pastTime = lowerInput.match(/what time .+ (\d+) (hour|minute|second)s? ago/);
  
  if (futureTime || pastTime) {
      const match = futureTime || pastTime;
      const isFuture = !!futureTime;
      const amount = parseInt(match[1]);
      const unit = match[2];
      
      const d = new Date();
      let ms = 0;
      if (unit.startsWith("hour")) ms = amount * 3600000;
      else if (unit.startsWith("minute")) ms = amount * 60000;
      else ms = amount * 1000;
      
      const target = new Date(d.getTime() + (isFuture ? ms : -ms));
      return { role: "ai", text: `The time ${isFuture ? "will be" : "was"}: ${target.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}` };
  }

  // --- NEW DYNAMIC LOGIC END ---

  const foundMatches = [];

  // Sort keys by length, longest first, to prioritize specific matches
  const sortedKeys = Object.keys(responses).sort((a, b) => b.length - a.length);

  let tempInput = lowerInput;

  sortedKeys.forEach(key => {
    const lowerKey = key.toLowerCase();
    let index = tempInput.indexOf(lowerKey);
    while (index !== -1) {
      foundMatches.push({
        text: responses[key],
        index: index
      });
      // Blank out the matched part of the string so it's not matched again by a shorter key
      tempInput = tempInput.substring(0, index) + ' '.repeat(lowerKey.length) + tempInput.substring(index + lowerKey.length);
      // Look for the next occurrence in the modified string
      index = tempInput.indexOf(lowerKey);
    }
  });

  if (foundMatches.length === 0) {
    return { role: "ai", text: "I can't find a direct response for that, but I'm learning! Try asking about something I know." };
  }

  // Sort the found matches by their original position in the input string
  const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);

  // Handle %SUMMARY_SENT% check within multi-responses
  const isSummaryTriggered = orderedMessages.some(m => m === "%SUMMARY_SENT%");
  if (isSummaryTriggered && typeof window.summariseConversation === "function") {
    const context = history ? history.map(m => m.text).join(" ") : input;
    return { role: "ai", text: window.summariseConversation(context) };
  }

  // Combine multiple answers with grammar logic
  if (orderedMessages.length === 1) {
    return { role: "ai", text: orderedMessages[0] };
  } else {
    // Join with commas and "and" for the last item
    const last = orderedMessages.pop();
    const joined = orderedMessages.join(", ") + " and " + last;
    return { role: "ai", text: joined };
  }
}

function sendMessage() {
  if (isReadOnlyMode) return;
  if (isCurrentlyBanned()) { showBanModal(); return; }

  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  if (violatesRules(text)) {
    const info = loadBanInfo();
    info.consecutiveViolations = (info.consecutiveViolations || 0) + 1;
    saveBanInfo(info);
    if (info.consecutiveViolations >= 5) { applyBan(); return; }
    return appendMessage('This message violates AI safety and use policies. Please try again.', 'error');
  }

  const info = loadBanInfo();
  info.consecutiveViolations = 0;
  saveBanInfo(info);

  userInput.disabled = true;
  sendBtn.disabled = true;
  sendBtn.style.opacity = "0.5";

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat);
    activeChatId = newChat.id;
    localStorage.setItem("activeChatId", activeChatId);
    saveChats();
    renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ role: "user", text: text });
  renderMessages();
  saveChats();

  if (chat.messages.filter(m => m.role === "user").length === 1) {
    const newTitle = summariseTitle(text);
    typeChatTitle(newTitle, () => {
      chat.title = newTitle;
      saveChats(); renderChatList(); updateURL(newTitle);
    });
  }

// 1. Create and inject the styles
const style = document.createElement('style');
style.textContent = `
  .loading-container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-radius: 20px;
    background: #f0f0f0;
    width: fit-content;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 10px 0;
  }

  /* Supports dark mode automatically */
  @media (prefers-color-scheme: dark) {
    .loading-container {
      background: #2a2a2a;
    }
    .loading-text { color: #bbb !important; }
  }

  .typing-dots {
    display: flex;
    gap: 4px;
  }

  .typing-dots span {
    width: 6px;
    height: 6px;
    background: #888;
    border-radius: 50%;
    animation: aiPulse 1.4s infinite ease-in-out both;
  }

  .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes aiPulse {
    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
    40% { transform: scale(1.0); opacity: 1; }
  }

  .loading-text {
    font-size: 14px;
    color: #555;
    font-weight: 500;
  }
`;
document.head.appendChild(style);

// 2. Create the element
const loadingDiv = document.createElement("div");
loadingDiv.className = "message loading-container";
loadingDiv.innerHTML = `
  <div class="typing-dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <span class="loading-text">Thinking...</span>
`;

  chatBox.append(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    loadingDiv.remove();
    let botMsg;

    if (text.toLowerCase().startsWith("please summarise")) {
      const dataToSummarise = text.substring(16).trim();
      botMsg = { role: "ai", text: (typeof window.summariseConversation === "function") ? window.summariseConversation(dataToSummarise) : "Summary module not found." };
    } else {
      botMsg = findResponses(text, chat.messages);
    }

    chat.messages.push(botMsg);
    saveChats();
    appendMessage(botMsg.text, botMsg.role, true);

    setTimeout(() => {
      userInput.disabled = false;
      sendBtn.disabled = false;
      sendBtn.style.opacity = "1";
      userInput.focus();
    }, (botMsg.text.length * 30) + 500);
  }, 1500);
}

function showShareModal(chatId) {
    if (!shareLinkInput) return;
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.messages.length === 0) {
        shareLinkInput.value = "Cannot share empty chat.";
        shareLinkInput.disabled = true;
        copyShareLinkBtn.disabled = true;
        shareModal.style.display = "flex";
        return;
    }
    const encoded = encodeChat(chat.messages);
    const shareBaseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    shareLinkInput.value = `${shareBaseUrl}?q=${encoded}`;
    shareLinkInput.disabled = false; copyShareLinkBtn.disabled = false; shareModal.style.display = "flex";
}

if (shareCancel) shareCancel.onclick = () => shareModal.style.display = "none";
if (copyShareLinkBtn) copyShareLinkBtn.onclick = () => {
    shareLinkInput.select();
    document.execCommand('copy');
    copyShareLinkBtn.textContent = "Copied!";
    setTimeout(() => { copyShareLinkBtn.textContent = "Copy"; shareModal.style.display = "none"; }, 1500);
};

renameCancel.onclick = () => renameModal.style.display = "none";
deleteCancel.onclick = () => deleteModal.style.display = "none";

renameConfirm.onclick = () => {
  const chat = chats.find(c => c.id === currentRenameId);
  if (chat && renameInput.value.trim()) {
    chat.title = renameInput.value.trim();
    saveChats(); renderChatList(); renderMessages(); updateURL(chat.title);
  }
  renameModal.style.display = "none";
};

deleteConfirm.onclick = () => {
  chats = chats.filter(c => c.id !== currentDeleteId);
  if (activeChatId === currentDeleteId) { activeChatId = null; localStorage.removeItem("activeChatId"); chatBox.innerHTML = ""; }
  saveChats(); renderChatList(); deleteModal.style.display = "none";
};

newChatBtn.onclick = () => {
  if (isReadOnlyMode) return;
  const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
  chats.unshift(newChat);
  activeChatId = newChat.id;
  localStorage.setItem("activeChatId", activeChatId);
  saveChats(); renderChatList(); renderMessages(); updateURL(newChat.title);
};

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
settingsBtn.onclick = () => settingsModal.style.display = "flex";
settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.style.display = "none"; };

themeToggle.checked = localStorage.getItem("theme") === "dark";
document.body.classList.toggle("dark", themeToggle.checked);
themeToggle.onchange = () => {
  document.body.classList.toggle("dark", themeToggle.checked);
  localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
};

const deleteAllChatsBtn = document.getElementById("deleteAllChatsBtn");
const deleteAllModal = document.getElementById("deleteAllModal");
const deleteAllConfirm = document.getElementById("deleteAllConfirm");
const deleteAllCancel = document.getElementById("deleteAllCancel");

if (deleteAllChatsBtn) deleteAllChatsBtn.onclick = () => deleteAllModal.style.display = "flex";
if (deleteAllCancel) deleteAllCancel.onclick = () => deleteAllModal.style.display = "none";
if (deleteAllConfirm) deleteAllConfirm.onclick = () => {
  chats = []; localStorage.removeItem("chats"); localStorage.removeItem("activeChatId");
  activeChatId = null; renderChatList(); chatBox.innerHTML = ""; deleteAllModal.style.display = "none";
};

window.addEventListener('load', () => {
  const sharedChatLoaded = loadSharedChat(); 
  if (!sharedChatLoaded) {
    const urlParams = new URLSearchParams(window.location.search);
    const chatParam = urlParams.get("chat");
    if (chatParam) {
      const found = chats.find(c => c.title === chatParam);
      if (found) { activeChatId = found.id; localStorage.setItem("activeChatId", activeChatId); }
    }
    renderChatList(); renderMessages();
  }
  if (isCurrentlyBanned()) showBanModal();
});
