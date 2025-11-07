(function() {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

  if (isMobile) {
    // --- MOBILE FULL-SCREEN BLOCKING MODAL ---
    const modal = document.createElement("div");
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#f9f9f9",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "20px",
      zIndex: "999999",
      fontSize: "1.2rem",
      lineHeight: "1.5",
      overflow: "hidden",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      color: "#333"
    });

    modal.innerHTML = `
      <h1 style="margin-bottom: 20px;">Mobile Not Supported</h1>
      <p style="max-width: 400px;">Genesis AI is not functional on mobile devices. Please use a desktop computer to access this application.</p>
    `;

    document.body.appendChild(modal);

    // Prevent all interaction and scrolling
    document.body.style.overflow = "hidden";
    document.body.style.pointerEvents = "none";
    return; // Stop execution on mobile
  }

  // --- DESKTOP STYLING ---
  const cssFile = "https://xpdevs.github.io/Genesis-AI/styles/ui.css";
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssFile;
  document.head.appendChild(link);
  console.log(`Loaded desktop stylesheet: ${cssFile}`);
})();

// --- CHAT APP FUNCTIONALITY ---
const chatList = document.getElementById("chatList");
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const themeToggle = document.getElementById("themeToggle");
const chatTitle = document.getElementById("chatTitle");
const readOnlyBanner = document.getElementById("readOnlyBanner"); // Assumed element for read-only message

const renameModal = document.getElementById("renameModal");
const renameInput = document.getElementById("renameInput");
const renameConfirm = document.getElementById("renameConfirm");
const renameCancel = document.getElementById("renameCancel");

const deleteModal = document.getElementById("deleteModal");
const deleteConfirm = document.getElementById("deleteConfirm");
const deleteCancel = document.getElementById("deleteCancel");

// --- SHARE ELEMENTS ---
const shareModal = document.getElementById("shareModal"); 
const shareLinkInput = document.getElementById("shareLinkInput"); 
const copyShareLinkBtn = document.getElementById("copyShareLinkBtn");
const shareCancel = document.getElementById("shareCancel");
const inputArea = document.getElementById("inputArea"); // Assumed wrapping div for userInput/sendBtn

let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let activeChatId = localStorage.getItem("activeChatId");
let responses = {};
let currentRenameId = null;
let currentDeleteId = null;
let isReadOnlyMode = false; // Flag for shared view

// --- ENCODING/DECODING LOGIC ---

// Separators (numerical string format)
const CHAR_SEPARATOR = '000'; // Separates character codes (e.g., 72000105)
const ROLE_SEPARATOR = '555'; // Separates role from content (e.g., 155572000105)
const MSG_SEPARATOR = '9999'; // Separates messages (e.g., 1...99992...)

/**
 * Encodes a conversation into a numerical string for URL sharing.
 * Role map: 1 = user, 2 = ai, 3 = error.
 * @param {Array<{role: string, text: string}>} messages
 * @returns {string} The encoded conversation string.
 */
function encodeChat(messages) {
    if (!messages || messages.length === 0) return '';

    const roleMap = { 'user': 1, 'ai': 2, 'error': 3 };

    return messages.map(msg => {
        const roleCode = roleMap[msg.role] || 3; 
        
        // Convert text to UTF-16 code points
        let textCodes = '';
        for (let i = 0; i < msg.text.length; i++) {
            // Pad the character code to ensure consistent parsing
            const charCode = msg.text.charCodeAt(i);
            const paddedCode = charCode.toString().padStart(5, '0'); 
            
            if (i > 0) textCodes += CHAR_SEPARATOR;
            textCodes += paddedCode;
        }

        return `${roleCode}${ROLE_SEPARATOR}${textCodes}`;
    }).join(MSG_SEPARATOR);
}

/**
 * Decodes a numerical string back into an array of message objects.
 * @param {string} encodedString
 * @returns {Array<{role: string, text: string}>} The decoded message array.
 */
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

        // Split the numerical string by the character separator
        const rawCodes = textCodesString.split(CHAR_SEPARATOR).map(c => parseInt(c, 10));

        // Convert codes back to a string
        const text = String.fromCharCode(...rawCodes.filter(c => !isNaN(c)));

        messages.push({ role, text });
    });

    return messages;
}

