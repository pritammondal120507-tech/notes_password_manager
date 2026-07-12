let notes = JSON.parse(localStorage.getItem("notes")) || [];
let selectedNoteIndex = null;

// Helper: Save to LocalStorage
const saveToStorage = () => localStorage.setItem("notes", JSON.stringify(notes));

// --- 1. SAVE NOTE ---
function saveNote() {
    const title = document.getElementById("title");
    const content = document.getElementById("content");
    const password = document.getElementById("password");

    if (!title.value || !content.value || !password.value) {
        // Visual feedback for empty fields
        [title, content, password].forEach(el => {
            if (!el.value) el.style.borderColor = "#ef4444";
            else el.style.borderColor = "var(--border)";
        });
        return;
    }

    const encrypted = CryptoJS.AES.encrypt(content.value, password.value).toString();
    notes.push({ title: title.value, encrypted });

    saveToStorage();
    displayNotes();

    // Reset fields
    [title, content, password].forEach(el => {
        el.value = "";
        el.style.borderColor = "var(--border)";
    });
}

// --- 2. DISPLAY LIST ---
function displayNotes() {
    const list = document.getElementById("notes-list");
    list.innerHTML = "";
    
    notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${note.title}</span>
            <button class="btn-small" onclick="selectNote(${index})">Unlock</button>
        `;
        list.appendChild(li);
    });
}

// --- 3. SEARCH FILTER ---
function filterNotes() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const items = document.querySelectorAll("#notes-list li");

    items.forEach((li, index) => {
        const title = notes[index].title.toLowerCase();
        li.style.display = title.includes(searchTerm) ? "flex" : "none";
    });
}

// --- 4. DECRYPTION LOGIC ---
function selectNote(index) {
    selectedNoteIndex = index;
    const section = document.getElementById("decrypt-section");
    const titleDisplay = document.getElementById("note-title-display");
    const contentBox = document.getElementById("decrypted-content-box");
    
    section.style.display = "flex";
    titleDisplay.textContent = notes[index].title;
    
    // Reset modal state
    contentBox.style.display = "none";
    document.getElementById("decrypt-password").value = "";
    document.getElementById("decrypt-password").style.borderColor = "var(--border)";
}

function decryptNote() {
    const passwordInput = document.getElementById("decrypt-password");
    const contentBox = document.getElementById("decrypted-content-box");
    const contentText = document.getElementById("decrypted-content");
    const password = passwordInput.value;

    try {
        const encryptedData = notes[selectedNoteIndex].encrypted;
        const bytes = CryptoJS.AES.decrypt(encryptedData, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) throw new Error("Invalid");

        // SUCCESS
        contentBox.style.display = "block";
        contentBox.style.backgroundColor = "rgba(16, 185, 129, 0.1)"; // Greenish
        contentText.style.color = "#10b981";
        contentText.textContent = decrypted;
        passwordInput.style.borderColor = "var(--border)";
    } catch (e) {
        // ERROR HANDLING
        contentBox.style.display = "block";
        contentBox.style.backgroundColor = "rgba(239, 68, 68, 0.1)"; // Reddish
        contentText.style.color = "#ef4444";
        contentText.textContent = "❌ Incorrect password. Access denied.";
        
        // Visual shake/red border effect
        passwordInput.style.borderColor = "#ef4444";
        passwordInput.classList.add("shake"); 
        setTimeout(() => passwordInput.classList.remove("shake"), 400);
    }
}

function closeDecrypt() {
    document.getElementById("decrypt-section").style.display = "none";
}

// Load on start
window.onload = displayNotes;
// --- VAULT LOCK LOGIC ---
const vaultOverlay = document.getElementById("vault-overlay");
const vInput = document.getElementById("vault-password");

function vaultAuth() {
    const storedKey = localStorage.getItem("masterKey");
    const inputVal = vInput.value;

    // First Time Setup
    if (!storedKey) {
        if (inputVal.length < 4) {
            alert("Password too short!");
            return;
        }
        localStorage.setItem("masterKey", inputVal);
        vaultOverlay.style.display = "none";
    } 
    // Verification
    else {
        if (inputVal === storedKey) {
            vaultOverlay.style.display = "none";
        } else {
            vInput.classList.add("shake");
            setTimeout(() => vInput.classList.remove("shake"), 400);
            vInput.value = "";
        }
    }
}

// Initial Lock State Check
window.addEventListener("DOMContentLoaded", () => {
    const storedKey = localStorage.getItem("masterKey");
    if (!storedKey) {
        document.getElementById("lock-title").textContent = "Setup Master Key";
        document.getElementById("lock-desc").textContent = "Create a key to secure your notes.";
    }
});
function displayNotes() {
    const list = document.getElementById("notes-list");
    list.innerHTML = "";
    
    notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${note.title}</span>
            <div>
                <button class="btn-small" onclick="selectNote(${index})">Unlock</button>
                <button class="btn-delete" onclick="deleteNote(${index})">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });
}
function deleteNote(index) {
    // 1. Ask for confirmation before deleting
    const confirmed = confirm("Are you sure you want to delete this secret? This cannot be undone.");
    
    if (confirmed) {
        // 2. Remove the item from the array
        notes.splice(index, 1);
        
        // 3. Save the updated array to LocalStorage
        saveToStorage();
        
        // 4. Refresh the list UI
        displayNotes();
        
        // 5. If the deleted note was the one currently open, close the decryption modal
        if (selectedNoteIndex === index) {
            closeDecrypt();
            selectedNoteIndex = null;
        }
    }
}
