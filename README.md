# Telegram Chat Viewer

A modern web interface to view exported Telegram chats with Telegram-like message bubbles.

## Features

✨ **Telegram-like UI** - Modern message bubbles with sender on left (peer) and right (user)
✨ **Participant Selection** - Choose which participant's perspective to view
✨ **Grouped Messages** - Consecutive messages from same sender are grouped together
✨ **Message Bubbles** - Beautiful blue bubbles for sent messages, white/gray for received
✨ **Responsive Design** - Works on desktop, tablet, and mobile

## How to Use

1. **Open in Browser** - Simply open `index.html` in your web browser
2. **Select Participant** - Click on either "Nipuna" or "Dilshani" button
3. **View Chat** - See the conversation with that person's messages on the right (blue bubbles) and the other person's on the left (white bubbles)
4. **Go Back** - Click the back arrow to return to participant selection

## Files

- `index.html` - Main web interface
- `css/telegram-style.css` - Telegram-like styling and message bubble design
- `js/telegram-chat.js` - Chat logic and message parsing
- `messages.html` - Original Telegram export (data source)

## How It Works

1. The app fetches and parses the original `messages.html` file
2. Messages are organized by sender
3. Consecutive messages from the same person are grouped together
4. Bubbles are styled differently for sent vs received messages
5. Display adapts based on the selected participant

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Customization

Edit `css/telegram-style.css` to customize:
- Colors (currently blue #667eea for sent messages)
- Font sizes and styles
- Message bubble radius and padding
- Animations and transitions

## Data Privacy

All processing happens locally in your browser. No data is sent to any server.
