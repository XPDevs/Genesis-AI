// --- ChatGPT Format Detection & Parsing ---
function isChatGPTConversations(data) {
  if (!Array.isArray(data)) return false;
  return data.some(item =>
    item && typeof item === "object" && item.mapping &&
    typeof item.mapping === "object" && Object.keys(item.mapping).length > 0
  );
}

function parseChatGPTConversations(data) {
  const chats = [];
  if (!Array.isArray(data)) return chats;

  for (const convo of data) {
    if (!convo || !convo.mapping) continue;

    const mapping = convo.mapping;
    const title = convo.title || "Untitled Chat";

    let rootId = null;
    for (const [id, node] of Object.entries(mapping)) {
      if (node && (node.parent === null || node.parent === undefined)) {
        rootId = id;
        break;
      }
    }
    if (!rootId) continue;

    const messages = [];
    const queue = [rootId];
    const visited = new Set();

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = mapping[nodeId];
      if (!node) continue;

      if (node.message && node.message.author && node.message.content) {
        const authorRole = (node.message.author.role || "").toLowerCase();
        let role = "user";
        if (authorRole === "assistant" || authorRole === "chatgpt" || authorRole === "model") role = "ai";
        else if (authorRole === "system" || authorRole === "tool") role = "system";

        const parts = node.message.content.parts;
        const text = Array.isArray(parts)
          ? parts.filter(p => typeof p === "string").join("\n")
          : (typeof parts === "string" ? parts : "");

        if (text && text.trim()) {
          messages.push({ role, text: text.trim() });
        }
      }

      if (node.children && Array.isArray(node.children)) {
        for (const childId of node.children) {
          if (!visited.has(childId)) {
            queue.push(childId);
          }
        }
      }
    }

    if (messages.length > 0) {
      chats.push({
        id: "import-chatgpt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        title,
        messages
      });
    }
  }

  return chats;
}

// --- Claude Format Detection & Parsing ---
function isClaudeConversations(data) {
  if (!Array.isArray(data)) return false;
  return data.some(item =>
    item && typeof item === "object" && Array.isArray(item.chat_messages) && item.chat_messages.length > 0
  );
}

function parseClaudeConversations(data) {
  const chats = [];
  if (!Array.isArray(data)) return chats;
  for (const convo of data) {
    if (!convo || !Array.isArray(convo.chat_messages)) continue;
    const title = convo.name || convo.uuid || "Untitled Chat";
    const messages = convo.chat_messages.map(m => normalizeMessage(m));
    if (messages.length > 0) {
      chats.push({
        id: "import-claude-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        title,
        messages
      });
    }
  }
  return chats;
}

// --- Gemini Format Detection & Parsing ---
function isGeminiConversation(data) {
  return data && typeof data === "object" && data.conversation &&
    typeof data.conversation === "object" && Array.isArray(data.conversation.messages);
}

function isGeminiConversationsArray(data) {
  if (!Array.isArray(data)) return false;
  return data.some(item => item && typeof item === "object" && isGeminiConversation(item));
}

function parseGeminiConversations(data) {
  const chats = [];
  const items = Array.isArray(data) ? data : [data];
  for (const item of items) {
    if (!item || !item.conversation || !Array.isArray(item.conversation.messages)) continue;
    const convo = item.conversation;
    const title = convo.title || convo.name || "Untitled Chat";
    const messages = convo.messages.map(m => normalizeMessage(m));
    if (messages.length > 0) {
      chats.push({
        id: "import-gemini-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        title,
        messages
      });
    }
  }
  return chats;
}

// --- DeepSeek Format Detection & Parsing ---
function isDeepSeekConversations(data) {
  let arr = data;
  if (data && !Array.isArray(data) && Array.isArray(data.conversations)) {
    arr = data.conversations;
  }
  if (!Array.isArray(arr)) return false;
  return arr.some(item =>
    item && typeof item === "object" && Array.isArray(item.messages) && item.messages.length > 0 &&
    item.messages.some(m => m && (m.reasoning_content !== undefined || m.content !== undefined))
  );
}

