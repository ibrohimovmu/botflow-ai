// ===========================
// AURA STUDIO — Mini App JS
// ===========================

const tg = window.Telegram?.WebApp;
if (tg) { tg.expand(); tg.ready(); }

// Elements
const modal = document.getElementById('modal');
const btnCreate = document.getElementById('btn-create');
const btnSend = document.getElementById('btn-send');
const btnSendText = document.getElementById('btn-send-text');
const spinnerEl = document.getElementById('spinner');
const promptInput = document.getElementById('prompt');
const avatarLetter = document.getElementById('avatar-letter');

// User info from TG
const user = tg?.initDataUnsafe?.user;
if (user) {
    avatarLetter.textContent = (user.first_name || '?')[0].toUpperCase();
}

// Modal open/close
btnCreate.addEventListener('click', () => {
    modal.classList.add('active');
    if (tg) tg.HapticFeedback?.impactOccurred('light');
    setTimeout(() => promptInput.focus(), 400);
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Send prompt
btnSend.addEventListener('click', () => {
    const text = promptInput.value.trim();
    if (!text) {
        if (tg) tg.showAlert('Loyiha haqida yozing!');
        return;
    }
    
    // Loading state
    btnSendText.textContent = 'AI ishlayapti...';
    spinnerEl.classList.remove('hidden');
    btnSend.disabled = true;
    btnSend.style.opacity = '0.7';
    
    if (tg) tg.HapticFeedback?.impactOccurred('medium');
    
    // Send data to bot and close
    setTimeout(() => {
        if (tg) {
            tg.sendData(JSON.stringify({
                action: 'create_bot',
                prompt: text
            }));
            tg.close();
        } else {
            alert('Demo: ' + text);
            btnSendText.textContent = 'AI bilan yaratish';
            spinnerEl.classList.add('hidden');
            btnSend.disabled = false;
            btnSend.style.opacity = '1';
        }
    }, 1500);
});

// Keyboard handling
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        btnSend.click();
    }
});
