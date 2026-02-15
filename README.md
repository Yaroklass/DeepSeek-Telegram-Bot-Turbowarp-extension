# DeepSeek Telegram Bot — TurboWarp Extension

This repository contains a custom TurboWarp extension that allows you to build fully functional Telegram bots powered by the DeepSeek API — directly inside TurboWarp Web, without Python, proxies, or additional backend services.

The extension communicates with Telegram and DeepSeek using standard HTTPS requests, supported in the browser environment.

---

## Features

- Receive Telegram updates (JSON)
- Extract message text, chat ID, sender info
- Send Telegram messages
- Generate AI responses using DeepSeek API
- Download Telegram photos as Base64
- Use JSON inside TurboWarp logic
- Minimalistic, clean, no‑comment JavaScript code
- Works **only** in TurboWarp Web (not Desktop)

---

## Files

| File | Description |
|------|-------------|
| `extension.js` | Main TurboWarp extension logic (Web‑compatible) |
| `manifest.json` | Extension metadata |
| `icon.png` | Icon displayed in TurboWarp |

---

## Installation (TurboWarp Web)

1. Open TurboWarp Web:

https://turbowarp.org/editor

2. Go to:

Extensions → Custom Extension

3. Paste the **raw URL** of `extension.js` from this repository.

4. The extension will appear in the blocks menu.

---

## Setup in Your Project

Before using any blocks, call:

set Telegram token [your token] and DeepSeek key [your key]

Then create a loop:

1. Call:

get Telegram updates (JSON)

2. Parse the JSON using TurboWarp’s JSON blocks:
   - extract last message text  
   - extract last chat id  
   - extract file_id (if photo)

3. For text messages:

set reply to (DeepSeek reply to [text])
send message (reply) to chat (chat id)

4. For photos:

set base64 to (download Telegram photo [file_id])

You can convert Base64 to a costume or store it.

---

## Blocks Overview

### **1. set Telegram token [TG] and DeepSeek key [DS]**
Stores your API keys inside the extension.

### **2. get Telegram updates (JSON)**
Returns raw JSON from:

https://api.telegram.org/bot<TG>/getUpdates
### **3. send message [MSG] to chat [CHAT]**
Sends a plain text message.

### **4. DeepSeek reply to [MSG]**
Returns DeepSeek JSON response.

### **5. download Telegram photo [FILEID]**
Downloads a Telegram file and returns:

data:image/png;base64,....

---

## Example Logic

forever
set raw to (get Telegram updates (JSON))
set text to (JSON extract "message.text" from raw)
set chat to (JSON extract "message.chat.id" from raw)

if <text != ""> then
set ai to (DeepSeek reply to (text))
send message (ai) to chat (chat)
end
end

---

## Requirements

- Telegram Bot Token
- DeepSeek API Key
- TurboWarp Web (not Desktop)
- Internet connection

---

## Notes

- This extension **does not work in TurboWarp Desktop** due to sandbox restrictions.
- Works perfectly in TurboWarp Web because fetch() is allowed.

---

## License

MIT License — feel free to modify and improve.

---

### If you build something cool, send it — I’ll help you make it even better!
