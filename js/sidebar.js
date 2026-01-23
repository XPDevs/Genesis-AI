// sidebar.js - Handles Chat List and Sidebar UI
export function renderChatList(chats, activeChatId, callbacks) {
  const chatList = document.getElementById("chatList");
  if (!chatList) return;
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

    renameBtn.onclick = e => { 
      e.stopPropagation(); 
      callbacks.onRename(chat);
      dropdown.style.display = "none"; 
    };
    
    deleteBtn.onclick = e => { 
      e.stopPropagation(); 
      callbacks.onDelete(chat);
      dropdown.style.display = "none"; 
    };
    
    shareBtn.onclick = e => { 
      e.stopPropagation(); 
      callbacks.onShare(chat.id); 
      dropdown.style.display = "none"; 
    };

    dots.onclick = e => { 
      e.stopPropagation(); 
      const isVisible = dropdown.style.display === "flex";
      dropdown.style.display = isVisible ? "none" : "flex"; 
    };

    dropdown.append(renameBtn, deleteBtn, shareBtn);
    options.append(dots, dropdown);

    li.onclick = () => {
      callbacks.onSelect(chat);
    };

    li.append(span, options);
    chatList.append(li);
  });
}
