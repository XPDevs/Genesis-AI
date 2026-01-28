function initializeApp() {
    console.log("Genesis Core: Environment Ready.");
    window.dispatchEvent(new Event('app-ready'));
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
const inputArea = document.getElementById("inputArea");
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

// --- COMPILER COMPATIBILITY DECODER (V2.4) ---
const XOR_KEY = 0xAA;
const SIG_ULTRA = 0x58504456; // "XPDV"
const DICT = ["ver", "name", "logic", "action", "value", "type", "genesis", "Aurex", "input", "output"];
const DICT_OFFSET = 0x10;

const defaultModel = "https://xpdevs.github.io/Genesis-AI/modals/Genesis-SPT-4.5-240126P1105M.bin";
const modelURL = localStorage.getItem("selectedModel") || defaultModel;

/**
 * State-Aware Binary Decoder
 * Tracks structural position to prevent missing delimiters.
 */
function decodeBinaryStream(bytes) {
    const decoder = new TextDecoder('utf-8');
    let jsonResult = "";
    let i = 4; // Skip signature
    
    // State machine to track the structure
    let expectation = "START"; // START, KEY, VALUE, NEXT
    let firstInObject = true;

    while (i < bytes.length) {
        const b = bytes[i];
        
        // Handle Dictionary Tokens (Always Strings)
        if (b >= DICT_OFFSET && b < (DICT_OFFSET + DICT.length)) {
            if (expectation === "KEY" && !firstInObject) jsonResult += ",";
            jsonResult += `"${DICT[b - DICT_OFFSET]}"`;
            firstInObject = false;
            expectation = "COLON";
        } else {
            switch(b) {
                case 0x01: // {
                    jsonResult += "{"; 
                    expectation = "KEY";
                    firstInObject = true;
                    break; 
                case 0x02: // }
                    jsonResult += "}"; 
                    expectation = "NEXT";
                    break; 
                case 0x03: // :
                    jsonResult += ":"; 
                    expectation = "VALUE";
                    break; 
                case 0x04: // ,
                    jsonResult += ","; 
                    expectation = "KEY";
                    break; 
                case 0x05: // [
                    jsonResult += "["; 
                    break; 
                case 0x06: // ]
                    jsonResult += "]"; 
                    break; 
                case 0x07: // Unique String Start
                    i++;
                    let strArr = [];
                    while (i < bytes.length && bytes[i] !== 0x00) {
                        strArr.push(bytes[i] ^ XOR_KEY);
                        i++;
                    }
                    let decodedStr = decoder.decode(new Uint8Array(strArr));
                    
                    // Logic to ensure correct delimiters are present
                    if (expectation === "KEY" && !firstInObject) jsonResult += ",";
                    
                    jsonResult += JSON.stringify(decodedStr);
                    
                    if (expectation === "KEY") {
                        expectation = "COLON";
                    } else {
                        expectation = "NEXT";
                    }
                    firstInObject = false;
                    break;
            }
        }
        i++;
    }
    
    try {
        // Final sanity check: if the compiler emitted colons as tokens, 
        // the state machine handles them. If it didn't, we patch.
        let finalized = jsonResult.replace(/"([^"]+)""/g, '"$1":"'); 
        return JSON.parse(finalized);
    } catch (e) {
        console.error("Data Reconstruction Error at Byte:", i);
        console.error("Buffer Context:", jsonResult.slice(-100));
        throw e;
    }
}

async function loadAndDecodeModel() {
    try {
        const response = await fetch(modelURL + "?v=" + Date.now());
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const view = new DataView(buffer);

        if (bytes.length < 4 || view.getUint32(0, true) !== SIG_ULTRA) {
            throw new Error("Invalid format signature.");
        }

        responses = decodeBinaryStream(bytes);
        console.log("Genesis: Model active.");
        return responses;

    } catch (err) {
        console.error("System Loading Error:", err);
        return null;
    }
}

loadAndDecodeModel();

// --- UI & MESSAGING (Logic preserved) ---
function saveChats() { localStorage.setItem("chats", JSON.stringify(chats)); }
function updateURL(chatTitle) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("chat", chatTitle);
  history.pushState({}, "", url);
}

function renderChatList() {
  if (isReadOnlyMode) return;
  chatList.innerHTML = "";
  chats.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  chats.forEach(chat => {
    const li = document.createElement("li");
    li.className = "chat-item" + (chat.id === activeChatId ? " active" : "");
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
    dots.onclick = e => { e.stopPropagation(); dropdown.style.display = (dropdown.style.display === "flex") ? "none" : "flex"; };

    dropdown.append(pinBtn, renameBtn, deleteBtn, shareBtn);
    options.append(dots, dropdown);
    li.onclick = () => { activeChatId = chat.id; localStorage.setItem("activeChatId", activeChatId); renderChatList(); renderMessages(); updateURL(chat.title); };
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
  const div = document.createElement("div");
  div.className = "message " + role;
  const textSpan = document.createElement("span");
  div.appendChild(textSpan);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "msg-actions";
  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn copy-btn";
  copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  copyBtn.onclick = () => navigator.clipboard.writeText(finalString);
  actionsDiv.appendChild(copyBtn);

  if (role === "ai") {
    const speakBtn = document.createElement("button");
    speakBtn.className = "action-btn speak-btn";
    speakBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    speakBtn.onclick = () => { if (window.speechSynthesis.speaking) window.speechSynthesis.cancel(); else window.speechSynthesis.speak(new SpeechSynthesisUtterance(finalString)); };
    actionsDiv.appendChild(speakBtn);
  }

  div.appendChild(actionsDiv);
  chatBox.append(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (role === "ai" && isNew) {
    let i = 0;
    const interval = setInterval(() => {
      if (i < finalString.length) { textSpan.textContent += finalString[i]; i++; chatBox.scrollTop = chatBox.scrollHeight; } 
      else { clearInterval(interval); }
    }, 30);
  } else { textSpan.textContent = finalString; }
}

function findResponses(input) {
  const lowerInput = input.toLowerCase();
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

  if (foundMatches.length === 0) return { role: "ai", text: "I'm not quite sure I follow. Could you give me a bit more detail?" };
  const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
  return { role: "ai", text: orderedMessages.length === 1 ? orderedMessages[0] : orderedMessages.join(", ") };
}

function sendMessage() {
  if (isReadOnlyMode) return;
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  if (!activeChatId) {
    const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
    chats.unshift(newChat); activeChatId = newChat.id; localStorage.setItem("activeChatId", activeChatId);
    saveChats(); renderChatList();
  }

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ role: "user", text: text });
  renderMessages(); saveChats();

  const botMsg = findResponses(text);
  chat.messages.push(botMsg);
  saveChats();
  setTimeout(() => appendMessage(botMsg.text, botMsg.role, true), 1000);
}

// Event Listeners
if (sendBtn) sendBtn.onclick = sendMessage;
if (userInput) userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
if (newChatBtn) newChatBtn.onclick = () => {
  const newChat = { id: Date.now().toString(), title: "New Chat", messages: [] };
  chats.unshift(newChat); activeChatId = newChat.id; localStorage.setItem("activeChatId", activeChatId);
  saveChats(); renderChatList(); renderMessages(); updateURL("New Chat");
};

// Start logic
window.addEventListener('load', () => {
    if (localStorage.getItem("SETUP") === "FLAG_TRUE") {
        startApp();
    } else {
        window.location.href = "https://xpdevs.github.io/Genesis-AI/legal/setup.html";
    }
});

function startApp() {
    renderChatList();
    renderMessages();
}
