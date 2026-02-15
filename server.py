import os
import time
import subprocess
from flask import Flask, request, Response
from urllib.parse import quote, unquote

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COMMAND_FILE = os.path.join(BASE_DIR, "command.txt")
RESPONSE_FILE = os.path.join(BASE_DIR, "response.txt")
CONNECT_SCRIPT = os.path.join(BASE_DIR, "connect.pyw")

def ensure_connect_running():
    # На Windows .pyw
    if os.name == "nt":
        # Проверяем по имени процесса грубо: если нужно — можно усилить
        # Здесь просто всегда пытаемся запустить, OS сама не создаст второй, если настроить иначе
        subprocess.Popen(["pythonw", CONNECT_SCRIPT], cwd=BASE_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        subprocess.Popen(["python", CONNECT_SCRIPT], cwd=BASE_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def write_command(cmd_type, **kwargs):
    parts = [cmd_type]
    for k, v in kwargs.items():
        if v is None:
            v = ""
        parts.append(f"{k}={quote(str(v), safe='')}")
    data = "|".join(parts)
    with open(COMMAND_FILE, "w", encoding="utf-8") as f:
        f.write(data)

def wait_response(timeout=10.0):
    start = time.time()
    while time.time() - start < timeout:
        if os.path.exists(RESPONSE_FILE):
            with open(RESPONSE_FILE, "r", encoding="utf-8") as f:
                data = f.read()
            os.remove(RESPONSE_FILE)
            return data
        time.sleep(0.05)
    return ""

@app.route("/telegram/getUpdates", methods=["POST"])
def telegram_get_updates():
    ensure_connect_running()
    body = request.get_json(force=True)
    token = body.get("token", "")
    offset = body.get("offset", 0)

    write_command("GET_UPDATES", token=token, offset=offset)
    resp = wait_response()
    if not resp:
        return Response("{}", mimetype="application/json")
    return Response(resp, mimetype="application/json")

@app.route("/telegram/sendMessage", methods=["POST"])
def telegram_send_message():
    ensure_connect_running()
    body = request.get_json(force=True)
    token = body.get("token", "")
    chat_id = body.get("chat_id", "")
    text = body.get("text", "")

    write_command("SEND_MESSAGE", token=token, chat_id=chat_id, text=text)
    resp = wait_response()
    if not resp:
        return Response("{}", mimetype="application/json")
    return Response(resp, mimetype="application/json")

@app.route("/deepseek/chat", methods=["POST"])
def deepseek_chat():
    ensure_connect_running()
    body = request.get_json(force=True)
    api_key = body.get("apiKey", "")
    prompt = body.get("prompt", "")
    chat_id = body.get("chat_id", "")

    write_command("DEEPSEEK_CHAT", api_key=api_key, prompt=prompt, chat_id=chat_id)
    resp = wait_response()
    if not resp:
        return Response("{}", mimetype="application/json")
    return Response(resp, mimetype="application/json")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000)
