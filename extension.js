(function(Scratch) {
    const vm = Scratch.vm;

    let TELEGRAM_TOKEN = "";
    let DEEPSEEK_API_KEY = "";
    let LAST_UPDATE_ID = 0;

    class DeepSeekTelegram {
        getInfo() {
            return {
                id: "deepseektelegram",
                name: "DeepSeek Telegram Bot",
                blocks: [
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
                        opcode: "getUpdates",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "get Telegram updates"
                    },
                    {
                        opcode: "getLastMessageText",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "last message text"
                    },
                    {
                        opcode: "getLastChatId",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "last chat id"
                    },
                    {
                        opcode: "sendDeepSeekReply",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "reply with DeepSeek to [MSG] for chat [CHAT]",
                        arguments: {
                            MSG: { type: Scratch.ArgumentType.STRING },
                            CHAT: { type: Scratch.ArgumentType.STRING }
                        }
                    },
                    {
                        opcode: "sendPlainMessage",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "send message [MSG] to chat [CHAT]",
                        arguments: {
                            MSG: { type: Scratch.ArgumentType.STRING },
                            CHAT: { type: Scratch.ArgumentType.STRING }
                        }
                    }
                ]
            };
        }

        setTokens(args) {
            TELEGRAM_TOKEN = args.TG;
            DEEPSEEK_API_KEY = args.DS;
        }

        async getUpdates() {
            if (!TELEGRAM_TOKEN) return "";
            const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?offset=${LAST_UPDATE_ID + 1}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.ok || !data.result || !data.result.length) return "";
            const last = data.result[data.result.length - 1];
            LAST_UPDATE_ID = last.update_id;
            this._lastMessage = last;
            return JSON.stringify(data.result);
        }

        getLastMessageText() {
            if (!this._lastMessage) return "";
            if (!this._lastMessage.message || !this._lastMessage.message.text) return "";
            return this._lastMessage.message.text;
        }

        getLastChatId() {
            if (!this._lastMessage) return "";
            if (!this._lastMessage.message || !this._lastMessage.message.chat || !this._lastMessage.message.chat.id) return "";
            return String(this._lastMessage.message.chat.id);
        }

        async sendDeepSeekReply(args) {
            if (!DEEPSEEK_API_KEY || !TELEGRAM_TOKEN) return;
            const prompt = args.MSG;
            const chatId = args.CHAT;

            const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{ role: "user", content: prompt }]
                })
            });

            const deepseekData = await deepseekResponse.json();
            if (!deepseekData.choices || !deepseekData.choices.length) return;
            const answer = deepseekData.choices[0].message.content;

            await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: answer
                })
            });
        }

        async sendPlainMessage(args) {
            if (!TELEGRAM_TOKEN) return;
            const msg = args.MSG;
            const chatId = args.CHAT;

            await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: msg
                })
            });
        }
    }

    Scratch.extensions.register(new DeepSeekTelegram());
})(Scratch);
