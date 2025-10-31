(function () {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  const cssFile = isMobile
    ? "https://xpdevs.github.io/Genesis-AI/styles/ui-mobile.css"
    : "https://xpdevs.github.io/Genesis-AI/styles/ui-desktop.css";

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssFile;
  document.head.appendChild(link);
  console.log(`Loaded ${isMobile ? "mobile" : "desktop"} stylesheet: ${cssFile}`);

  if (isMobile) {
    window.addEventListener("DOMContentLoaded", () => {
      const sidebar = document.querySelector(".sidebar");
      const chatTitle = document.getElementById("chatTitle");
      const sendBtn = document.getElementById("sendBtn");

      if (!sidebar || !chatTitle) return;

      // Create hamburger button
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "menu-toggle";
      toggleBtn.innerHTML = "☰";
      Object.assign(toggleBtn.style, {
        marginRight: "10px",
        fontSize: "22px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "inherit",
      });

      // Wrap button + title
      const titleWrapper = document.createElement("div");
      titleWrapper.style.display = "flex";
      titleWrapper.style.alignItems = "center";
      titleWrapper.style.gap = "10px";
      titleWrapper.id = "chatTitleWrapper";

      const titleSpan = document.createElement("span");
      titleSpan.id = "chatTitleText";
      titleWrapper.append(toggleBtn, titleSpan);

      chatTitle.innerHTML = "";
      chatTitle.append(titleWrapper);

      // Sidebar toggle
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("visible");
      });

      // Close sidebar when clicking outside
      document.addEventListener("click", (e) => {
        if (
          sidebar.classList.contains("visible") &&
          !sidebar.contains(e.target) &&
          !toggleBtn.contains(e.target)
        ) {
          sidebar.classList.remove("visible");
        }
      });

      // Change send button to up arrow
      if (sendBtn) sendBtn.innerHTML = "↑";

      console.log("Mobile sidebar + UI initialised.");
    });
  }
})();

// ---------------- MAIN SCRIPT ----------------

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

// Modals auto-size for mobile
document.querySelectorAll(".modal").forEach(modal => {
  Object.assign(modal.style, {
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    alignItems: "center",
    justifyContent: "center",
  });
});

let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let activeChatId = localStorage.getItem("activeChatId");
let responses = {};
let currentRenameId = null;
let currentDeleteId = null;

// Content Warning position
const contentWarning = document.getElementById("contentWarning");
if (contentWarning && userInput) {
  userInput.parentElement.insertBefore(contentWarning, userInput);
  contentWarning.style.marginBottom = "5px";
  contentWarning.style.display = "none";
}

// Load AI responses
const jsonURL = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-1.0.json";
fetch(jsonURL + "?v=" + Date.now())
  .then(r => {
    if (!r.ok) throw new Error("File not found");
    return r.json();
  })
  .then(data => responses = data)
  .catch(err => appendMessage(`Failed to load responses: ${err.message}`, "error"));

function saveChats() {
  localStorage.setItem("chats", JSON.stringify(chats));
}

function updateURL(chatTitle) {
  const url = new URL(window.location);
  url.searchParams.set("chat", chatTitle);
  history.pushState({}, "", url);
}

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
      document.querySelectorAll(".dropdown").forEach(d => d.style.display = "none");
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

function renderMessages() {
  const chat = chats.find(c => c.id === activeChatId);
  chatBox.innerHTML = "";

  const titleSpan = document.getElementById("chatTitleText");
  if (chat && titleSpan) {
    titleSpan.textContent = chat.title;
  } else if (titleSpan) {
    titleSpan.textContent = "New Chat";
  }

  if (!chat) {
    if (settingsModal) settingsModal.style.display = "none";
    return;
  }

  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false));
  chatBox.scrollTop = chatBox.scrollHeight;
  updateURL(chat.title);
}

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
  } else div.textContent = text;

  chatBox.scrollTop = chatBox.scrollHeight;
}

// Load banned words
let bannedWords = [];
async function loadBannedWords() {
  try {
    const res = await fetch("https://xpdevs.github.io/Genesis-AI/js/banned/words.json?v=" + Date.now());
    if (!res.ok) throw new Error("Failed to load banned words");
    bannedWords = await res.json();
    console.log("Banned words loaded:", bannedWords.length);
  } catch (err) {
    console.error("Error loading banned words:", err);
  }
}
loadBannedWords();

function violatesRules(text) {
  if (!bannedWords.length) return false;
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => new RegExp(`\\b${word}\\b`, "i").test(lowerText));
}

function summariseTitle(text) {
  const words = text.split(" ").slice(0, 4).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function typeChatTitle(newTitle, callback) {
  const titleSpan = document.getElementById("chatTitleText");
  if (!titleSpan) return;

  titleSpan.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    titleSpan.textContent += newTitle[i];
    i++;
    if (i === newTitle.length) {
      clearInterval(interval);
      callback && callback();
    }
  }, 70);
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  if (violatesRules(text)) {
    appendMessage("This message violates AI safety and use policies. Please try again.", "error", false);
    return;
  }

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

  const botMsg = findResponse(text);
  chat.messages.push(botMsg);
  appendMessage(botMsg.text, botMsg.role, true);
  saveChats();
}

function findResponse(input) {
  input = input.toLowerCase();
  const key = Object.keys(responses).find(k => input.includes(k.toLowerCase()));
  if (!key) return { role: "error", text: "Sorry, I couldn’t process that." };
  return { role: "ai", text: responses[key] };
}

// Modals
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

// Send button & Enter key
sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());

// Settings modal
settingsBtn.onclick = () => settingsModal.style.display = "flex";
settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.style.display = "none"; };

// Theme
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

deleteAllChatsBtn.onclick = () => deleteAllModal.style.display = "flex";
deleteAllCancel.onclick = () => deleteAllModal.style.display = "none";
deleteAllConfirm.onclick = () => {
  chats = [];
  localStorage.removeItem("chats");
  localStorage.removeItem("activeChatId");
  activeChatId = null;
  renderChatList();
  chatBox.innerHTML = "";
  deleteAllModal.style.display = "none";
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

// Initial render
renderChatList();
renderMessages();