// --- NEW/MODIFIED FUNCTION: loadAndSaveSharedChat ---
/**
 * Loads the decoded messages into the application as a new, editable chat.
 * @param {Array<{role: string, text: string}>} messages
 * @param {string} originalTitle
 */
function loadAndSaveSharedChat(messages, originalTitle) {
    // 1. Reset read-only mode flags and elements
    isReadOnlyMode = false;
    if (readOnlyBanner) readOnlyBanner.style.display = 'none';
    
    // Re-enable input area and sidebar controls
    if (inputArea) inputArea.style.display = 'flex'; // Assuming 'flex' is the desktop layout
    userInput.disabled = false;
    sendBtn.disabled = false;

    // Re-show sidebar controls related to editing/creating
    const sidebarHeader = document.querySelector(".sidebar-header");
    if (sidebarHeader) {
        sidebarHeader.style.display = 'flex'; // Assuming 'flex' is the desktop layout
    }

    // 2. Create new chat object and set it as active
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

    // 3. Render the newly loaded chat
    renderChatList();
    renderMessages();
    
    // Ensure New Chat and Settings buttons are re-enabled if they were disabled
    if (newChatBtn) newChatBtn.disabled = false;
    if (settingsBtn) settingsBtn.disabled = false;
    
    // Update URL to the new local chat title (optional: helps with browser history)
    updateURL(newChatTitle);
}

// --- MODIFIED FUNCTION: loadSharedChat ---
/**
 * Checks for a shared conversation parameter in the URL and loads it.
 */
function loadSharedChat() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedChat = urlParams.get("q");
    
    if (encodedChat) {
        const decodedMessages = decodeChat(encodedChat);
        
        // Find a title based on the first user message, or use a default
        let title = "Shared Conversation";
        const firstUserMsg = decodedMessages.find(msg => msg.role === 'user');
        if (firstUserMsg) {
            title = summariseTitle(firstUserMsg.text);
        }

        loadAndSaveSharedChat(decodedMessages, title);
        return true; // Indicate a shared chat was processed
    }
    return false;
}


// --- Ban & Violation state persisted in localStorage under key 'genesisBanInfo' ---
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

// --- Ban Modal setup (Ensures the modal exists in the DOM) ---
function ensureBanModal() {
  let existing = document.getElementById('banModal');
  if (existing) return existing;

  const modal = document.createElement('div');
  modal.id = 'banModal';
  Object.assign(modal.style, {
    position: 'fixed',
    inset: '0',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: '999999999',
    padding: '20px',
    pointerEvents: 'all'
  });

  modal.innerHTML = `
    <div id="banModalCard" style="max-width:520px;width:100%;background:#fff;padding:18px;border-radius:12px;text-align:center;font-family:Arial, sans-serif;color:#222;box-shadow:0 0 25px rgba(0,0,0,0.5);">
      <h2 id="banModalTitle">You have been banned</h2>
      <p id="banModalMessage">Reason: multiple violations of terms of service.</p>
      <p id="banModalCountdown" style="font-size:1.1rem;margin:14px 0 8px;">Time left: calculating...</p>
      <p style="margin:8px 0 18px;">Read our <a id="banTosLink" href="https://xpdevs.github.io/Genesis-AI/terms-of-service" target="_blank" rel="noopener">Terms of Service</a> for details.</p>
    </div>
  `;

  // Prevent closing or clicking through
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

  if (nextBanIndex === 0) durationMs = 5 * 60 * 1000; // 5 min
  else if (nextBanIndex === 1) durationMs = 10 * 60 * 1000; // 10 min
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

// --- Secret console unban command ---
window.unbanGenesis = function(code) {
  if (code === SECRET_UNBAN_CODE) {
    console.log('[Genesis] Secret unban accepted. Lifting ban.');
    liftBan();
    return true;
  }
  console.warn('[Genesis] Secret unban failed.');
  return false;
};

// --- Modal Display ---
function showBanModal() {
  const modal = ensureBanModal();
  const title = modal.querySelector('#banModalTitle');
  const msg = modal.querySelector('#banModalMessage');
  const countdownEl = modal.querySelector('#banModalCountdown');

  const info = loadBanInfo();

  // Permanent ban
  if (info.bannedUntil === 'perm') {
    title.textContent = 'You have been permanently banned';
    msg.textContent = 'This account is permanently banned due to repeated violations of our terms.';
    countdownEl.textContent = 'Permanent ban — no countdown.';
    modal.style.display = 'flex';
    document.body.style.pointerEvents = 'none';
    return;
  }

  // Temporary ban countdown
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
  document.body.style.pointerEvents = 'none'; // block all other interactions
}

// Load JSON AI responses
const jsonURL = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json";
const jsonName = jsonURL.split("/").pop();

fetch(jsonURL + "?v=" + Date.now())
  .then(r => r.ok ? r.json() : Promise.reject("File not found"))
  .then(data => responses = data)
  .catch(err => appendMessage(`Failed to load ${jsonName}: ${err}`, "error"));

// Save chats to localStorage
function saveChats() {
  localStorage.setItem("chats", JSON.stringify(chats));
}

// Update URL with chat title
function updateURL(chatTitle) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("chat", chatTitle);
  history.pushState({}, "", url);
}

