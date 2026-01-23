(function() {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  const handshakeCode = "9980748324";
  const mobileURL = "https://xpdevs.github.io/Genesis-AI/mobile/unspported";

  if (isMobile && window.GENESIS_CODE !== handshakeCode) {
    window.location.href = mobileURL;
    return; 
  }

  if (localStorage.getItem("SETUP") !== "FLAG_TRUE") {
    window.location.href = "https://xpdevs.github.io/Genesis-AI/legal/setup.html";
    return;
  }
})();

// Constants & State
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatTitle = document.getElementById("chatTitle");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("newChatBtn");

let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let activeChatId = localStorage.getItem("activeChatId");
let responses = {};
let isReadOnlyMode = false;

// Shared Functions
function saveChats() { localStorage.setItem("chats", JSON.stringify(chats)); }

function updateURL(title) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("chat", title);
  history.pushState({}, "", url);
}

function renderMessages() {
  if (isReadOnlyMode) return;
  const chat = chats.find(c => c.id === activeChatId);
  chatTitle.textContent = chat ? chat.title : "New Chat";
  chatBox.innerHTML = "";
  if (!chat) return;
  chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false));
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(text, role, isNew = false) {
  let finalString = String(text || "");
  const div = document.createElement("div");
  div.className = "message " + role;
  const textSpan = document.createElement("span");
  div.appendChild(textSpan);
  chatBox.append(div);
  
  if (role === "ai" && isNew) {
    let i = 0;
    const interval = setInterval(() => {
      textSpan.textContent += finalString[i];
      i++;
      if (i === finalString.length) clearInterval(interval);
    }, 30);
  } else {
    textSpan.textContent = finalString;
  }
}

function findResponses(input) {
  input = input.toLowerCase();
  const keys = Object.keys(responses);
  for (let key of keys) {
    if (input.includes(key.toLowerCase())) return { role: "ai", text: responses[key] };
  }
  return { role: "ai", text: "I am still learning. Please try another query." };
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat);
    activeChatId = newChat.id;
    saveChats();
    renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ role: "user", text: text });
  renderMessages();

  setTimeout(() => {
    const botMsg = findResponses(text);
    chat.messages.push(botMsg);
    saveChats();
    appendMessage(botMsg.text, botMsg.role, true);
  }, 1000);
}

// Global Initialization
window.addEventListener('load', () => {
  fetch("https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT.json")
    .then(r => r.json())
    .then(data => {
       responses = data;
       renderChatList();
       renderMessages();
    });
});

sendBtn.onclick = sendMessage;
newChatBtn.onclick = () => {
  activeChatId = Date.now().toString();
  chats.unshift({ id: activeChatId, title: "New Chat", messages: [] });
  saveChats();
  renderChatList();
  renderMessages();
};
