// CodeCanvas AI - Visual Interactive Logic
const codeEditor = document.getElementById('code-editor');
const runBtn = document.getElementById('run-btn');
const viewName = document.getElementById('view-name');
const viewStatus = document.getElementById('view-status');
const idCard = document.getElementById('id-card');
const buddyChat = document.getElementById('buddy-messages');

// Real-time Update Function
function updateCard(name, color, status) {
    viewName.innerText = name;
    viewStatus.innerText = status;
    idCard.style.borderTop = `10px solid ${color}`;
    idCard.style.boxShadow = `0 20px 50px -10px ${color}33`; // Transparent shadow
}

// Simple Parser for Demo (Extracts variables from text)
function executeCode() {
    const code = codeEditor.value;

    try {
        // Find variable values using regex
        const nameMatch = code.match(/let\s+ism\s*=\s*"(.*)"/);
        const colorMatch = code.match(/let\s+rang\s*=\s*"(.*)"/);
        const statusMatch = code.match(/let\s+status\s*=\s*"(.*)"/);

        const name = nameMatch ? nameMatch[1] : "???";
        const color = colorMatch ? colorMatch[1] : "#ddd";
        const status = statusMatch ? statusMatch[1] : "???";

        // Update the visual card
        updateCard(name, color, status);

        // AI Feedback
        if (name !== "Ismingiz") {
            addBuddyMessage(`Vaaay, zo'r! Salom, <b>${name}</b>! 👋 Endi sevimli rangingni ham o'zgartirib ko'r.`);
        }
    } catch (error) {
        console.error("Xato:", error);
    }
}

function addBuddyMessage(text) {
    const msg = document.createElement('div');
    msg.className = "msg";
    msg.innerHTML = text;
    buddyChat.appendChild(msg);
    buddyChat.scrollTop = buddyChat.scrollHeight;
}

// Events
runBtn.addEventListener('click', executeCode);

// Auto-run on change (for a real "magic" feel)
codeEditor.addEventListener('input', executeCode);

// Start
window.onload = executeCode;