function parseDeepSeekConversations(data) {
  const chats = [];
  let arr = data;
  if (data && !Array.isArray(data) && Array.isArray(data.conversations)) {
    arr = data.conversations;
  }
  if (!Array.isArray(arr)) return chats;
  for (const convo of arr) {
    if (!convo || !Array.isArray(convo.messages)) continue;
    const title = convo.title || convo.name || "Untitled Chat";
    const messages = [];
    for (const m of convo.messages) {
      const normalized = normalizeMessage(m);
      if (m.reasoning_content && typeof m.reasoning_content === "string" && m.reasoning_content.trim()) {
        normalized.text = (normalized.text ? normalized.text + "\n\n" : "") + "[Reasoning]\n" + m.reasoning_content.trim();
      }
      if (normalized.text) messages.push(normalized);
    }
    if (messages.length > 0) {
      chats.push({
        id: "import-deepseek-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        title,
        messages
      });
    }
  }
  return chats;
}

// --- External Chat Extraction ---
function extractExternalChats(data) {
    const chats = [];
    let user = null;

    if (isChatGPTConversations(data)) {
        const gptChats = parseChatGPTConversations(data);
        chats.push(...gptChats);
        return { chats, user, source: "ChatGPT" };
    }

    if (data && data.mapping && typeof data.mapping === "object" && !Array.isArray(data)) {
        const gptChats = parseChatGPTConversations([data]);
        chats.push(...gptChats);
        return { chats, user, source: "ChatGPT" };
    }

    if (isClaudeConversations(data)) {
        const claudeChats = parseClaudeConversations(data);
        chats.push(...claudeChats);
        return { chats, user, source: "Claude" };
    }

    if (isGeminiConversation(data)) {
        const geminiChats = parseGeminiConversations([data]);
        chats.push(...geminiChats);
        return { chats, user, source: "Gemini" };
    }

    if (isGeminiConversationsArray(data)) {
        const geminiChats = parseGeminiConversations(data);
        chats.push(...geminiChats);
        return { chats, user, source: "Gemini" };
    }

    if (isDeepSeekConversations(data)) {
        const dsChats = parseDeepSeekConversations(data);
        chats.push(...dsChats);
        return { chats, user, source: "DeepSeek" };
    }
    
    let messages = data.messages || data.history || data.conversations || [];
    
    if (data.title || data.name) {
        const title = data.title || data.name || "Imported Chat";
        const msgs = Array.isArray(data.messages) ? data.messages
                  : Array.isArray(data.history) ? data.history
                  : Array.isArray(data.conversations) ? data.conversations
                  : [];
        if (msgs.length) {
            chats.push({ id: "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), title, messages: msgs.map(normalizeMessage) });
            return { chats, user };
        }
    }
    
    if (Array.isArray(data)) {
        for (const item of data) {
            const msgs = item.messages || item.history || item.conversations || item.chat_messages || [];
            if (msgs.length > 0) {
                const title = item.title || item.name || "Imported Chat";
                chats.push({ id: "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), title, messages: msgs.map(normalizeMessage) });
            }
        }
    } else if (Array.isArray(data.conversations)) {
        for (const item of data.conversations) {
            const msgs = item.messages || item.history || item.chat_messages || [];
            if (msgs.length > 0) {
                const title = item.title || item.name || "Imported Chat";
                chats.push({ id: "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), title, messages: msgs.map(normalizeMessage) });
            }
        }
    }
    
    if (data.user || data.userInfo || data.profile) {
        user = data.user || data.userInfo || data.profile;
    }
    
    return { chats, user };
}

function normalizeMessage(msg) {
    if (typeof msg === "string") {
        return { role: msg.startsWith("http") || msg.startsWith("!") ? "ai" : "user", text: msg };
    }

    let text = msg.text || msg.content || msg.message || "";

    if (!text && msg.parts && Array.isArray(msg.parts)) {
        text = msg.parts
            .map(p => (typeof p === "string" ? p : p.text || ""))
            .filter(Boolean)
            .join("\n");
    }

    let role = msg.role || msg.from || msg.sender || "user";
    role = role.toLowerCase();
    if (role === "assistant" || role === "bot" || role === "ai" || role === "model" || role === "genesis") role = "ai";
    if (role === "human" || role === "me") role = "user";
    return { role, text };
}

// --- Import Functionality ---
async function importAccountData(file) {
    try {
        let data;
        let detectedSource = "";
        const isZip = file.name.toLowerCase().endsWith(".zip");

        if (isZip) {
            if (typeof JSZip === "undefined") {
                throw new Error("Zip support requires JSZip library which failed to load.");
            }
            const zip = await JSZip.loadAsync(file);

            const allJsonFiles = zip.filter((relPath) => relPath.endsWith(".json") && !relPath.startsWith("__MACOSX/"));

            const geminiFiles = allJsonFiles.filter(f =>
                /\/Gemini\s*Apps\/Conversations\//i.test(f.name) || /Gemini/i.test(f.name)
            );

            if (geminiFiles.length > 0) {
                const allChats = [];
                for (const f of geminiFiles) {
                    try {
                        const text = await f.async("string");
                        const parsed = JSON.parse(text);
                        const result = extractExternalChats(parsed);
                        if (result.chats && result.chats.length > 0) {
                            allChats.push(...result.chats);
                            if (result.source) detectedSource = result.source;
                        }
                    } catch (_) {}
                }
                if (allChats.length > 0) {
                    const existingIds = new Set(chats.map(c => c.id));
                    let addedCount = 0;
                    for (const chat of allChats) {
                        if (!chat.id) {
                            chat.id = "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
                        }
                        if (!existingIds.has(chat.id)) {
                            if (!chat.title) chat.title = "Imported Chat";
                            if (!chat.messages) chat.messages = [];
                            chats.push(chat);
                            existingIds.add(chat.id);
                            addedCount++;
                        }
                    }
                    await saveChats();
                    renderChatList();
                    showInfoModal("Import Complete",
                        `Successfully imported ${addedCount} chat${addedCount > 1 ? 's' : ''} from Gemini!`);
                    return;
                }
            }

            let conversationsFile = allJsonFiles.find(f =>
                /\/?conversations\.json$/i.test(f.name) ||
                /\/?chatgpt_export\.json$/i.test(f.name) ||
                /\/?claude.*\.json$/i.test(f.name)
            );
            if (!conversationsFile && allJsonFiles.length > 0) {
                conversationsFile = allJsonFiles[0];
            }
            if (!conversationsFile) {
                throw new Error("No JSON data found inside the zip file.");
            }
            const text = await conversationsFile.async("string");
            data = JSON.parse(text);
        } else {
            const text = await file.text();
            data = JSON.parse(text);
        }
        
        let importedChats = [];
        let importedUserInfo = null;
        
        if (data.source === "genesis-ai" || (data.chats && Array.isArray(data.chats))) {
            importedChats = data.chats || [];
            importedUserInfo = data.user || null;
        } else {
            const result = extractExternalChats(data);
            importedChats = result.chats;
            importedUserInfo = result.user;
            if (result.source) detectedSource = result.source;
            if (result.conversations && result.conversations.length > importedChats.length) {
                importedChats = result.conversations;
            }
        }
        
        if (!importedChats.length && !importedUserInfo) {
            throw new Error("No recognizable chat data found in this file.");
        }
        
        const existingIds = new Set(chats.map(c => c.id));
        let addedCount = 0;
        
        for (const chat of importedChats) {
            if (!chat.id) {
                chat.id = "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
            }
            if (!existingIds.has(chat.id)) {
                if (!chat.title) chat.title = "Imported Chat";
                if (!chat.messages) chat.messages = [];
                chats.push(chat);
                existingIds.add(chat.id);
                addedCount++;
            }
        }
        
        await saveChats();
        
        if (importedUserInfo && importedUserInfo.name && !(await DB.get("userInfo", {})).name) {
            await DB.set("userInfo", importedUserInfo);
        }
        
        renderChatList();
        
        const sourceLabel = detectedSource || (isZip ? "ChatGPT" : "");
        showInfoModal(
            "Import Complete",
            addedCount > 0
                ? `Successfully imported ${addedCount} chat${addedCount > 1 ? 's' : ''}${sourceLabel ? " from " + sourceLabel : ""}!${importedUserInfo && importedUserInfo.name ? ' User profile was also restored.' : ''}`
                : "No new chats were imported (they may already exist in your account)."
        );
    } catch (e) {
        showInfoModal("Import Failed", e.message + " Please make sure you selected a valid export file.");
    }
}

// --- Import Event Handlers ---
const importOptionBtn = document.getElementById("importOptionBtn");
const importFileInput = document.getElementById("importFileInput");

if (importOptionBtn && importFileInput) {
    importOptionBtn.onclick = () => importFileInput.click();
    importFileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        importOptionBtn.textContent = "Importing...";
        importOptionBtn.style.opacity = "0.6";
        importOptionBtn.disabled = true;
        await importAccountData(file);
        importFileInput.value = "";
        importOptionBtn.textContent = "Import Data";
        importOptionBtn.style.opacity = "1";
        importOptionBtn.disabled = false;
        const m = document.getElementById("importExportModal");
        if (m) m.style.display = "none";
    };
}
