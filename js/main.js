(function() {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

  if (isMobile) {
    // Create modal background
    const modalBg = document.createElement("div");
    modalBg.style.position = "fixed";
    modalBg.style.top = "0";
    modalBg.style.left = "0";
    modalBg.style.width = "100%";
    modalBg.style.height = "100%";
    modalBg.style.background = "rgba(0, 0, 0, 0.6)";
    modalBg.style.display = "flex";
    modalBg.style.justifyContent = "center";
    modalBg.style.alignItems = "center";
    modalBg.style.zIndex = "9999";

    // Create modal box
    const modalBox = document.createElement("div");
    modalBox.style.background = "#fff";
    modalBox.style.color = "#111";
    modalBox.style.padding = "20px";
    modalBox.style.borderRadius = "12px";
    modalBox.style.maxWidth = "90%";
    modalBox.style.textAlign = "center";
    modalBox.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    modalBox.innerHTML = `
      <h2 style="margin-bottom: 10px;">Mobile Compatibility</h2>
      <p style="margin-bottom: 15px;">Genesis is not yet compatible with mobile devices.<br>
      We’re currently working to make it fully mobile-friendly.</p>
      <button id="closeModal" style="background:#10a37f;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;">OK</button>
    `;

    modalBg.appendChild(modalBox);
    document.body.appendChild(modalBg);

    // Close button functionality
    document.getElementById("closeModal").addEventListener("click", () => {
      modalBg.remove();
    });

    console.log("Mobile device detected — showing compatibility modal.");
  } else {
    const cssFile = "https://xpdevs.github.io/Genesis-AI/styles/ui-desktop.css";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssFile;
    document.head.appendChild(link);
    console.log(`Loaded desktop stylesheet: ${cssFile}`);
  }
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

// Load JSON
const jsonURL = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json";
const jsonName = jsonURL.split("/").pop(); // Extracts the AI modal name

fetch(jsonURL + "?v=" + Date.now())
  .then(r => {
    if (!r.ok) throw new Error("File not found");
    return r.json();
  })
  .then(data => responses = data)
  .catch(err => appendMessage(`Failed to load ${jsonName}: ${err.message}`, "error"));


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

// Render chat list sidebar
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

// Render messages in chat box
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

let bannedWords = [];

// Load banned words from JSON
async function loadBannedWords() {
  try {
    const res = await fetch("https://xpdevs.github.io/Genesis-AI/js/banned/words.json" + Date.now());
    if (!res.ok) throw new Error("Failed to load banned words");
    bannedWords = await res.json();
    console.log("Banned words loaded:", bannedWords.length);
  } catch (err) {
    console.error("Error loading banned words:", err);
  }
}

// Call this at the start of your app
loadBannedWords();

// Content moderation check
function violatesRules(text) {
  if (!bannedWords.length) return false; // no words loaded yet
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => {
    // Match word with optional punctuation around it
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}


// --- New: Summarise first message into a short title ---
function summariseTitle(text) {
  const words = text.split(" ").slice(0, 4).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// --- Typing effect for title ---
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

// Send message
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  // 1. Check for rule violations
  if (violatesRules(text)) {
    appendMessage("This message violates AI safety and use policies. Please try again with a different request.", "error", false);
    return;
  }

  // 2. Create new chat if needed
  let isNewChat = false;
  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat);
    activeChatId = newChat.id;
    localStorage.setItem("activeChatId", activeChatId);
    saveChats();
    renderChatList();
    isNewChat = true;
  }

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ role: "user", text });
  renderMessages();
  saveChats();

  // 3. If this is the *first* message, auto-generate title with typing effect
  if (chat.messages.filter(m => m.role === "user").length === 1) {
    const newTitle = summariseTitle(text);
    typeChatTitle(newTitle, () => {
      chat.title = newTitle;
      saveChats();
      renderChatList();
      updateURL(newTitle);
    });
  }

  // 4. Normal AI response process
  const botMsg = findResponse(text);
  chat.messages.push(botMsg);
  appendMessage(botMsg.text, botMsg.role, true);
  saveChats();
}

// Find AI response
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
  if (activeChatId) saveChats();
  const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
  chats.unshift(newChat);
  activeChatId = newChat.id;
  localStorage.setItem("activeChatId", activeChatId);
  saveChats();
  renderChatList();
  renderMessages();
  updateURL(newChat.title);
};

// Send message events
sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());

// Settings
settingsBtn.onclick = () => settingsModal.style.display = "flex";
settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.style.display = "none"; };

// Dark mode toggle
themeToggle.checked = localStorage.getItem("theme") === "dark";
document.body.classList.toggle("dark", themeToggle.checked);

themeToggle.onchange = () => {
  document.body.classList.toggle("dark", themeToggle.checked);
  localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
};

// Load chat from URL on start
const urlParams = new URLSearchParams(window.location.search);
const chatParam = urlParams.get("chat");
if (chatParam) {
  const found = chats.find(c => c.title === chatParam);
  if (found) {
    activeChatId = found.id;
    localStorage.setItem("activeChatId", activeChatId);
  }
}

// Initial render
renderChatList();
renderMessages();
