import random
import string
import os
from PIL import Image, ImageDraw, ImageFont

def generate_captcha():
    """Generates a random captcha string and its image representation."""
    char_list = string.ascii_uppercase + string.digits
    captcha_text = ''.join(random.choices(char_list, k=5))
    
    # Create image
    width, height = 200, 80
    bg_color = (random.randint(200, 255), random.randint(200, 255), random.randint(200, 255))
    image = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(image)
    
    # Try to load a font, fallback to default
    try:
        # On Windows, Arial is usually present. On Linux, we might need to check paths.
        font_path = "arial.ttf" if os.name == 'nt' else "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        font = ImageFont.truetype(font_path, 40)
    except:
        font = ImageFont.load_default()
        
    # Draw text
    for i, char in enumerate(captcha_text):
        char_color = (random.randint(0, 100), random.randint(0, 100), random.randint(0, 100))
        # Random position for each char
        pos = (20 + i * 35, random.randint(10, 30))
        draw.text(pos, char, font=font, fill=char_color)
        
    # Add noise (lines)
    for _ in range(5):
        line_color = (random.randint(100, 150), random.randint(100, 150), random.randint(100, 150))
        draw.line([random.randint(0, width), random.randint(0, height), random.randint(0, width), random.randint(0, height)], fill=line_color, width=2)
        
    # Save to buffer
    import io
    buf = io.BytesIO()
    image.save(buf, format='PNG')
    buf.seek(0)
    
    return captcha_text, buf

if __name__ == "__main__":
    text, img = generate_captcha()
    with open("test_captcha.png", "wb") as f:
        f.write(img.read())
    print(f"Generated captcha: {text}")
