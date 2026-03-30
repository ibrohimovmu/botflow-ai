import os
import google.generativeai as genai

# Setup
API_KEY = "LhDxSf1WJmkFLqHM6IgyP0VlpNjtmIMM"
genai.configure(api_key=API_KEY)

print("--- AI DIAGNOSTICS START ---")

try:
    print("Listing available models...")
    models = genai.list_models()
    model_list = []
    for m in models:
        print(f"FOUND: {m.name} (Methods: {m.supported_generation_methods})")
        if "generateContent" in m.supported_generation_methods:
            model_list.append(m.name)
    
    print(f"\nDiscovered {len(model_list)} compatible models.")
    
    for m_name in model_list:
        print(f"Testing model: {m_name}...", end=" ", flush=True)
        try:
            model = genai.GenerativeModel(m_name)
            response = model.generate_content("Salom!")
            if response and response.text:
                print("SUCCESS")
                print(f"Response: {response.text.strip()}")
                break
        except Exception as e:
            print(f"ERR ({str(e)[:50]})")

except Exception as global_e:
    print(f"GLOBAL ERROR: {global_e}")

print("--- DIAGNOSTICS COMPLETE ---")