// Render chat list
function renderChatList() {
    if (isReadOnlyMode) return; // Do not render editable list in read-only mode

  chatList.innerHTML = "";
  chats.forEach(chat => {
    const li = document.createElement("li");
    li.className = "chat-item" + (chat.id === activeChatId ? " active" : "");
    const span = document.createElement("span");
    span.textContent = chat.title;

    const options = document.createElement("div");
    options.className = "chat-options";

    const dots = document.createElement("button");
    dots.textContent = "⋮";
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";
    
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    // SHARE BUTTON
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";

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

    dropdown.append(renameBtn, deleteBtn, shareBtn); // Added shareBtn
    options.append(dots, dropdown);
    dots.onclick = e => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
    };

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

// Render messages
function renderMessages() {
    if (isReadOnlyMode) return; // Do not render local messages if in read-only mode

  const chat = chats.find(c => c.id === activeChatId);
  chatTitle.textContent = chat ? chat.title : "New Chat";
  chatBox.innerHTML = "";
  if (!chat) return;
  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false));
  chatBox.scrollTop = chatBox.scrollHeight;
  if (chat) updateURL(chat.title);
}

// Append message
function appendMessage(text, role, isNew = false) {
  const div = document.createElement("div");
  div.className = "message " + role;
  chatBox.append(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (role === "ai" && isNew) {
    let i = 0;
    const interval = setInterval(() => {
      div.textContent += text[i];
      i++;
      chatBox.scrollTop = chatBox.scrollHeight;
      if (i === text.length) clearInterval(interval);
    }, 30);
  } else {
    div.textContent = text;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

// Banned words
let bannedWords = [];
async function loadBannedWords() {
  try {
    const res = await fetch("https://xpdevs.github.io/Genesis-AI/js/banned/words.json?v=" + Date.now());
    if (!res.ok) throw new Error("Failed to load banned words");
    bannedWords = await res.json();
  } catch (err) {
    console.error("Error loading banned words:", err);
  }
}
loadBannedWords();

function violatesRules(text) {
  if (!bannedWords.length) return false;
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lowerText));
}

// Summarise title
function summariseTitle(text) {
  const words = text.split(" ").slice(0, 4).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Typing effect for title
function typeChatTitle(newTitle, callback) {
  chatTitle.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    chatTitle.textContent += newTitle[i];
    i++;
    if (i === newTitle.length) {
      clearInterval(interval);
      callback && callback();
    }
  }, 70);
}

