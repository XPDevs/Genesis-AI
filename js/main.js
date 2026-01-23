(function() {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  const handshakeCode = "9980748324";
  const mobileURL = "https://xpdevs.github.io/Genesis-AI/mobile/unspported";

  if (isMobile) {
    if (window.GENESIS_CODE !== handshakeCode) {
      window.location.href = mobileURL;
      return; 
    }
  }

  if (localStorage.getItem("SETUP") !== "FLAG_TRUE") {
    window.location.href = "https://xpdevs.github.io/Genesis-AI/legal/setup.html";
    return;
  }
})();

// DOM Elements
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatTitle = document.getElementById("chatTitle");
const readOnlyBanner = document.getElementById("readOnlyBanner");
const inputArea = document.getElementById("inputArea");

// Global State
let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let activeChatId = localStorage.getItem("activeChatId");
let responses = {};
let isReadOnlyMode = false;

// Core Logic: Encoding/Decoding for Sharing
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

// AI Message Handling
function appendMessage(text, role, isNew = false) {
  let finalString = (text && typeof text === 'object') ? (text.text || text.message || JSON.stringify(text)) : String(text || "");
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); 
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
  let processedText = finalString.replace(/%DATE%/g, dateStr).replace(/%TIME%/g, timeStr);

  const div = document.createElement("div");
  div.className = "message " + role;
  const textSpan = document.createElement("span");
  div.appendChild(textSpan);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "msg-actions";

  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn copy-btn";
  copyBtn.innerHTML = 'Copy'; // Simplified for text
  copyBtn.onclick = () => navigator.clipboard.writeText(processedText);
  actionsDiv.appendChild(copyBtn);

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

function findResponses(input) {
  input = input.toLowerCase();
  const foundMessages = [];
  Object.keys(responses).forEach(key => {
    if (input.includes(key.toLowerCase())) foundMessages.push(responses[key]);
  });

  if (foundMessages.length === 0) {
    return { role: "ai", text: "I'm learning! Try asking something else." };
  }

  if (foundMessages.length === 1) return { role: "ai", text: foundMessages[0] };
  const last = foundMessages.pop();
  return { role: "ai", text: foundMessages.join(", ") + " and " + last };
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ role: "user", text: text });
  appendMessage(text, "user");

  setTimeout(() => {
    const botMsg = findResponses(text);
    chat.messages.push(botMsg);
    localStorage.setItem("chats", JSON.stringify(chats));
    appendMessage(botMsg.text, botMsg.role, true);
  }, 1000);
}

// Event Listeners
sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());

// Fetching Logic
fetch("https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT.json")
  .then(r => r.json())
  .then(data => responses = data);
