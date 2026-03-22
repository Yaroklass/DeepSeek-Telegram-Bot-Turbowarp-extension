(function (Scratch) {
    if (!Scratch.extensions) {
        throw new Error("Scratch extensions not supported");
    }

    class DeepSeekTelegram {
        constructor() {
            this.tg = "";
            this.ds = "";

            this.commands = ["start", "message", "image", "messageandimage", "stop"];

            this.values = [];
            this.valueStore = {};

            this.lastUpdateId = 0;
            this.lastEvent = {
                command: "",
                text: "",
                photo: "",
                chatId: "",
                stamp: 0
            };

            this.lastTriggeredStamp = 0;
            this.lastPollTime = 0;
            this.pendingUpdates = [];
        }

        getInfo() {
            return {
                id: "deepseektelegram",
                name: "DeepSeek Telegram Bot",
                color1: "#4A90E2",
                color2: "#357ABD",
                blocks: [
                    {
                        opcode: "poll",
                        blockType: Scratch.BlockType.HAT,
                        isEdgeActivated: true,
                        text: "poll Telegram"
                    },

                    {
                        opcode: "setTokens",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set Telegram token [TG] and DeepSeek key [DS]",
                        arguments: {
                            TG: { type: Scratch.ArgumentType.STRING },
                            DS: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "addCommand",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "add Telegram command [NAME]",
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "whenCommand",
                        blockType: Scratch.BlockType.HAT,
                        isEdgeActivated: true,
                        text: "when Telegram command [CMD]",
                        arguments: {
                            CMD: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "getCommandText",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Telegram command text"
                    },

                    {
                        opcode: "getCommandPhoto",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Telegram command photo"
                    },

                    {
                        opcode: "getChatId",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Telegram chat id"
                    },

                    {
                        opcode: "sendMessage",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "send message [MSG] to chat [CHAT]",
                        arguments: {
                            MSG: { type: Scratch.ArgumentType.STRING },
                            CHAT: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "deepseekReply",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "DeepSeek reply to [MSG]",
                        arguments: {
                            MSG: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "deepseekVisionReply",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "DeepSeek vision reply to image [IMG] with text [TXT]",
                        arguments: {
                            IMG: { type: Scratch.ArgumentType.STRING },
                            TXT: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "addValue",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "add value [NAME]",
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "setValueTo",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set value [NAME] to [TEXT]",
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING },
                            TEXT: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "deleteValue",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "delete value [NAME]",
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "getValue",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Telegram value [NAME]",
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING }
                        }
                    },

                    {
                        opcode: "httpRequest",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "http request [URL] with body [BODY]",
                        arguments: {
                            URL: { type: Scratch.ArgumentType.STRING },
                            BODY: { type: Scratch.ArgumentType.STRING }
                        }
                    }
                ]
            };
        }

        /* -------------------- SYSTEM POLLING -------------------- */
        async poll() {
            await this.pollUpdates();
            return false;
        }

        /* -------------------- VALUE STORAGE -------------------- */
        addValue(args) {
            const name = (args.NAME || "").trim();
            if (!name) return;
            if (!this.values.includes(name)) {
                this.values.push(name);
                this.valueStore[name] = "";
            }
        }

        setValueTo(args) {
            const name = (args.NAME || "").trim();
            const text = args.TEXT || "";
            if (!name) return;
            this.valueStore[name] = text;
        }

        deleteValue(args) {
            const name = (args.NAME || "").trim();
            const i = this.values.indexOf(name);
            if (i >= 0) {
                this.values.splice(i, 1);
                delete this.valueStore[name];
            }
        }

        getValue(args) {
            const name = (args.NAME || "").trim();
            return this.valueStore[name] || "";
        }

        /* -------------------- COMMAND MANAGEMENT -------------------- */
        addCommand(args) {
            const name = (args.NAME || "").trim();
            if (!name) return;
            if (!this.commands.includes(name)) {
                this.commands.push(name);
            }
        }

        /* -------------------- TELEGRAM POLLING -------------------- */
        async pollUpdates() {
            const now = Date.now();
            if (now - this.lastPollTime < 800) return;
            this.lastPollTime = now;
            if (!this.tg) return;

            const url = `https://api.telegram.org/bot${this.tg}/getUpdates?timeout=0&offset=${this.lastUpdateId + 1}`;

            let res;
            try {
                res = await fetch(url);
            } catch (e) {
                console.error("Telegram fetch error:", e);
                return;
            }
            if (!res.ok) return;

            let data;
            try {
                data = await res.json();
            } catch (e) {
                console.error("JSON parse error:", e);
                return;
            }
            
            if (!data.ok || !data.result || !data.result.length) return;

            // Process all updates
            for (const update of data.result) {
                if (update.update_id > this.lastUpdateId) {
                    this.lastUpdateId = update.update_id;
                }
                
                const msg = update.message || update.edited_message || null;
                if (!msg) continue;

                const text = msg.text || "";
                const chatId = msg.chat && msg.chat.id ? String(msg.chat.id) : "";
                let photoBase64 = "";

                // Handle photo if present
                if (msg.photo && msg.photo.length) {
                    const fileId = msg.photo[msg.photo.length - 1].file_id;
                    try {
                        const infoRes = await fetch(
                            `https://api.telegram.org/bot${this.tg}/getFile?file_id=${fileId}`
                        );
                        const infoJson = await infoRes.json();
                        const path = infoJson.result && infoJson.result.file_path;
                        if (path) {
                            const fileRes = await fetch(
                                `https://api.telegram.org/file/bot${this.tg}/${path}`
                            );
                            const blob = await fileRes.blob();
                            photoBase64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                        }
                    } catch (e) {
                        console.error("Photo fetch error:", e);
                        photoBase64 = "";
                    }
                }

                let commandName = "";
                let commandText = "";

                if (text.startsWith("/")) {
                    const spaceIndex = text.indexOf(" ");
                    const rawCmd = spaceIndex === -1 ? text.slice(1) : text.slice(1, spaceIndex);
                    const rest = spaceIndex === -1 ? "" : text.slice(spaceIndex + 1);
                    commandName = rawCmd;
                    commandText = rest;
                }

                // Store the event
                this.lastEvent = {
                    command: commandName,
                    text: commandText,
                    photo: photoBase64,
                    chatId: chatId,
                    stamp: Date.now() + Math.random() // Ensure unique stamp
                };
                
                // Add to pending updates for processing
                this.pendingUpdates.push({...this.lastEvent});
            }
        }

        /* -------------------- TRIGGER LOGIC -------------------- */
        async whenCommand(args) {
            const cmd = args.CMD.trim();
            
            // Poll for updates first
            await this.pollUpdates();
            
            // Check if we have any pending updates
            if (this.pendingUpdates.length === 0) return false;
            
            // Find the first matching command in pending updates
            for (let i = 0; i < this.pendingUpdates.length; i++) {
                const event = this.pendingUpdates[i];
                if (event.command === cmd) {
                    // Remove this event from pending
                    this.pendingUpdates.splice(i, 1);
                    // Set as current event
                    this.lastEvent = event;
                    this.lastTriggeredStamp = event.stamp;
                    return true;
                }
            }
            
            return false;
        }

        /* -------------------- REPORTERS -------------------- */
        getCommandText() {
            return this.lastEvent.text || "";
        }

        getCommandPhoto() {
            return this.lastEvent.photo || "";
        }

        getChatId() {
            return this.lastEvent.chatId || "";
        }

        /* -------------------- TELEGRAM SEND -------------------- */
        async sendMessage(args) {
            if (!this.tg) return;
            const chat = args.CHAT;
            const msg = args.MSG;
            if (!chat) return;

            try {
                await fetch(`https://api.telegram.org/bot${this.tg}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `chat_id=${encodeURIComponent(chat)}&text=${encodeURIComponent(msg)}`
                });
            } catch (e) {
                console.error("Send message error:", e);
            }
        }

        /* -------------------- DEEPSEEK -------------------- */
        async deepseekReply(args) {
            if (!this.ds) return "";
            const msg = args.MSG || "";
            try {
                const r = await fetch("https://api.deepseek.com/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.ds}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [{ role: "user", content: msg }]
                    })
                });
                const j = await r.json();
                return j.choices?.[0]?.message?.content || "";
            } catch (e) {
                console.error("DeepSeek error:", e);
                return "";
            }
        }

        async deepseekVisionReply(args) {
            if (!this.ds) return "";
            const img = args.IMG || "";
            const txt = args.TXT || "";
            try {
                const r = await fetch("https://api.deepseek.com/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.ds}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: txt },
                                    { type: "image_url", image_url: { url: img } }
                                ]
                            }
                        ]
                    })
                });
                const j = await r.json();
                return j.choices?.[0]?.message?.content || "";
            } catch (e) {
                console.error("DeepSeek vision error:", e);
                return "";
            }
        }

        /* -------------------- UNIVERSAL HTTP -------------------- */
        async httpRequest(args) {
            const url = args.URL || "";
            const body = args.BODY || "";

            if (!url) return "";

            try {
                const r = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: body
                });

                return await r.text();
            } catch (e) {
                return String(e);
            }
        }
    }

    Scratch.extensions.register(new DeepSeekTelegram());
})(Scratch);
