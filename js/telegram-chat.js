/**
 * Telegram Chat Viewer
 * Parses exported Telegram chat and displays with Telegram-like UI
 */

let allMessages = [];
let selectedParticipant = null;
let isDarkTheme = localStorage.getItem('theme') !== 'light'; // Default to dark

// Initialize theme on page load
function initTheme() {
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        updateThemeButtons('☀️');
    } else {
        document.body.classList.remove('dark-theme');
        updateThemeButtons('🌙');
    }
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        updateThemeButtons('☀️');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        updateThemeButtons('🌙');
        localStorage.setItem('theme', 'light');
    }
}

// Update all theme toggle buttons
function updateThemeButtons(emoji) {
    const buttons = document.querySelectorAll('.theme-toggle, .theme-toggle-selection');
    buttons.forEach(btn => btn.textContent = emoji);
}

// Parse messages from HTML string
function parseMessagesFromHTML(html) {
    const messages = [];
    
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const messageElements = temp.querySelectorAll('.message.default');
    
    messageElements.forEach((msgElem, index) => {
        try {
            // Get sender name
            const fromName = msgElem.querySelector('.from_name');
            const textDiv = msgElem.querySelector('.text');
            const timeDiv = msgElem.querySelector('.date');
            const replyDiv = msgElem.querySelector('.reply_to');
            const reactionsDiv = msgElem.querySelector('.reactions');
            const isJoined = msgElem.classList.contains('joined');
            
            if (!textDiv) return;
            
            let sender = null;
            if (fromName) {
                sender = fromName.textContent.trim();
            } else if (isJoined && messages.length > 0) {
                sender = messages[messages.length - 1].sender;
            }
            
            if (!sender) return;
            
            // Get text content
            const textContent = textDiv.textContent.trim();
            if (!textContent) return;
            
            // Get time
            let time = timeDiv ? timeDiv.textContent.trim() : '';
            
            // Get reply text if exists
            let replyText = '';
            if (replyDiv) {
                replyText = replyDiv.textContent.trim();
            }
            
            // Get reactions if exist
            let reactions = [];
            if (reactionsDiv) {
                const reactionElements = reactionsDiv.querySelectorAll('.reaction');
                reactionElements.forEach(reaction => {
                    const emoji = reaction.querySelector('.emoji');
                    const count = reaction.querySelectorAll('.userpic').length;
                    if (emoji) {
                        reactions.push({
                            emoji: emoji.textContent.trim(),
                            count: count
                        });
                    }
                });
            }
            
            messages.push({
                sender: sender,
                text: textContent,
                time: time,
                reply: replyText,
                reactions: reactions,
                isJoined: isJoined
            });
        } catch (e) {
            console.warn('Error parsing message', index, e);
        }
    });
    
    return messages;
}

// Load messages from messages.html
function loadMessages() {
    return fetch('messages.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load messages.html');
            return response.text();
        })
        .then(html => {
            const parsed = parseMessagesFromHTML(html);
            if (parsed.length === 0) {
                console.warn('No messages parsed, using sample data');
                return getSampleMessages();
            }
            return parsed;
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            // Fallback to sample data
            return getSampleMessages();
        });
}

// Sample fallback data
function getSampleMessages() {
    return [
        { sender: "Dilshani", text: "Hi", time: "15:35", reply: "", reactions: [], isJoined: false },
        { sender: "Dilshani", text: "Me oya ajantha sirge onlineda clz yanne", time: "15:35", reply: "", reactions: [], isJoined: true },
        { sender: "Dilshani", text: "mata puluwan nam pay karanna eyala wts app inna nambarayak danna puluwan da", time: "15:36", reply: "", reactions: [], isJoined: true },
        { sender: "Dilshani", text: "👀🌷", time: "15:36", reply: "", reactions: [], isJoined: true },
        { sender: "~Nipuna Pramod~", text: "0714867044", time: "15:48", reply: "", reactions: [], isJoined: false },
        { sender: "~Nipuna Pramod~", text: "Meka balanna", time: "15:48", reply: "", reactions: [], isJoined: true },
        { sender: "~Nipuna Pramod~", text: "Kalin mase thibichcha number aka ne den", time: "15:49", reply: "", reactions: [], isJoined: true },
        { sender: "Dilshani", text: "Ha", time: "16:55", reply: "", reactions: [{ emoji: "🔥", count: 1 }], isJoined: false },
        { sender: "~Nipuna Pramod~", text: "morning sum 20 dala ne neda", time: "18:33", reply: "", reactions: [], isJoined: false },
        { sender: "~Nipuna Pramod~", text: "🧐", time: "18:33", reply: "", reactions: [], isJoined: true },
        { sender: "Dilshani", text: "Na ne dala na", time: "18:53", reply: "In reply to morning sum 20 dala ne neda", reactions: [], isJoined: false },
        { sender: "Dilshani", text: "Oyage nama mokkda", time: "18:53", reply: "", reactions: [], isJoined: true },
    ];
}

