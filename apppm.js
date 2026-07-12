// --- DYNAMIC SECURITY CONFIGURATION ---
// This handles checking if a passkey exists or needs to be created on launch
document.addEventListener('DOMContentLoaded', () => {
    initVaultSecurity();
    displayEntries();
});

function initVaultSecurity() {
    const hasPasskey = localStorage.getItem('vault_passkey');
    const lockTitle = document.querySelector('.lock-box h2');
    const lockSub = document.querySelector('.lock-box p');
    const unlockBtn = document.getElementById('unlock-btn');
    const pinInput = document.getElementById('vault-pin');

    if (!hasPasskey) {
        // First-time setup mode
        lockTitle.textContent = "INITIALIZE VAULT";
        lockSub.textContent = "Create your secure 4-digit master passkey:";
        unlockBtn.textContent = "GENERATE SECURE KEY";
        pinInput.placeholder = "NEW";
    } else {
        // Standard locking mode
        lockTitle.textContent = "VAULT LOCKED";
        lockSub.textContent = "Enter Master Authorization Code";
        unlockBtn.textContent = "AUTHORIZE ACCESS";
        pinInput.placeholder = "••••";
    }
}

// Global action handler for the main security button
document.getElementById('unlock-btn').addEventListener('click', handleSecurityAction);

// Allow pressing the "Enter" key to submit
document.getElementById('vault-pin').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSecurityAction();
    }
});

function handleSecurityAction() {
    const pinInput = document.getElementById('vault-pin');
    const errorDisplay = document.getElementById('lock-error');
    const lockScreen = document.getElementById('lock-screen');
    const savedPasskey = localStorage.getItem('vault_passkey');
    const enteredValue = pinInput.value.trim();

    // 1. First-Time Passkey Creation Mode
    if (!savedPasskey) {
        if (enteredValue.length < 4) {
            showLockError("ERROR: Passkey must be exactly 4 digits");
            return;
        }
        
        // Save the new passkey forever in the browser storage
        localStorage.setItem('vault_passkey', enteredValue);
        
        // Transform UI dynamically to unlocked state
        lockScreen.classList.add('unlocked');
        pinInput.value = '';
        errorDisplay.textContent = '';
        
        // Soft refresh configuration internal flags so it behaves perfectly next time
        initVaultSecurity();
        return;
    }

    // 2. Regular Authentication Mode
    if (enteredValue === savedPasskey) {
        // Correct Passkey entered
        lockScreen.classList.add('unlocked');
        pinInput.value = '';
        errorDisplay.textContent = '';
    } else {
        // Incorrect Passkey entered
        showLockError("ACCESS DENIED: INVALID AUTHORIZATION");
        pinInput.value = '';
        pinInput.focus();
    }
}

// Visual error rumble function
function showLockError(message) {
    const errorDisplay = document.getElementById('lock-error');
    const lockBox = document.querySelector('.lock-box');
    
    errorDisplay.textContent = message;
    
    // Smooth layout rumble animation
    lockBox.style.transform = 'translateX(10px)';
    setTimeout(() => lockBox.style.transform = 'translateX(-10px)', 100);
    setTimeout(() => lockBox.style.transform = 'translateX(0)', 200);
}


// --- CORE APPLICATION LOGIC (NOTES & MULTIMEDIA VAULT) ---

document.getElementById('media-input').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : "Embed Multimedia Core";
    document.getElementById('file-name').textContent = fileName;
    document.getElementById('file-name').style.color = '#d4af37';
});

document.getElementById('save-btn').addEventListener('click', saveEntry);

function saveEntry() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const mediaInput = document.getElementById('media-input');
    const file = mediaInput.files[0];

    if (!title && !content && !file) {
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const mediaData = {
                dataUrl: event.target.result,
                type: file.type
            };
            storeEntry(title, content, mediaData);
        };
        reader.readAsDataURL(file);
    } else {
        storeEntry(title, content, null);
    }
}

function storeEntry(title, content, media) {
    const entries = JSON.parse(localStorage.getItem('luxuryVaultEntries')) || [];
    
    const newEntry = {
        id: Date.now(),
        title: title || "Classified Entry",
        content: content || "No additional text data logged.",
        media: media
    };

    entries.unshift(newEntry);
    localStorage.setItem('luxuryVaultEntries', JSON.stringify(entries));
    
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('media-input').value = '';
    document.getElementById('file-name').textContent = "Images, Cinematic Video, Audio Tracks";
    document.getElementById('file-name').style.color = '#8a99ad';

    displayEntries();
}

