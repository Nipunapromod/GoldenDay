/**
 * Extract chat data from messages.html and save to data.json
 * Run this once to parse the exported Telegram chat
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Read the messages.html file
const messagesPath = path.join(__dirname, 'messages.html');
const messagesHtml = fs.readFileSync(messagesPath, 'utf-8');

// Parse HTML using jsdom (simulating browser DOM)
const dom = new JSDOM(messagesHtml);
const document = dom.window.document;

const messages = [];
const messageElements = document.querySelectorAll('.message.default');

messageElements.forEach((msgElem) => {
    // Extract sender name
    const fromName = msgElem.querySelector('.from_name');
    const textDiv = msgElem.querySelector('.text');
    const timeDiv = msgElem.querySelector('.date');
    const isJoined = msgElem.classList.contains('joined');
    
    if (!textDiv) return;
    
    let sender = null;
    if (fromName) {
        sender = fromName.textContent.trim();
    } else if (isJoined && messages.length > 0) {
        sender = messages[messages.length - 1].sender;
    }
    
    if (!sender) return;
    
    // Extract text (removing HTML tags)
    let text = textDiv.innerHTML;
    text = text.replace(/<[^>]*>/g, '').trim();
    
    // Extract time
    let time = '';
    if (timeDiv) {
        time = timeDiv.textContent.trim();
    }
    
    messages.push({
        sender: sender,
        text: text,
        time: time,
        isJoined: isJoined
    });
});

// Save to JSON file
const dataPath = path.join(__dirname, 'data.json');
fs.writeFileSync(dataPath, JSON.stringify(messages, null, 2));

console.log(`Extracted ${messages.length} messages`);
console.log('Saved to data.json');

// Print participants
const participants = [...new Set(messages.map(m => m.sender))];
console.log('Participants:', participants);
