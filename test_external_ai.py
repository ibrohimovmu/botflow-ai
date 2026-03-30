import requests
import json

# The key provided by the user
API_KEY = "LhDxSf1WJmkFLqHM6IgyP0VlpNjtmIMM"

def test_mistral():
    print("--- MISTRAL TEST START ---")
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    data = {
        "model": "mistral-tiny",
        "messages": [{"role": "user", "content": "Salom!"}]
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_openrouter():
    print("\n--- OPENROUTER TEST START ---")
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "mistralai/mistral-7b-instruct:free",
        "messages": [{"role": "user", "content": "Salom!"}]
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

test_mistral()
test_openrouter()
