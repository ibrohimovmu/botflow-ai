import requests

API_KEY = "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"

def test(name, url, headers, data):
    print(f"Testing {name}...", end=" ", flush=True)
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=10)
        if resp.status_code == 200:
            print("SUCCESS")
            print(f"Response: {resp.text[:100]}...")
            return True
        else:
            print(f"FAILED ({resp.status_code}: {resp.text[:100]})")
            return False
    except Exception as e:
        print(f"ERROR ({str(e)[:50]})")
        return False

# Mistral
test("Mistral", "https://api.mistral.ai/v1/chat/completions", 
     {"Authorization": f"Bearer {API_KEY}"}, 
     {"model": "mistral-tiny", "messages": [{"role": "user", "content": "hi"}]})

# OpenRouter (raw)
test("OpenRouter (raw)", "https://openrouter.ai/api/v1/chat/completions", 
     {"Authorization": f"Bearer {API_KEY}"}, 
     {"model": "mistralai/mistral-7b-instruct:free", "messages": [{"role": "user", "content": "hi"}]})

# OpenRouter (with prefix)
test("OpenRouter (prefix)", "https://openrouter.ai/api/v1/chat/completions", 
     {"Authorization": f"Bearer sk-or-v1-{API_KEY}"}, 
     {"model": "mistralai/mistral-7b-instruct:free", "messages": [{"role": "user", "content": "hi"}]})

# Groq
test("Groq", "https://api.groq.com/openai/v1/chat/completions", 
     {"Authorization": f"Bearer {API_KEY}"}, 
     {"model": "llama3-8b-8192", "messages": [{"role": "user", "content": "hi"}]})
