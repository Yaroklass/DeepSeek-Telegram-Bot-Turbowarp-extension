# DeepSeek Telegram Bot — TurboWarp Extension

This repository contains a custom TurboWarp extension that allows you to create fully functional Telegram bots powered by the DeepSeek API.  
The extension communicates through a lightweight Python proxy server, enabling Telegram and DeepSeek API access even inside TurboWarp Desktop’s sandbox.

## Features

- Receive Telegram updates (polling)
- Extract message text and chat ID
- Send plain Telegram messages
- Generate AI responses using DeepSeek API
- Reply to users directly from TurboWarp
- Works in TurboWarp Desktop via a local Python proxy
- Minimalistic, clean, no‑comment JavaScript code

## Files

| File | Description |
|------|-------------|
| `extension.js` | Main TurboWarp extension logic |
| `manifest.json` | Extension metadata |
| `icon.png` | Icon displayed in TurboWarp |
| `server.py` | Local Python proxy server |

---

## Installation (TurboWarp Desktop)

1. Install Python 3.8+ (recommended 3.10+).
2. Install required Python packages:

pip install flask requests

3. Run the proxy server:

python server.py

The server will start on:

http://localhost:3000
4. Upload all extension files to GitHub (or any static hosting).
5. Copy the raw URL of `extension.js`.
6. Open TurboWarp Desktop → Extensions → Custom Extension.
7. Paste the raw URL.

---

## Setup in Your Project

Before using any blocks, call:

set Telegram token [your token] and DeepSeek key [your key]
Then create a loop:

1. Call `get Telegram updates`
2. Read:
   - `last message text`
   - `last chat id`
3. Pass them into:

reply with DeepSeek to [text] for chat [id]
---

## Example Logic

forever
set updates to (get Telegram updates)
if (last message text) ≠ ""
reply with DeepSeek to (last message text) for chat (last chat id)
---

## Requirements

- Telegram Bot Token
- DeepSeek API Key
- TurboWarp Desktop or Web
- Python 3.8+
- Flask
- Requests

---

## License

MIT License — feel free to modify and improve.

---

### If you make something cool, send it — I’ll check it out and make it even easier to use!
