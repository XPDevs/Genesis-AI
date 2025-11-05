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

const renameModal = document.getElementById("renameModal");
const renameInput = document.getElementById("renameInput");
const renameConfirm = document.getElementById("renameConfirm");
const renameCancel = document.getElementById("renameCancel");

const deleteModal = document.getElementById("deleteModal");
const deleteConfirm = document.getElementById("deleteConfirm");
const deleteCancel = document.getElementById("deleteCancel");

let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let activeChatId = localStorage.getItem("activeChatId");
let responses = {};
let currentRenameId = null;
let currentDeleteId = null;

// --- Ban & Violation state persisted in localStorage under key 'genesisBanInfo' ---
// Structure example:
// {
//   consecutiveViolations: 0, // reset when non-banned message sent
//   banHistoryCount: 0, // increments each time a ban is applied (0 -> first ban, 1 -> second, 2 -> third)
//   bannedUntil: null // timestamp millis when ban expires, or 'perm' for permanent
// }
const BAN_STORAGE_KEY = 'genesisBanInfo';
const SECRET_UNBAN_CODE = 'Te3nt!?'; // <-- your secret unban code

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

// --- Modal setup ---
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
  const url = new URL(window.location);
  url.searchParams.set("chat", chatTitle);
  history.pushState({}, "", url);
}

// Render chat list
function renderChatList() {
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

    dropdown.append(renameBtn, deleteBtn);
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
  if (!key) return { role: "error", text: "Sorry, I couldn’t process that." };
  return { role: "ai", text: responses[key] };
}

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

// Load chat from URL
const urlParams = new URLSearchParams(window.location.search);
const chatParam = urlParams.get("chat");
if (chatParam) {
  const found = chats.find(c => c.title === chatParam);
  if (found) {
    activeChatId = found.id;
    localStorage.setItem("activeChatId", activeChatId);
  }
}

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

// Initial render
renderChatList();
renderMessages();

// Automatically show modal if banned
window.addEventListener('load', () => {
  if (isCurrentlyBanned()) showBanModal();
});