function sendMessage() {
    if (isReadOnlyMode) return;
    
  // If currently banned, show ban modal and prevent sending
  const banInfo = loadBanInfo();
  if (isCurrentlyBanned()) {
    showBanModal();
    return;
  }

  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  // Check for banned words
  if (violatesRules(text)) {
    // increment consecutive counter
    const info = loadBanInfo();
    info.consecutiveViolations = (info.consecutiveViolations || 0) + 1;
    saveBanInfo(info);

    if (info.consecutiveViolations >= 5) {
      // apply ban
      applyBan();
      return appendMessage('Your message triggered safety protections and you have been temporarily banned.', 'error');
    }

    return appendMessage('This message violates AI safety and use policies. Please try again.', 'error');
  }

  // Non-violating message — reset consecutive violation counter
  const info = loadBanInfo();
  info.consecutiveViolations = 0;
  saveBanInfo(info);

  // Disable input and send button during AI response
  userInput.disabled = true;
  sendBtn.disabled = true;
  sendBtn.style.opacity = "0.5";
  sendBtn.style.cursor = "not-allowed";

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat);
    activeChatId = newChat.id;
    localStorage.setItem("activeChatId", activeChatId);
    saveChats();
    renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ role: "user", text });
  renderMessages();
  saveChats();

  if (chat.messages.filter(m => m.role === "user").length === 1) {
    const newTitle = summariseTitle(text);
    typeChatTitle(newTitle, () => {
      chat.title = newTitle;
      saveChats();
      renderChatList();
      updateURL(newTitle);
    });
  }

  // --- Show temporary loading message ---
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message loading";
  loadingDiv.style.display = "flex";
  loadingDiv.style.alignItems = "center";
  loadingDiv.style.gap = "8px";
  loadingDiv.style.color = "#888";
  loadingDiv.style.fontSize = "0.9rem";
  loadingDiv.style.opacity = "1";
  loadingDiv.style.transition = "opacity 0.8s ease";

  const spinner = document.createElement("div");
  spinner.style.width = "14px";
  spinner.style.height = "14px";
  spinner.style.border = "2px solid rgba(255, 255, 255, 0.2)";
  spinner.style.borderTop = "2px solid #fff";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "spin 1s linear infinite";

  const loadingText = document.createElement("span");
  loadingText.textContent = "Gathering information for you... this might take a moment.";

  loadingDiv.append(spinner, loadingText);
  chatBox.append(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Spinner animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Wait 3 seconds before showing AI message
  setTimeout(() => {
    loadingDiv.style.opacity = "0";
    setTimeout(() => loadingDiv.remove(), 800); // remove after fade-out

    const botMsg = findResponse(text);
    chat.messages.push(botMsg);
    appendMessage(botMsg.text, botMsg.role, true);
    saveChats();

    // Re-enable input and send button after AI is done
    setTimeout(() => {
      userInput.disabled = false;
      sendBtn.disabled = false;
      sendBtn.style.opacity = "1";
      sendBtn.style.cursor = "pointer";
      userInput.focus();
    }, botMsg.text.length * 30 + 500); // match typing effect duration
  }, 3000);
}

function findResponse(input) {
  input = input.toLowerCase();
  const key = Object.keys(responses).find(k => input.includes(k.toLowerCase()));
  if (!key) return { role: "ai", text: "I can't find a direct response for that, but I'm learning! Try asking about something I know." }; // Changed to 'ai' role for a softer failure
  return { role: "ai", text: responses[key] };
}

// --- SHARE MODAL FUNCTIONALITY ---
function showShareModal(chatId) {
    // Safety check for shareLinkInput - This now finds the element because it was added to HTML
    if (!shareLinkInput) {
        console.error("shareLinkInput element is null. Cannot show share modal.");
        return; 
    }
    
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.messages.length === 0) {
        shareLinkInput.value = "Cannot share empty chat.";
        shareLinkInput.disabled = true;
        copyShareLinkBtn.disabled = true;
        shareModal.style.display = "flex";
        return;
    }

    const encoded = encodeChat(chat.messages);
    
    // Construct the share link using the index.html path and the encoded query
    // Note: The base URL may need adjustment depending on your hosting environment.
    const shareBaseUrl = window.location.origin + window.location.pathname.replace('index.html', ''); // Use the base path
    const shareLink = `${shareBaseUrl}?q=${encoded}`;

    shareLinkInput.value = shareLink; 
    shareLinkInput.disabled = false;
    copyShareLinkBtn.disabled = false;
    shareModal.style.display = "flex";
}

