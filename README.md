# DeepSeek Telegram Bot — TurboWarp Extension

This repository contains a custom TurboWarp extension that allows you to create fully functional Telegram bots powered by the DeepSeek API.  
The extension provides blocks for receiving messages, sending replies, and generating AI responses directly inside TurboWarp projects.

## Features

- Receive Telegram updates (polling)
- Extract message text and chat ID
- Send plain Telegram messages
- Generate AI responses using DeepSeek API
- Reply to users directly from TurboWarp
- Minimalistic, clean, no‑comment JavaScript code

## Files

| File | Description |
|------|-------------|
| `extension.js` | Main extension logic |
| `manifest.json` | Extension metadata |
| `icon.png` | Icon displayed in TurboWarp |
| `server.py` | Server for project |

## Installation (TurboWarp)

1. Upload all files to GitHub (or any static hosting).
2. Copy the **raw URL** of `extension.js`.
3. Open server.py
4. Open TurboWarp → Extensions → **Custom Extension**.
5. Paste the URL.
6. Use the blocks in your project.

## Setup in Your Project

Before using any blocks, call:
set Telegram token [your token] and DeepSeek key [your key]

Then create a loop:
1. Call **get Telegram updates**
2. Read:
   - `last message text`
   - `last chat id`

3. Pass them into:
reply with DeepSeek to [text] for chat [id]

## Example Logic

forever
set updates to (get Telegram updates)
if (last message text) ≠ ""
reply with DeepSeek to (last message text) for chat (last chat id)


## Requirements

- Telegram Bot Token (via @BotTurboWarp)
- DeepSeek API Key
- TurboWarp (desktop or web)
- Python (With flask)

## Icon

The included `icon.png` is used as the extension icon inside TurboWarp.

## License

MIT License — feel free to modify and improve.

---

If you create something cool with this extension, feel free to share it!
