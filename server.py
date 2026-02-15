from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.post("/telegram/getUpdates")
def tg_updates():
    data = request.json
    token = data.get("token")
    offset = data.get("offset", 0)
    url = f"https://api.telegram.org/bot{token}/getUpdates?offset={offset}"
    r = requests.get(url)
    return jsonify(r.json())

@app.post("/telegram/sendMessage")
def tg_send():
    data = request.json
    token = data.get("token")
    chat_id = data.get("chat_id")
    text = data.get("text")
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    r = requests.post(url, json={"chat_id": chat_id, "text": text})
    return jsonify(r.json())

@app.post("/deepseek/chat")
def deepseek_chat():
    data = request.json
    api_key = data.get("apiKey")
    prompt = data.get("prompt")
    url = "https://api.deepseek.com/v1/chat/completions"
    r = requests.post(url, json={
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}]
    }, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    })
    return jsonify(r.json())

app.run(port=3000)