if (shareCancel) shareCancel.onclick = () => shareModal.style.display = "none";

if (copyShareLinkBtn) copyShareLinkBtn.onclick = () => {
    shareLinkInput.select();
    try {
        // Use document.execCommand('copy') for better compatibility in iframe environments
        document.execCommand('copy');
        copyShareLinkBtn.textContent = "Copied!";
        setTimeout(() => {
            copyShareLinkBtn.textContent = "Copy";
            shareModal.style.display = "none";
        }, 1500);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        copyShareLinkBtn.textContent = "Error";
    }
};

// --- END SHARE MODAL FUNCTIONALITY ---


// Modal controls
renameCancel.onclick = () => renameModal.style.display = "none";
deleteCancel.onclick = () => deleteModal.style.display = "none";

renameConfirm.onclick = () => {
  const chat = chats.find(c => c.id === currentRenameId);
  if (chat && renameInput.value.trim()) {
    chat.title = renameInput.value.trim();
    saveChats();
    renderChatList();
    renderMessages();
    updateURL(chat.title);
  }
  renameModal.style.display = "none";
};

deleteConfirm.onclick = () => {
  chats = chats.filter(c => c.id !== currentDeleteId);
  if (activeChatId === currentDeleteId) {
    activeChatId = null;
    localStorage.removeItem("activeChatId");
    chatBox.innerHTML = "";
  }
  saveChats();
  renderChatList();
  deleteModal.style.display = "none";
};

// New chat
newChatBtn.onclick = () => {
    if (isReadOnlyMode) return;
  const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
  chats.unshift(newChat);
  activeChatId = newChat.id;
  localStorage.setItem("activeChatId", activeChatId);
  saveChats();
  renderChatList();
  renderMessages();
  updateURL(newChat.title);
};

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());

// Settings
settingsBtn.onclick = () => settingsModal.style.display = "flex";
settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.style.display = "none"; };

// Dark mode
themeToggle.checked = localStorage.getItem("theme") === "dark";
document.body.classList.toggle("dark", themeToggle.checked);
themeToggle.onchange = () => {
  document.body.classList.toggle("dark", themeToggle.checked);
  localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
};


// Delete all chats
const deleteAllChatsBtn = document.getElementById("deleteAllChatsBtn");
const deleteAllModal = document.getElementById("deleteAllModal");
const deleteAllConfirm = document.getElementById("deleteAllConfirm");
const deleteAllCancel = document.getElementById("deleteAllCancel");

if (deleteAllChatsBtn) deleteAllChatsBtn.onclick = () => deleteAllModal.style.display = "flex";
if (deleteAllCancel) deleteAllCancel.onclick = () => deleteAllModal.style.display = "none";
if (deleteAllConfirm) deleteAllConfirm.onclick = () => {
  chats = [];
  localStorage.removeItem("chats");
  localStorage.removeItem("activeChatId");
  activeChatId = null;
  renderChatList();
  chatBox.innerHTML = "";
  deleteAllModal.style.display = "none";
};

// --- MODIFIED INITIALISATION SEQUENCE ---
window.addEventListener('load', () => {
    // 1. Check for shared conversation link (takes priority and loads/saves chat)
    const sharedChatLoaded = loadSharedChat(); 

    if (!sharedChatLoaded) {
        // 2. If no shared chat, check for a chat title in the URL (for deep linking local chats)
        const urlParams = new URLSearchParams(window.location.search);
        const chatParam = urlParams.get("chat");
        if (chatParam) {
            const found = chats.find(c => c.title === chatParam);
            if (found) {
                activeChatId = found.id;
                localStorage.setItem("activeChatId", activeChatId);
            }
        }
        // 3. Render the local chat list and messages
        renderChatList();
        renderMessages();
    }
    
    // 4. Check ban status
    if (isCurrentlyBanned()) showBanModal();
});