function displayEntries() {
    const container = document.getElementById('entries-container');
    container.innerHTML = '';
    
    const entries = JSON.parse(localStorage.getItem('luxuryVaultEntries')) || [];

    entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'entry-card';

        let mediaHtml = '';
        if (entry.media) {
            mediaHtml = `<div class="media-container">`;
            if (entry.media.type.startsWith('image/')) {
                mediaHtml += `<img src="${entry.media.dataUrl}" class="media-preview" alt="Vault asset">`;
            } else if (entry.media.type.startsWith('audio/')) {
                mediaHtml += `<audio controls src="${entry.media.dataUrl}" class="media-preview"></audio>`;
            } else if (entry.media.type.startsWith('video/')) {
                mediaHtml += `<video controls src="${entry.media.dataUrl}" class="media-preview"></video>`;
            }
            mediaHtml += `</div>`;
        }

        card.innerHTML = `
            <h3>${entry.title}</h3>
            <p style="white-space: pre-wrap;">${entry.content}</p>
            ${mediaHtml}
            <div class="card-actions">
                <button class="delete-btn" onclick="deleteEntry(${entry.id})">Purge Asset</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function deleteEntry(id) {
    let entries = JSON.parse(localStorage.getItem('luxuryVaultEntries')) || [];
    entries = entries.filter(entry => entry.id !== id);
    localStorage.setItem('luxuryVaultEntries', JSON.stringify(entries));
    displayEntries();
}
// Monitor file input to change aesthetic luxury state label
document.getElementById('media-input').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : "No file secured";
    const statusElement = document.getElementById('file-name');
    statusElement.textContent = fileName;
    if(this.files[0]) {
        statusElement.style.color = "var(--gold-primary)";
    }
});

document.getElementById('save-btn').addEventListener('click', saveEntry);
document.addEventListener('DOMContentLoaded', displayEntries);

function saveEntry() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const mediaInput = document.getElementById('media-input');
    const file = mediaInput.files[0];

    if (!title && !content && !file) {
        alert("The vault requires content to initialize encryption.");
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const mediaData = {
                dataUrl: event.target.result,
                type: file.type
            };
            storeEntry(title, content, mediaData);
        };
        reader.readAsDataURL(file);
    } else {
        storeEntry(title, content, null);
    }
}

function storeEntry(title, content, media) {
    const entries = JSON.parse(localStorage.getItem('luxuryVaultEntries')) || [];
    
    const newEntry = {
        id: Date.now(),
        title: title || "Classified Entry",
        content: content || "No literal log provided.",
        media: media
    };

    entries.unshift(newEntry); // Puts newest luxurious items first
    localStorage.setItem('luxuryVaultEntries', JSON.stringify(entries));
    
    // Smooth clear form
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('media-input').value = '';
    document.getElementById('file-name').textContent = "No file secured";
    document.getElementById('file-name').style.color = "var(--text-muted)";

    displayEntries();
}

function displayEntries() {
    const entriesContainer = document.getElementById('entries-container');
    entriesContainer.innerHTML = '';
    
    const entries = JSON.parse(localStorage.getItem('luxuryVaultEntries')) || [];

    if(entries.length === 0) {
        entriesContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-style: italic; padding: 40px;">Vault empty. Awaiting safe deposits.</p>`;
        return;
    }

    entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'entry-card';

        let mediaHtml = '';
        if (entry.media) {
            mediaHtml = `<div class="media-container">`;
            if (entry.media.type.startsWith('image/')) {
                mediaHtml += `<img src="${entry.media.dataUrl}" class="media-preview" alt="Vault Image">`;
            } else if (entry.media.type.startsWith('audio/')) {
                mediaHtml += `<audio controls src="${entry.media.dataUrl}" class="media-preview"></audio>`;
            } else if (entry.media.type.startsWith('video/')) {
                mediaHtml += `<video controls src="${entry.media.dataUrl}" class="media-preview"></video>`;
            }
            mediaHtml += `</div>`;
        }

        card.innerHTML = `
            <h3>${entry.title}</h3>
            <p style="white-space: pre-wrap;">${entry.content}</p>
            ${mediaHtml}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Purge</button>
            <div style="clear: both;"></div>
        `;

        entriesContainer.appendChild(card);
    });
}

function deleteEntry(id) {
    let entries = JSON.parse(localStorage.getItem('luxuryVaultEntries')) || [];
    entries = entries.filter(entry => entry.id !== id);
    localStorage.setItem('luxuryVaultEntries', JSON.stringify(entries));
    displayEntries();
}
