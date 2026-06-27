// --- Export Functions ---

async function exportChatAsMarkdown(chat) {
    let md = `# ${chat.title}\n\n`;
    chat.messages.forEach(msg => {
        const role = msg.role === 'user' ? '**You**' : '**Genesis**';
        md += `${role}: ${msg.text}\n\n`;
    });
    return md;
}

async function exportChatAsPDF(chat) {
    const printWindow = window.open('', '_blank');
    let html = `<!DOCTYPE html><html><head><title>${chat.title}</title>`;
    html += `<style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        .user { color: #007bff; font-weight: bold; }
        .ai { color: #28a745; font-weight: bold; }
        .message { margin-bottom: 15px; }
    </style></head><body>`;
    html += `<h1>${chat.title}</h1>`;
    chat.messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'Genesis';
        html += `<div class="message"><span class="${msg.role}">${role}:</span> ${msg.text}</div>`;
    });
    html += `</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

function exportAccountData() {
    return {
        userInfo: DB.get("userInfo", {}),
        chats: DB.get("chats", []),
        banInfo: DB.get("genesisBanInfo", {}),
        exportDate: new Date().toISOString()
    };
}

async function downloadExport(accountData) {
    const dataStr = JSON.stringify(accountData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- Export Event Handlers ---
const exportDataBtn = document.getElementById("exportDataBtn");
const importExportModal = document.getElementById("importExportModal");

if (exportDataBtn && importExportModal) {
    exportDataBtn.onclick = () => {
        document.getElementById("accountModal").style.display = "none";
        importExportModal.style.display = "flex";
    };
}

document.getElementById("exportOptionBtn").onclick = async () => {
    const userInfo = await DB.get("userInfo", {});
    const banInfo = await DB.get("genesisBanInfo", {});
    
    const data = {
        exportDate: new Date().toISOString(),
        source: "genesis-ai",
        version: 1,
        user: {
            name: userInfo.name || null,
            email: userInfo.email || null,
            googleId: userInfo.googleId || null,
            picture: userInfo.picture || null
        },
        stats: {
            totalChats: chats.length,
            totalWarnings: banInfo.consecutiveViolations || 0,
            banHistoryCount: banInfo.banHistoryCount || 0
        },
        chats: chats
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    importExportModal.style.display = "none";
};