// Normalize participant names for matching
function getNormalizedName(name) {
    if (name.includes('Nipuna')) return 'Nipuna';
    if (name.includes('Dilshani')) return 'Dilshani';
    return name;
}

// Get the other participant
function getOtherParticipant(selected) {
    return selected === 'Nipuna' ? 'Dilshani' : 'Nipuna';
}

// Group consecutive messages from the same sender
function groupMessages(messages, selectedPerson) {
    const other = getOtherParticipant(selectedPerson);
    const groups = [];
    
    for (let msg of messages) {
        const normalized = getNormalizedName(msg.sender);
        
        if (groups.length === 0 || groups[groups.length - 1].sender !== normalized) {
            // Start new group
            groups.push({
                sender: normalized,
                messages: [msg]
            });
        } else {
            // Add to current group
            groups[groups.length - 1].messages.push(msg);
        }
    }
    
    return groups;
}

// Format message groups into HTML
function formatMessages(groups, selectedPerson) {
    let html = '';
    
    for (let group of groups) {
        for (let msg of group.messages) {
            const isSent = getNormalizedName(msg.sender) === selectedPerson;
            const bubbleClass = isSent ? 'sent' : 'received';
            
            const senderDisplay = !isSent ? `<div class="sender-name">${escapeHtml(group.sender)}</div>` : '';
            const replyDisplay = msg.reply ? `<div class="reply-to">${escapeHtml(msg.reply)}</div>` : '';
            const textHtml = `<div class="message-text">${escapeHtml(msg.text)}</div>`;
            const timeHtml = `<div class="message-time">${escapeHtml(msg.time)}</div>`;
            
            // Format reactions
            let reactionsHtml = '';
            if (msg.reactions && msg.reactions.length > 0) {
                reactionsHtml = '<div class="reactions">';
                msg.reactions.forEach(reaction => {
                    const countDisplay = reaction.count > 0 ? `<span class="count">${reaction.count}</span>` : '';
                    reactionsHtml += `
                        <div class="reaction">
                            <span class="emoji">${reaction.emoji}</span>
                            ${countDisplay}
                        </div>
                    `;
                });
                reactionsHtml += '</div>';
            }
            
            html += `
                <div class="message-group ${bubbleClass}">
                    <div class="message-bubble">
                        ${senderDisplay}
                        ${replyDisplay}
                        ${textHtml}
                        ${timeHtml}
                        ${reactionsHtml}
                    </div>
                </div>
            `;
        }
    }
    
    return html;
}

// Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Select participant
function selectParticipant(name) {
    selectedParticipant = name;
    
    loadMessages().then(messages => {
        allMessages = messages;
        displayChat(name);
    });
}

// Display chat
function displayChat(selectedPerson) {
    const selectionScreen = document.getElementById('selectionScreen');
    const chatScreen = document.getElementById('chatScreen');
    const messagesContainer = document.getElementById('messagesContainer');
    const headerName = document.getElementById('headerName');
    const chatTitle = document.getElementById('chatTitle');
    const other = getOtherParticipant(selectedPerson);
    
    // Update header
    headerName.textContent = selectedPerson;
    chatTitle.textContent = `Chat with ${other}`;
    
    // Filter messages
    const filtered = allMessages.filter(msg => {
        const norm = getNormalizedName(msg.sender);
        return norm === selectedPerson || norm === other;
    });
    
    // Group and format
    const grouped = groupMessages(filtered, selectedPerson);
    const html = formatMessages(grouped, selectedPerson);
    messagesContainer.innerHTML = html;
    
    // Show chat, hide selection
    selectionScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    
    // Scroll to bottom
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Go back
function goBack() {
    document.getElementById('chatScreen').classList.add('hidden');
    document.getElementById('selectionScreen').classList.remove('hidden');
    selectedParticipant = null;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    const urlParams = new URLSearchParams(window.location.search);
    const participant = urlParams.get('participant');
    
    if (participant && (participant === 'Nipuna' || participant === 'Dilshani')) {
        selectParticipant(participant);
    }
});
